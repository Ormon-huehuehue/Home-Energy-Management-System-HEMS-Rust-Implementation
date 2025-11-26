use axum::{
    extract::{Path, State},
    Json,
};
use crate::models::{EnergyData, Device};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct DeviceControl {
    pub is_on: bool,
}

use crate::AppState;
use std::time::Instant;

pub async fn get_latest_energy(State(state): State<AppState>) -> Json<Option<EnergyData>> {
    let data = sqlx::query_as!(
        EnergyData,
        r#"
        SELECT id, timestamp, grid_import, grid_export, solar_generation, battery_charge, battery_discharge, home_consumption, battery_soc
        FROM energy_data
        ORDER BY id DESC
        LIMIT 1
        "#
    )
    .fetch_optional(&state.pool)
    .await
    .unwrap_or(None);

    Json(data)
}

pub async fn get_devices(State(state): State<AppState>) -> Json<Vec<Device>> {
    let devices = sqlx::query_as!(
        Device,
        "SELECT id, name, device_type, power_rating, is_on, priority FROM devices"
    )
    .fetch_all(&state.pool)
    .await
    .unwrap_or_default();

    Json(devices)
}

pub async fn control_device(
    State(state): State<AppState>,
    Path(id): Path<i64>,
    Json(payload): Json<DeviceControl>,
) -> Json<bool> {
    // Record user override
    {
        let mut overrides = state.user_overrides.lock().await;
        overrides.insert(id, Instant::now());
    }

    let result = sqlx::query!(
        "UPDATE devices SET is_on = ? WHERE id = ?",
        payload.is_on,
        id
    )
    .execute(&state.pool)
    .await;

    match result {
        Ok(_) => Json(true),
        Err(_) => Json(false),
    }
}
