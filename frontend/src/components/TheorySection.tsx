export default function TheorySection() {
    return (
        <section style={{ maxWidth: '1800px', margin: '0 auto', padding: '0 3rem 6rem 3rem' }}>
            <div className="card">
                <div className="card-header">
                    <div className="card-title">System Architecture & Theory</div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '5rem', color: 'var(--secondary)' }}>
                    <div>
                        <h3 style={{ color: 'var(--foreground)', fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 500 }}>Home Energy Management System (HEMS)</h3>
                        <p style={{ marginBottom: '1.5rem', lineHeight: '1.8', fontSize: '1rem' }}>
                            A <strong>Home Energy Management System (HEMS)</strong> is an advanced cyber-physical system designed to optimize the generation, storage, and consumption of energy within a smart household. 
                            As the grid transitions towards a decentralized model, HEMS plays a critical role in enabling <strong>Demand Side Management (DSM)</strong>.
                        </p>
                        <p style={{ marginBottom: '1.5rem', lineHeight: '1.8', fontSize: '1rem' }}>
                            This project implements a centralized HEMS architecture that interfaces with:
                        </p>
                        <ul style={{ listStyle: 'none', paddingLeft: '0', display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ width: '6px', height: '6px', background: 'var(--foreground)', borderRadius: '50%' }}></span>
                                <strong>Distributed Energy Resources (DERs)</strong>: Solar PV arrays.
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ width: '6px', height: '6px', background: 'var(--foreground)', borderRadius: '50%' }}></span>
                                <strong>Energy Storage Systems (ESS)</strong>: Battery banks for load shifting.
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ width: '6px', height: '6px', background: 'var(--foreground)', borderRadius: '50%' }}></span>
                                <strong>Smart Loads</strong>: Controllable appliances (HVAC, EV Chargers).
                            </li>
                        </ul>
                        
                        <h4 style={{ color: 'var(--foreground)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', marginTop: '3rem' }}>Control Strategy</h4>
                        <p style={{ lineHeight: '1.8', fontSize: '1rem' }}>
                            The system employs a <strong>Rule-Based Control (RBC)</strong> algorithm. The logic prioritizes self-consumption of solar energy. 
                            When generation exceeds demand, the excess is directed to the battery. If the battery is full, it exports to the grid. 
                            Conversely, during peak load or low generation, the battery discharges to minimize grid import, thereby reducing the electricity bill and grid stress.
                        </p>
                    </div>

                    <div>
                        <h3 style={{ color: 'var(--foreground)', fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 500 }}>Technical Implementation</h3>
                        <div style={{ display: 'grid', gap: '3rem' }}>
                            <div>
                                <h4 style={{ color: 'var(--foreground)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Backend: Rust & Axum</h4>
                                <p style={{ lineHeight: '1.7', fontSize: '1rem' }}>
                                    The core logic is implemented in <strong>Rust</strong>, chosen for its memory safety and zero-cost abstractions. 
                                    The <code>hems-core</code> service runs a continuous simulation loop (using <code>Tokio</code> tasks) that models energy physics. 
                                    It calculates instantaneous power flow based on time-of-day (solar curves) and stochastic load probabilities.
                                    State is managed in a <strong>SQLite</strong> database, accessed via <code>SQLx</code> for compile-time verified queries.
                                </p>
                            </div>
                            <div>
                                <h4 style={{ color: 'var(--foreground)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Frontend: Next.js & Real-time Data</h4>
                                <p style={{ lineHeight: '1.7', fontSize: '1rem' }}>
                                    The user interface is built with <strong>Next.js</strong>. It employs a polling mechanism to fetch high-frequency telemetry data from the Rust API. 
                                    The dashboard features a <strong>custom Design System</strong> built with CSS variables, enforcing a strict monochrome aesthetic. 
                                    Data visualization is handled by <code>Recharts</code>, rendering responsive SVG charts that update in real-time without page reloads.
                                </p>
                            </div>
                            {/* <div>
                                <h4 style={{ color: 'var(--foreground)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Future Scope</h4>
                                <p style={{ lineHeight: '1.7', fontSize: '1rem' }}>
                                    Future iterations could integrate <strong>Model Predictive Control (MPC)</strong> to optimize energy flow based on weather forecasts and dynamic pricing tariffs. 
                                    Additionally, integration with physical hardware via Modbus/MQTT would transition this from a simulation to a field-deployable solution.
                                </p>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
