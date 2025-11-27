use sqlx::SqlitePool;
use tokio::time::{Duration};
use chrono::{Utc, Timelike, NaiveDateTime};
use rand::Rng;

use std::sync::Arc;
use tokio::sync::Mutex;
use crate::models::Device;

use std::collections::HashMap;
use std::time::Instant;

pub struct Simulator {
    pool: SqlitePool,
    current_time: Arc<Mutex<NaiveDateTime>>,
    user_overrides: Arc<Mutex<HashMap<i64, Instant>>>,
    load_shifting_enabled: Arc<Mutex<bool>>,
}

impl Simulator {
    pub fn new(pool: SqlitePool, user_overrides: Arc<Mutex<HashMap<i64, Instant>>>, load_shifting_enabled: Arc<Mutex<bool>>) -> Self {
        Self { 
            pool,
            current_time: Arc::new(Mutex::new(Utc::now().naive_utc())),
            user_overrides,
            load_shifting_enabled,
        }
    }

    pub async fn start(&self) {
        let mut interval = tokio::time::interval(Duration::from_secs(2));
        loop {
            interval.tick().await;
            
            // Advance time by 30 minutes
            {
                let mut time = self.current_time.lock().await;
                *time += chrono::Duration::minutes(30);
            }

            if let Err(e) = self.generate_data().await {
                tracing::error!("Simulation error: {}", e);
            }
        }
    }

    async fn generate_data(&self) -> Result<(), sqlx::Error> {
        let now = *self.current_time.lock().await;

        // Fetch devices to calculate real load
        let mut devices = sqlx::query_as!(
            Device,
            "SELECT id, name, device_type, power_rating, is_on, priority FROM devices"
        )
        .fetch_all(&self.pool)
        .await?;

        // Automated Demand Response (Load Shifting)
        let hour = now.hour() as f64 + now.minute() as f64 / 60.0;
        let is_peak = hour >= 18.0 && hour < 22.0;
        let is_post_peak = hour >= 22.0 && hour < 22.5; // 30 mins after peak to restore

        let shifting_enabled = *self.load_shifting_enabled.lock().await;

        for device in &mut devices {
            if shifting_enabled && device.priority < 2 { // Low priority
                if is_peak && device.is_on {
                    // Check for user override
                    let last_override = {
                        let overrides = self.user_overrides.lock().await;
                        overrides.get(&device.id).cloned()
                    };

                    let should_turn_off = match last_override {
                        Some(time) => time.elapsed().as_secs() > 24, // Override lasts 24 seconds(6 simulated hours)
                        None => true,
                    };

                    if should_turn_off {
                        tracing::info!("Peak Shaving: Turning OFF {}", device.name);
                        sqlx::query!("UPDATE devices SET is_on = 0 WHERE id = ?", device.id)
                            .execute(&self.pool)
                            .await?;
                        device.is_on = false; // Update local state for load calc
                    }
                } else if is_post_peak && !device.is_on {
                    // Restore after peak
                    tracing::info!("Peak Over: Restoring {}", device.name);
                    sqlx::query!("UPDATE devices SET is_on = 1 WHERE id = ?", device.id)
                        .execute(&self.pool)
                        .await?;
                    device.is_on = true;
                }
            }
        }
        
        let (solar_generation, home_consumption, battery_soc) = {
            let mut rng = rand::rng();
            
            // Solar: Peak at noon (simple Gaussian-like curve)
            let hour = now.hour() as f64 + now.minute() as f64 / 60.0;
            let solar_potential = if hour > 6.0 && hour < 18.0 {
                let peak = 2.0; // 2kW peak
                let x = (hour - 12.0) / 3.0; // Width factor
                peak * (-x * x).exp()
            } else {
                0.0
            };
            let solar_generation = (solar_potential * rng.random_range(0.8..1.0)).max(0.0);

            // Load: Base + Active Devices
            let base_load = 0.1; // 100W base load (always on stuff)
            
            // Calculate load from active devices
            let active_device_load: f64 = devices.iter()
                .filter(|d| d.is_on)
                .map(|d| d.power_rating)
                .sum();

            // Random fluctuation (noise) to make it look real
            // Range: -0.1kW to +0.3kW
            let fluctuation = rng.random_range(-0.1..0.3);
            
            let home_consumption = (base_load + active_device_load + fluctuation).max(0.0);
            
            // Mock SOC
            let battery_soc = 50.0 + rng.random_range(-1.0..1.0);
            
            (solar_generation, home_consumption, battery_soc)
        };

        // Battery logic (simplified)
        let net_energy = solar_generation - home_consumption;
        
        let (battery_charge, battery_discharge, grid_import, grid_export) = if net_energy > 0.0 {
            // Excess energy -> Charge battery or Export
            let charge = net_energy.min(3.0); // Max charge 3kW
            let export = net_energy - charge;
            (charge, 0.0, 0.0, export)
        } else {
            // Deficit -> Discharge battery or Import
            let deficit = -net_energy;
            let discharge = deficit.min(3.0); // Max discharge 3kW
            let import = deficit - discharge;
            (0.0, discharge, import, 0.0)
        }; 

        sqlx::query!(
            r#"
            INSERT INTO energy_data (timestamp, grid_import, grid_export, solar_generation, battery_charge, battery_discharge, home_consumption, battery_soc)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            now, grid_import, grid_export, solar_generation, battery_charge, battery_discharge, home_consumption, battery_soc
        )
        .execute(&self.pool)
        .await?;
        
        tracing::info!("Generated: Solar={:.2}kW, Load={:.2}kW, SOC={:.1}%", solar_generation, home_consumption, battery_soc);
        Ok(())
    }
}
