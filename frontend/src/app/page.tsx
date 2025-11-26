"use client";

import { useEffect, useState } from 'react';
import { Sun, Battery, Zap, Home, Activity } from 'lucide-react';
import EnergyCard from '@/components/EnergyCard';
import DeviceList from '@/components/DeviceList';
import EnergyChart from '@/components/EnergyChart';
import TheorySection from '@/components/TheorySection';
import { EnergyData, Device } from '@/types';

export default function Dashboard() {
    const [energyData, setEnergyData] = useState<EnergyData[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [latest, setLatest] = useState<EnergyData | null>(null);

    const fetchData = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            
            // Fetch latest energy data (mocking history by keeping local state for now, 
            // in real app we'd fetch history endpoint)
            const energyRes = await fetch(`${apiUrl}/api/energy`, { cache: 'no-store' });
            const energyJson = await energyRes.json();
            
            if (energyJson) {
                setLatest(energyJson);
                setEnergyData(prev => {
                    const lastEntry = prev[prev.length - 1];
                    if (!lastEntry || lastEntry.id !== energyJson.id) {
                        return [...prev.slice(-19), energyJson];
                    }
                    return prev;
                });
            }

            const devicesRes = await fetch(`${apiUrl}/api/devices`, { cache: 'no-store' });
            const devicesJson = await devicesRes.json();
            setDevices(devicesJson);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleDeviceToggle = async (id: number, currentState: boolean) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            await fetch(`${apiUrl}/api/devices/${id}/control`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_on: !currentState })
            });
            fetchData(); // Refresh immediately
        } catch (error) {
            console.error("Failed to toggle device", error);
        }
    };

    if (!latest) return <div className="loading">Loading System...</div>;

    return (
        <main>
            <header className="dashboard-header">
                <div>
                    <h1 className="app-title">
                        <Activity size={32} strokeWidth={1.5} />
                        Smart Grid Control Center
                    </h1>
                    <p className="app-subtitle">Real-time Energy Management System</p>
                </div>
                <div className="status-container">
                    <div className="status-label">System Status</div>
                    <div className="status-indicator">
                        <span className="status-dot"></span>
                        Online
                    </div>
                </div>
            </header>

            <div className="dashboard-grid">
                {/* Key Metrics */}
                <EnergyCard 
                    title="Solar Generation" 
                    value={latest.solar_generation} 
                    unit="kW" 
                    icon={Sun} 
                />
                <EnergyCard 
                    title="Grid Import" 
                    value={latest.grid_import} 
                    unit="kW" 
                    icon={Zap} 
                    subValue={`Export: ${latest.grid_export.toFixed(2)} kW`}
                />
                <EnergyCard 
                    title="Battery Storage" 
                    value={latest.battery_soc} 
                    unit="%" 
                    icon={Battery} 
                    subValue={latest.battery_charge > 0 ? `Charging: ${latest.battery_charge.toFixed(2)} kW` : `Discharging: ${latest.battery_discharge.toFixed(2)} kW`}
                />
                <EnergyCard 
                    title="Home Consumption" 
                    value={latest.home_consumption} 
                    unit="kW" 
                    icon={Home} 
                />

                {/* Charts & Controls */}
                <EnergyChart data={energyData} />
                <DeviceList devices={devices} onToggle={handleDeviceToggle} />
            </div>
            
            <TheorySection />
            
            {/* Debug View */}
            {/* <div style={{ padding: '1rem', background: '#111', color: '#0f0', fontFamily: 'monospace', fontSize: '12px', marginTop: '2rem' }}>
                <h3>Debug Info</h3>
                <div>Latest ID: {latest?.id}</div>
                <div>Data Points: {energyData.length}</div>
                <div>Last Fetch: {new Date().toLocaleTimeString()}</div>
                <pre>{JSON.stringify(energyData.slice(-2), null, 2)}</pre>
            </div> */}
        </main>
    );
}
