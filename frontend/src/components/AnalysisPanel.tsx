"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, Loader2 } from 'lucide-react';

interface AnalysisRecord {
    time_step: string;
    scenario: string;
    solar_generation: number;
    home_consumption: number;
    grid_import: number;
    grid_export: number;
    cost: number;
    is_peak: boolean;
}

interface AnalysisResponse {
    success: boolean;
    files: string[];
    summary: string;
    data: AnalysisRecord[];
}

export default function AnalysisPanel() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<AnalysisRecord[]>([]);
    const [summary, setSummary] = useState<string>("");

    const runAnalysis = async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            const res = await fetch(`${apiUrl}/api/analysis/generate`, {
                method: 'POST'
            });
            const json: AnalysisResponse = await res.json();
            
            if (json.success) {
                setData(json.data);
                setSummary(json.summary);
            }
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        runAnalysis();
    }, []);

    // Aggregate data for chart
    // We want to compare total cost or consumption per scenario
    
    const scenarioOrder = ["Baseline", "Solar", "SmartShift"];
    
    const rawChartData = data.reduce((acc, curr) => {
        if (!acc[curr.scenario]) {
            acc[curr.scenario] = {
                name: curr.scenario,
                Cost: 0,
                Consumption: 0,
                Import: 0
            };
        }
        acc[curr.scenario].Cost += curr.cost;
        acc[curr.scenario].Consumption += curr.home_consumption * 0.5; // kWh
        acc[curr.scenario].Import += curr.grid_import * 0.5; // kWh
        return acc;
    }, {} as Record<string, any>);

    const chartData = scenarioOrder.map(s => rawChartData[s]).filter(Boolean);

    return (
        <div className="card" style={{ gridColumn: 'span 4' }}>
            <div className="card-header">
                <div className="card-title">
                    <Play size={16} />
                    Scenario Analysis
                </div>
                <button 
                    onClick={runAnalysis}
                    disabled={loading}
                    className={`btn ${loading ? '' : 'btn-active'}`}
                    style={{ minWidth: '140px' }}
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'REFRESH'}
                </button>
            </div>

            {data.length > 0 && (
                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                    <div style={{ flex: 1, height: '300px' }}>
                        <h4 style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--secondary)' }}>Cost Comparison ($)</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                <XAxis dataKey="name" stroke="#525252" tick={{fill: '#737373', fontSize: 11}} />
                                <YAxis stroke="#525252" tick={{fill: '#737373', fontSize: 11}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #262626' }}
                                    itemStyle={{ color: '#e5e5e5' }}
                                />
                                <Bar dataKey="Cost" fill="#ef4444" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ flex: 1, height: '300px' }}>
                        <h4 style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--secondary)' }}>Grid Import (kWh)</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                <XAxis dataKey="name" stroke="#525252" tick={{fill: '#737373', fontSize: 11}} />
                                <YAxis stroke="#525252" tick={{fill: '#737373', fontSize: 11}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #262626' }}
                                    itemStyle={{ color: '#e5e5e5' }}
                                />
                                <Bar dataKey="Import" fill="#3b82f6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
            
            {summary && (
                <pre style={{ 
                    marginTop: '2rem', 
                    padding: '1rem', 
                    background: '#171717', 
                    borderRadius: '6px', 
                    fontSize: '0.8rem', 
                    color: '#a3a3a3',
                    overflowX: 'auto'
                }}>
                    {summary.trim()}
                </pre>
            )}
        </div>
    );
}
