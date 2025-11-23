# Home Energy Management System (HEMS)

A production-ready Home Energy Management System built with **Rust** (Axum, SQLx, SQLite) and **Next.js**.

## Features

- **Real-time Monitoring**: Visualize Solar, Grid, Battery, and Home consumption.
- **Simulation Engine**: Generates realistic energy data patterns.
- **Device Control**: Remote control of smart devices (EV Charger, HVAC, etc.).
- **Historical Data**: Interactive charts showing energy flow over time.
- **Premium UI**: Modern, dark-mode dashboard with responsive design.

## Prerequisites

- Rust (latest stable)
- Node.js (LTS) & npm
- SQLite3

## Getting Started

### 1. Backend (Rust)

The backend handles data simulation, database management, and API endpoints.

```bash
cd backend/hems-core
# Create .env file (already created)
# DATABASE_URL=sqlite:hems.db

# Run the server (this will also create the DB and run migrations)
cargo run
```

Server runs on `http://localhost:3000`.

### 2. Frontend (Next.js)

The frontend provides the user interface.

```bash
cd frontend
npm install
npm run dev
```

Dashboard runs on `http://localhost:3001` (or 3000 if backend is on a different port, but proxy is configured for 3000).

**Note**: The frontend proxies API requests to `http://127.0.0.1:3000`. Ensure the backend is running.

## Architecture

- **Backend**: Rust, Axum, SQLx, Tokio, SQLite.
- **Frontend**: Next.js 14 (App Router), React, Recharts, Lucide Icons.
- **Styling**: Vanilla CSS with CSS Variables (Design Tokens).

## Simulation

The system simulates:

- **Solar**: Gaussian curve peaking at noon.
- **Load**: Base load + random spikes.
- **Battery**: Charges when excess solar, discharges when deficit.
