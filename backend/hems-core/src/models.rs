use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::NaiveDateTime;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct EnergyData {
    pub id: i64,
    pub timestamp: NaiveDateTime,
    pub grid_import: f64, // kW
    pub grid_export: f64, // kW
    pub solar_generation: f64, // kW
    pub battery_charge: f64, // kW
    pub battery_discharge: f64, // kW
    pub home_consumption: f64, // kW
    pub battery_soc: f64, // State of Charge %
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Device {
    pub id: i64,
    pub name: String,
    pub device_type: String, // e.g., "washing_machine", "ev_charger"
    pub power_rating: f64, // kW
    pub is_on: bool,
    pub priority: i64, // Higher number = higher priority
}

