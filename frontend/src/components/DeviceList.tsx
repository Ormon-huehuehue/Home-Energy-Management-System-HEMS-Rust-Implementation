"use client";

import { Device } from '@/types';
import { Power, Zap } from 'lucide-react';

interface DeviceListProps {
    devices: Device[];
    onToggle: (id: number, currentState: boolean) => void;
}

export default function DeviceList({ devices, onToggle }: DeviceListProps) {
    return (
        <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="card-header">
                <div className="card-title">
                    <Zap size={20} strokeWidth={1.5} />
                    Connected Devices
                </div>
            </div>
            <div style={{ display: 'grid', gap: '1px', backgroundColor: 'var(--card-border)', border: '1px solid var(--card-border)' }}>
                {devices.map((device) => (
                    <div key={device.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '2rem',
                        backgroundColor: 'var(--card-bg)',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f0f0f'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg)'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div style={{ 
                                color: device.is_on ? 'var(--foreground)' : 'var(--muted)',
                                transition: 'color 0.2s'
                            }}>
                                <Power size={24} strokeWidth={1} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 500, marginBottom: '0.5rem', fontSize: '1rem' }}>{device.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {device.power_rating} kW • Priority {device.priority}
                                </div>
                            </div>
                        </div>
                        <button 
                            className={`btn ${device.is_on ? 'btn-active' : ''}`}
                            onClick={() => onToggle(device.id, device.is_on)}
                        >
                            {device.is_on ? 'Active' : 'Inactive'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
