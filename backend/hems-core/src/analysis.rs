use serde::Serialize;
use std::error::Error;
use std::fs;
use std::path::Path;
use rand::Rng;
use sqlx::SqlitePool;
use crate::models::Device;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Scenario {
    Baseline,
    Solar,
    SmartShift,
}

#[derive(Debug, Serialize, Clone)]
pub struct AnalysisRecord {
    pub time_step: String,
    pub scenario: String,
    pub solar_generation: f64,
    pub home_consumption: f64,
    pub grid_import: f64,
    pub grid_export: f64,
    pub cost: f64,
    pub is_peak: bool,
}

pub async fn run_analysis(pool: &SqlitePool) -> Result<(Vec<String>, String, Vec<AnalysisRecord>), Box<dyn Error>> {
    let scenarios = vec![Scenario::Baseline, Scenario::Solar, Scenario::SmartShift];
    let mut file_paths = Vec::new();
    let mut summary = String::new();
    let mut all_records = Vec::new();

    // Fetch devices from DB
    let devices = sqlx::query_as!(
        Device,
        "SELECT id, name, device_type, power_rating, is_on, priority FROM devices"
    )
    .fetch_all(pool)
    .await?;

    // Pre-calculate Solar Profile for consistency
    let mut solar_profile = Vec::new();
    let mut rng = rand::rng();
    for step in 0..48 {
        let hour = step as f64 / 2.0;
        let solar_potential = if hour > 6.0 && hour < 18.0 {
            let peak = 2.0;
            let x = (hour - 12.0) / 3.0;
            peak * (-x * x).exp()
        } else {
            0.0
        };
        let solar_generation = (solar_potential * rng.random_range(0.8..1.0)).max(0.0);
        solar_profile.push(solar_generation);
    }

    // Ensure reports directory exists
    let reports_dir = "reports";
    if !Path::new(reports_dir).exists() {
        fs::create_dir(reports_dir)?;
    }

    for scenario in scenarios {
        let (records, total_cost, total_grid_import, _total_consumption) = simulate_day(scenario, &devices, &solar_profile);
        
        let filename = format!("{}/analysis_{:?}.csv", reports_dir, scenario);
        let mut wtr = csv::Writer::from_path(&filename)?;
        
        for record in &records {
            wtr.serialize(record)?;
        }
        wtr.flush()?;
        
        file_paths.push(filename);
        summary.push_str(&format!("\nScenario: {:?}\nTotal Cost: ${:.2}\nTotal Grid Import: {:.2} kWh\n", scenario, total_cost, total_grid_import));
        all_records.extend(records);
    }

    Ok((file_paths, summary, all_records))
}

