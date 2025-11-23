import { LucideIcon } from 'lucide-react';

interface EnergyCardProps {
    title: string;
    value: number;
    unit: string;
    icon: LucideIcon;
    subValue?: string;
}

export default function EnergyCard({ title, value, unit, icon: Icon, subValue }: EnergyCardProps) {
    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">
                    <Icon size={18} strokeWidth={1.5} />
                    {title}
                </div>
            </div>
            <div className="value-display">
                {value.toFixed(2)}
                <span className="unit">{unit}</span>
            </div>
            {subValue && <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: '1rem', letterSpacing: '0.05em' }}>{subValue}</div>}
        </div>
    );
}
