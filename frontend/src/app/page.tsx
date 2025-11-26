"use client";

import { useEffect, useState, useRef } from 'react';
import { Sun, Battery, Zap, Home, Activity, Info } from 'lucide-react';
import EnergyCard from '@/components/EnergyCard';
import DeviceList from '@/components/DeviceList';
import EnergyChart from '@/components/EnergyChart';
import TheorySection from '@/components/TheorySection';
import { EnergyData, Device } from '@/types';

export default function Dashboard() {
    const [energyData, setEnergyData] = useState<EnergyData[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [latest, setLatest] = useState<EnergyData | null>(null);
    const [toast, setToast] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
    const pendingToggle = useRef<Set<number>>(new Set());

    const fetchData = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            
            // Fetch latest energy data
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

            // Check for automated actions
            if (devices.length > 0) {
                devicesJson.forEach((newDev: Device) => {
                    const oldDev = devices.find(d => d.id === newDev.id);
                    
                    // Cleanup pending toggles if state matches intent (or just clear it if state changed)
                    if (pendingToggle.current.has(newDev.id)) {
                         // If we see a change, assume it was our pending action
                         if (oldDev && oldDev.is_on !== newDev.is_on) {
                             pendingToggle.current.delete(newDev.id);
                         }
                         return; // Skip toast logic for user actions
                    }

                    // Detect System Auto-Off
                    if (oldDev && oldDev.is_on && !newDev.is_on) {
                        setToast({
                            show: true,
                            message: `${newDev.name} was switched off to reduce grid import.`
                        });
                        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
                    }
                    
                    // Detect System Auto-On (Optional: Add toast for this too if desired)
                    if (oldDev && !oldDev.is_on && newDev.is_on) {
                         setToast({
                            show: true,
                            message: `${newDev.name} was switched back on (Non-Peak Hour).`
                        });
                        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
                    }
                });
            }

            setDevices(devicesJson);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, [devices]); // Add devices to dep array so we can compare old vs new

    const handleDeviceToggle = async (id: number, currentState: boolean) => {
        try {
            pendingToggle.current.add(id); // Mark as user action
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            await fetch(`${apiUrl}/api/devices/${id}/control`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_on: !currentState })
            });
            fetchData(); 
        } catch (error) {
            console.error("Failed to toggle device", error);
            pendingToggle.current.delete(id); // Revert if failed
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

            {/* Toast Notification */}
            {toast.show && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    animation: 'slideIn 0.3s ease-out',
                    zIndex: 1000
                }}>
                    <Info size={20} color="var(--accent)" />
                    <span style={{ fontSize: '0.9rem', color: 'var(--foreground)' }}>{toast.message}</span>
                </div>
            )}
        </main>
    );
}
