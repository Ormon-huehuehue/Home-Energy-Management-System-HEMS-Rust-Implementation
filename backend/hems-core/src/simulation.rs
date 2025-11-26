use sqlx::SqlitePool;
use tokio::time::{Duration};
use chrono::{Utc, Timelike};
use rand::Rng;

pub struct Simulator {
    pool: SqlitePool,
}

impl Simulator {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn start(&self) {
        let mut interval = tokio::time::interval(Duration::from_secs(5));
        loop {
            interval.tick().await;
            if let Err(e) = self.generate_data().await {
                tracing::error!("Simulation error: {}", e);
            }
        }
    }

    async fn generate_data(&self) -> Result<(), sqlx::Error> {
        let now = Utc::now().naive_utc();
        
        let (solar_generation, home_consumption, battery_soc) = {
            let mut rng = rand::rng();
            
            // Solar: Peak at noon (simple Gaussian-like curve)
            let hour = now.hour() as f64 + now.minute() as f64 / 60.0;
            let solar_potential = if hour > 6.0 && hour < 18.0 {
                let peak = 5.0; // 5kW peak
                let x = (hour - 12.0) / 3.0; // Width factor
                peak * (-x * x).exp()
            } else {
                0.0
            };
            let solar_generation = (solar_potential * rng.random_range(0.8..1.0)).max(0.0);

            // Load: Base + random spikes
            let base_load = 0.5; // 500W
            let load_spike = if rng.random_bool(0.1) { 2.0 } else { 0.0 };
            let home_consumption = base_load + load_spike + rng.random_range(0.0..0.2);
            
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
