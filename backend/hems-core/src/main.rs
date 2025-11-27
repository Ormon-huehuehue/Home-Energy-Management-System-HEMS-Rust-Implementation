mod models;
mod simulation;
mod api;
mod analysis;

use axum::{
    routing::get,
    Router,
};
use sqlx::sqlite::{SqlitePoolOptions, SqliteConnectOptions};
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use tower_http::cors::{Any, CorsLayer};
use std::str::FromStr;

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use std::time::Instant;

use sqlx::SqlitePool;

#[derive(Clone)]
pub struct AppState {
    pub pool: SqlitePool,
    pub user_overrides: Arc<Mutex<HashMap<i64, Instant>>>,
    pub load_shifting_enabled: Arc<Mutex<bool>>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "hems_core=debug".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load .env
    dotenvy::dotenv().ok();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    // Connect to database
    let connection_options = SqliteConnectOptions::from_str(&database_url)?
        .create_if_missing(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(connection_options)
        .await?;

    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await?;

    tracing::info!("Migrations ran successfully");

    // Initialize AppState
    let user_overrides = Arc::new(Mutex::new(HashMap::new()));
    let load_shifting_enabled = Arc::new(Mutex::new(true)); // Default to enabled
    let app_state = AppState {
        pool: pool.clone(),
        user_overrides: user_overrides.clone(),
        load_shifting_enabled: load_shifting_enabled.clone(),
    };

    // Start Simulation
    let simulator = simulation::Simulator::new(pool.clone(), user_overrides.clone(), load_shifting_enabled.clone());
    tokio::spawn(async move {
        simulator.start().await;
    });

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build router
    let app = Router::new()
        .route("/", get(root))
        .route("/api/energy", get(api::get_latest_energy))
        .route("/api/devices", get(api::get_devices))
        .route("/api/devices/{id}/control", axum::routing::post(api::control_device))
        .route("/api/control/load-shifting", axum::routing::post(api::set_load_shifting).get(api::get_load_shifting))
        .route("/api/analysis/generate", axum::routing::post(api::generate_analysis_report))
        .layer(cors)
        .with_state(app_state);

    // Run server
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::info!("listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn root() -> &'static str {
    "HEMS Backend Running"
}
