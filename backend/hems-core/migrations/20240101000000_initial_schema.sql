CREATE TABLE IF NOT EXISTS energy_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME NOT NULL,
    grid_import REAL NOT NULL,
    grid_export REAL NOT NULL,
    solar_generation REAL NOT NULL,
    battery_charge REAL NOT NULL,
    battery_discharge REAL NOT NULL,
    home_consumption REAL NOT NULL,
    battery_soc REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    device_type TEXT NOT NULL,
    power_rating REAL NOT NULL,
    is_on BOOLEAN NOT NULL DEFAULT 0,
    priority INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tariffs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rate REAL NOT NULL,
    start_hour INTEGER NOT NULL,
    end_hour INTEGER NOT NULL
);

-- Seed some initial devices
INSERT INTO devices (name, device_type, power_rating, is_on, priority) VALUES 
('Washing Machine', 'washing_machine', 1.5, 0, 1),
('EV Charger', 'ev_charger', 7.0, 0, 2),
('HVAC', 'hvac', 3.0, 1, 3);

-- Seed some tariff data (Time of Use)
INSERT INTO tariffs (name, rate, start_hour, end_hour) VALUES
('Off-Peak', 0.10, 0, 6),
('Peak', 0.30, 17, 21),
('Standard', 0.15, 6, 17),
('Standard-Late', 0.15, 21, 24);
