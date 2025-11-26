"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EnergyData } from '@/types';

interface EnergyChartProps {
    data: EnergyData[];
}

export default function EnergyChart({ data }: EnergyChartProps) {
    // Format data for chart
    const chartData = data.map(d => ({
        time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        solar: d.solar_generation,
        consumption: d.home_consumption,
        battery: d.battery_discharge > 0 ? -d.battery_discharge : d.battery_charge
    }));
    // Note: Removed .reverse() as data should be chronological

    return (
        <div className="card" style={{ gridColumn: 'span 4', height: '500px', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
                <div className="card-title">Energy Flow History</div>
            </div>
            <div style={{ flex: 1, minHeight: 0, marginLeft: '-1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                        <XAxis 
                            dataKey="time" 
                            stroke="#525252" 
                            tick={{fill: '#737373', fontSize: 11}} 
                            tickLine={false}
                            axisLine={false}
                            dy={15}
                        />
                        <YAxis 
                            stroke="#525252" 
                            tick={{fill: '#737373', fontSize: 11}} 
                            tickLine={false}
                            axisLine={false}
                            dx={-15}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#0a0a0a', 
                                border: '1px solid #262626',
                                borderRadius: '0',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                            }}
                            itemStyle={{ color: '#e5e5e5', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                            labelStyle={{ color: '#a3a3a3', marginBottom: '0.5rem', fontSize: '11px' }}
                        />
                        <Area 
                            type="step" 
                            dataKey="solar" 
                            stroke="#e5e5e5" 
                            strokeWidth={1.5}
                            fill="none" 
                            name="Solar" 
                            isAnimationActive={false}
                        />
                        <Area 
                            type="step" 
                            dataKey="consumption" 
                            stroke="#525252" 
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            fill="none" 
                            name="Load" 
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