fn simulate_day(scenario: Scenario, devices: &[Device], solar_profile: &[f64]) -> (Vec<AnalysisRecord>, f64, f64, f64) {
    let mut records = Vec::new();
    let mut total_cost = 0.0;
    let mut total_consumption = 0.0;
    let mut total_grid_import = 0.0;
    
    // Calculate potential load from currently ON devices
    let active_devices: Vec<&Device> = devices.iter().filter(|d| d.is_on).collect();
    let total_potential_load: f64 = active_devices.iter().map(|d| d.power_rating).sum();

    // Track deferred energy for SmartShift
    let mut deferred_energy = 0.0; // kWh

    // Simulate 24 hours in 30-minute intervals (48 steps)
    for step in 0..48 {
        let hour = step as f64 / 2.0;
        let is_peak = hour >= 18.0 && hour < 22.0;
        
        // Solar Generation
        let solar_generation = if matches!(scenario, Scenario::Baseline) {
            0.0 // Baseline: No solar, pure grid import
        } else {
            solar_profile[step]
        };

        // Base Load
        let base_load = 0.1; // 100W base load
        
        // Appliance Load Logic
        let mut appliance_load = 0.0;

        match scenario {
            Scenario::Baseline | Scenario::Solar => {
                // Standard operation: All active devices run all day
                appliance_load = total_potential_load;
            },
            Scenario::SmartShift => {
                if is_peak {
                    // During peak: Turn off low priority devices and defer their energy
                    for device in &active_devices {
                        if device.priority < 2 {
                            // Shifted (Turned Off)
                            // Add to deferred energy. Power * Time (0.5h)
                            deferred_energy += device.power_rating * 0.5;
                        } else {
                            appliance_load += device.power_rating;
                        }
                    }
                } else {
                    // Off-peak: Run standard load + Rebound deferred energy
                    appliance_load = total_potential_load;
                    
                    // If we are AFTER peak (e.g., after 22:00), try to consume deferred energy
                    if hour >= 22.0 && deferred_energy > 0.0 {
                        // We must consume all deferred energy before midnight to ensure fair comparison (same total work)
                        // Calculate remaining steps (including this one)
                        let remaining_steps = 48 - step;
                        
                        // Distribute remaining energy evenly across remaining steps
                        // This simulates running the deferred appliances in parallel or faster
                        let energy_per_step = deferred_energy / remaining_steps as f64;
                        
                        appliance_load += energy_per_step / 0.5; // Convert energy back to power (kW)
                        
                        // We don't subtract from deferred_energy here because we recalculate 'remaining' each step
                        // Actually, simpler: just take the chunk we decided to use.
                        deferred_energy -= energy_per_step;
                    }
                }
            }
        }

        let home_consumption = base_load + appliance_load;
        let net_energy = solar_generation - home_consumption;
        
        let (grid_import, grid_export) = if net_energy > 0.0 {
            (0.0, net_energy)
        } else {
            (-net_energy, 0.0)
        };

        // Calculate Cost
        let rate = if is_peak { 0.30 } else { 0.10 };
        let cost = grid_import * rate * 0.5; // kWh * rate (0.5h interval)
        
        total_cost += cost;
        total_consumption += home_consumption * 0.5;
        total_grid_import += grid_import * 0.5;

        records.push(AnalysisRecord {
            time_step: format!("{:02}:{:02}", hour.trunc() as i32, (hour.fract() * 60.0) as i32),
            scenario: format!("{:?}", scenario),
            solar_generation,
            home_consumption,
            grid_import,
            grid_export,
            cost,
            is_peak,
        });
    }
    
    (records, total_cost, total_grid_import, total_consumption)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn get_mock_devices() -> Vec<Device> {
        vec![
            Device { id: 1, name: "Test".to_string(), device_type: "test".to_string(), power_rating: 1.0, is_on: true, priority: 1 },
            Device { id: 2, name: "Critical".to_string(), device_type: "test".to_string(), power_rating: 0.5, is_on: true, priority: 2 },
        ]
    }

    #[test]
    fn test_simulation_runs() {
        let devices = get_mock_devices();
        let solar_profile = vec![0.0; 48];
        let (records, cost, grid_import, consumption) = simulate_day(Scenario::Baseline, &devices, &solar_profile);
        assert_eq!(records.len(), 48);
        assert!(cost > 0.0);
        assert!(grid_import > 0.0);
        assert!(consumption > 0.0);
    }

    #[test]
    fn test_scenarios_differ() {
        let devices = get_mock_devices();
        let solar_profile = vec![1.0; 48]; // High solar for testing
        let (_, cost_baseline, _, consumption_baseline) = simulate_day(Scenario::Baseline, &devices, &solar_profile);
        let (_, cost_smart, _, consumption_smart) = simulate_day(Scenario::SmartShift, &devices, &solar_profile);
        
        // SmartShift should be cheaper than Baseline (due to solar + shifting)
        assert!(cost_smart <= cost_baseline);

        // CRITICAL: Total consumption must be equal (fair comparison)
        // Use a small epsilon for floating point comparison
        assert!((consumption_baseline - consumption_smart).abs() < 0.001, 
            "Total consumption should be equal! Baseline: {}, Smart: {}", consumption_baseline, consumption_smart);
    }
}
