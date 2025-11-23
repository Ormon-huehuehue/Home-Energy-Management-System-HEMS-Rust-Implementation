# Home Energy Management System (HEMS)

A production-grade **Home Energy Management System** developed for the "Smart Grid Technologies" course. This project simulates a modern smart home environment, optimizing energy flow between Solar PV, Battery Storage, Grid, and Household Loads.

![Dashboard Preview](https://via.placeholder.com/800x400?text=HEMS+Dashboard+Preview)

## 📚 What is HEMS?

A **Home Energy Management System (HEMS)** is a technology platform that monitors, manages, and optimizes the flow of energy within a smart home. It acts as the central brain of a modern electrical grid interface, bridging the gap between the utility provider and household consumption.

### Key Objectives

1.  **Maximize Self-Consumption**: Prioritize using locally generated renewable energy (Solar PV) over grid imports.
2.  **Load Shifting**: Store excess energy in batteries during the day and discharge it during peak demand hours.
3.  **Grid Stability**: Respond to demand-response signals (simulated) to reduce stress on the main grid.
4.  **Cost Reduction**: Minimize electricity bills by reducing grid reliance.

---

## 🏗️ System Architecture

The project follows a decoupled **Client-Server** architecture, ensuring scalability and separation of concerns.

### 1. Backend (The Core)

**Tech Stack**: Rust, Axum, Tokio, SQLite, SQLx, Tracing

The backend is the "brain" of the system. It is responsible for:

- **Simulation Engine**: A continuous asynchronous loop (running on `Tokio`) that generates realistic telemetry data.
  - _Solar_: Uses a Gaussian distribution curve to simulate daylight hours.
  - _Load_: Uses stochastic models to simulate random appliance usage spikes.
  - _Battery_: Implements charge/discharge logic based on energy surplus/deficit.
- **Data Persistence**: All telemetry and device states are stored in a **SQLite** database. We use **SQLx** for compile-time checked SQL queries, ensuring type safety.
- **REST API**: Exposes endpoints for the frontend to fetch data and control devices.

**Key Files**:

- `src/simulation.rs`: Contains the physics logic for energy generation and consumption.
- `src/models.rs`: Defines the Rust structs that map to database tables.
- `src/api.rs`: Handles HTTP requests and routing.

### 2. Frontend (The Interface)

**Tech Stack**: Next.js 14 (App Router), React, TypeScript, Recharts, CSS Modules

The frontend is the "face" of the system. It provides a real-time dashboard for the user.

- **Real-time Polling**: Fetches fresh data from the backend every 2 seconds to provide a "live" feel.
- **Data Visualization**: Uses **Recharts** to render interactive area charts showing energy flow over time.
- **Design System**: A custom, minimalist **Black & White** design system implemented with CSS variables. It focuses on high contrast and readability.
- **Device Control**: Allows users to toggle smart appliances (HVAC, EV Charger) remotely.

---

## 📂 Project Structure

```
smart-grid/
├── backend/
│   ├── hems-core/
│   │   ├── migrations/         # SQL database migrations
│   │   ├── src/
│   │   │   ├── api.rs          # REST API endpoints
│   │   │   ├── main.rs         # Entry point & Server setup
│   │   │   ├── models.rs       # Data structures
│   │   │   └── simulation.rs   # Energy physics engine
│   │   ├── Cargo.toml          # Rust dependencies
│   │   └── hems.db             # SQLite database (generated)
│   └── Cargo.toml              # Workspace configuration
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css     # Design system & tokens
│   │   │   └── page.tsx        # Main dashboard view
│   │   ├── components/         # Reusable UI components
│   │   │   ├── DeviceList.tsx
│   │   │   ├── EnergyCard.tsx
│   │   │   ├── EnergyChart.tsx
│   │   │   └── TheorySection.tsx
│   │   └── types/              # TypeScript interfaces
│   ├── next.config.ts          # API Proxy configuration
│   └── package.json            # Node dependencies
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Rust** (latest stable)
- **Node.js** (LTS) & **npm**
- **SQLite3**

### Step 1: Start the Backend

The backend handles the database creation and simulation.

```bash
cd backend/hems-core

# The app uses .env for configuration (already set up)
# DATABASE_URL=sqlite:hems.db

# Run the server
# This will automatically create the DB and run migrations
cargo run
```

_Server will start on `http://127.0.0.1:3000`_

### Step 2: Start the Frontend

Open a new terminal window.

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

_Dashboard will be available at `http://localhost:3001`_

---

## 🧪 Verification

1.  **Check Simulation**: Observe the "Solar Generation" value on the dashboard. It should rise and fall based on the simulated time of day.
2.  **Test Controls**: Click the "Active/Inactive" button on the **HVAC** device. The status should update instantly, and the "Home Consumption" value should reflect the load change.
3.  **View History**: The chart at the bottom tracks the last 20 data points, showing the correlation between solar production and home usage.
