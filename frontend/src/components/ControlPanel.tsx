import { Zap } from 'lucide-react';

interface ControlPanelProps {
    loadShiftingEnabled: boolean;
    onToggle: () => void;
}

export default function ControlPanel({ loadShiftingEnabled, onToggle }: ControlPanelProps) {
    return (
        <div className="card" style={{ gridColumn: 'span 4' }}>
            <div className="card-header">
                <div className="card-title">
                    <Zap size={16} />
                    System Controls
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>Automated Load Shifting</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>
                        Automatically turn off low-priority devices during peak hours (18:00 - 22:00) to reduce grid import costs.
                    </p>
                </div>
                <button 
                    onClick={onToggle}
                    className={`btn ${loadShiftingEnabled ? 'btn-active' : ''}`}
                    style={{ minWidth: '140px' }}
                >
                    {loadShiftingEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
            </div>
        </div>
    );
}
