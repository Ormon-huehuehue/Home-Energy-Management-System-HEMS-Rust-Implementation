export default function TheorySection() {
    return (
        <section style={{ maxWidth: '1800px', margin: '0 auto', padding: '0 3rem 4rem 3rem' }}>
            <div className="card">
                <div className="card-header">
                    <div className="card-title">System Architecture & Theory</div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem', color: 'var(--secondary)' }}>
                    <div>
                        <h3 style={{ color: 'var(--foreground)', fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 500 }}>What is HEMS?</h3>
                        <p style={{ marginBottom: '1.5rem', lineHeight: '1.7' }}>
                            A <strong>Home Energy Management System (HEMS)</strong> is a technology platform that monitors, manages, and optimizes the flow of energy within a smart home. 
                            It acts as the central brain of a modern electrical grid interface, bridging the gap between the utility provider and household consumption.
                        </p>
                        <p style={{ marginBottom: '1.5rem', lineHeight: '1.7' }}>
                            <strong>Key Objectives:</strong>
                        </p>
                        <ul style={{ listStyle: 'none', paddingLeft: '0', display: 'grid', gap: '0.75rem' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ width: '4px', height: '4px', background: 'var(--foreground)', borderRadius: '50%' }}></span>
                                Maximize self-consumption of renewable energy (Solar PV).
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ width: '4px', height: '4px', background: 'var(--foreground)', borderRadius: '50%' }}></span>
                                Shift loads to off-peak hours to reduce costs.
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ width: '4px', height: '4px', background: 'var(--foreground)', borderRadius: '50%' }}></span>
                                Maintain grid stability through demand response.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 style={{ color: 'var(--foreground)', fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 500 }}>Implementation Details</h3>
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            <div>
                                <h4 style={{ color: 'var(--foreground)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Backend (Rust Core)</h4>
                                <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                                    Built with <strong>Rust</strong> for memory safety and high performance. The core service (<code>hems-core</code>) runs an asynchronous simulation loop using <code>Tokio</code>. 
                                    It generates realistic energy patterns using Gaussian distribution for solar curves and stochastic models for load spikes. 
                                    Data is persisted in <strong>SQLite</strong> via <code>SQLx</code> for type-safe database interactions.
                                </p>
                            </div>
                            <div>
                                <h4 style={{ color: 'var(--foreground)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Frontend (Next.js)</h4>
                                <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                                    A <strong>Next.js</strong> application provides the real-time dashboard. It polls the Rust API every 2 seconds to fetch the latest telemetry. 
                                    The UI follows a strict <strong>Minimalist Monochrome</strong> design system, utilizing CSS variables for theming and <code>Recharts</code> for data visualization.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
