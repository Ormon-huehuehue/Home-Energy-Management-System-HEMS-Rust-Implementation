export interface EnergyData {
    id: number;
    timestamp: string;
    grid_import: number;
    grid_export: number;
    solar_generation: number;
    battery_charge: number;
    battery_discharge: number;
    home_consumption: number;
    battery_soc: number;
}

export interface Device {
    id: number;
    name: string;
    device_type: string;
    power_rating: number;
    is_on: boolean;
    priority: number;
}
