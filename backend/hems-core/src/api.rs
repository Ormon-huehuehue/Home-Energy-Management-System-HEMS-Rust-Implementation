use axum::{
    extract::{Path, State},
    Json,
};
use sqlx::SqlitePool;
use crate::models::{EnergyData, Device};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct DeviceControl {
    pub is_on: bool,
}

pub async fn get_latest_energy(State(pool): State<SqlitePool>) -> Json<Option<EnergyData>> {
    let data = sqlx::query_as!(
        EnergyData,
        r#"
        SELECT id, timestamp, grid_import, grid_export, solar_generation, battery_charge, battery_discharge, home_consumption, battery_soc
        FROM energy_data
        ORDER BY id DESC
        LIMIT 1
        "#
    )
    .fetch_optional(&pool)
    .await
    .unwrap_or(None);

    Json(data)
}

pub async fn get_devices(State(pool): State<SqlitePool>) -> Json<Vec<Device>> {
    let devices = sqlx::query_as!(
        Device,
        "SELECT id, name, device_type, power_rating, is_on, priority FROM devices"
    )
    .fetch_all(&pool)
    .await
    .unwrap_or_default();

    Json(devices)
}

pub async fn control_device(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(payload): Json<DeviceControl>,
) -> Json<bool> {
    let result = sqlx::query!(
        "UPDATE devices SET is_on = ? WHERE id = ?",
        payload.is_on,
        id
    )
    .execute(&pool)
    .await;

    match result {
        Ok(_) => Json(true),
        Err(_) => Json(false),
    }
}
