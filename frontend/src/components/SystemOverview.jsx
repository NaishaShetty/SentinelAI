import React from 'react';
import { Shield, ArrowDown, Activity, Brain, UserCheck, Eye, Map, Cpu } from 'lucide-react';

export default function SystemOverview() {
    return (
        <div className="overview-container">
            <header className="overview-hero">
                <h2>The SentinelAI Architecture</h2>
                <p className="info-text" style={{ fontSize: '1rem' }}>
                    SentinelAI is a real-time, memory-aware vision system that monitors human behavior
                    and prioritizes safety by abstaining from automated decisions under uncertainty.
                </p>
            </header>

            <div className="overview-grid">
                {/* Visual Architecture */}
                <section>
                    <h3 className="panel-title" style={{ marginBottom: '25px' }}><Cpu size={14} /> Processing Pipeline</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="arch-node"><Eye size={12} /> INGESTION (HEVC/RTSP)</div>
                        <div className="arch-arrow"><ArrowDown size={14} /></div>
                        <div className="arch-node"><Brain size={12} /> YOLOv8 CV ENGINE</div>
                        <div className="arch-arrow"><ArrowDown size={14} /></div>
                        <div className="arch-node"><Activity size={12} /> MOTION VECTOR EXTRACTOR</div>
                        <div className="arch-arrow"><ArrowDown size={14} /></div>
                        <div className="arch-node" style={{ borderColor: 'var(--text-secondary)' }}>
                            TEMPORAL RISK MEMORY
                        </div>
                        <div className="arch-arrow"><ArrowDown size={14} /></div>
                        <div className="arch-node" style={{ background: 'var(--text-primary)', color: 'var(--bg-color)' }}>
                            S-LOGIC DECISION
                        </div>

                        <div className="arch-arrow"><ArrowDown size={14} /></div>
                        <div className="arch-node"><UserCheck size={12} /> HUMAN OVERSIGHT</div>
                    </div>
                </section>

                {/* State Logic */}
                <section>
                    <h3 className="panel-title" style={{ marginBottom: '25px' }}><Activity size={14} /> Formal State Machine</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="logic-card" style={{ borderLeft: '3px solid var(--text-muted)' }}>
                            <h3 style={{ color: 'var(--text-muted)' }}>OBSERVING [IDLE]</h3>
                            <p className="info-text">
                                System in high-readiness state. Vision reliability is 100%. No behavioral anomalies detected in current temporal window.
                            </p>
                        </div>
                        <div className="logic-card" style={{ borderLeft: '3px solid var(--color-warning)' }}>
                            <h3 style={{ color: 'var(--color-warning)' }}>WARNING [ACTIVE]</h3>
                            <p className="info-text">
                                Anomalous patterns detected. Temporal confidence is degrading. Secondary hypotheses are being evaluated for escalation.
                            </p>
                        </div>
                        <div className="logic-card" style={{ borderLeft: '3px solid var(--color-danger)' }}>
                            <h3 style={{ color: 'var(--color-danger)' }}>ABSTAINED [SAFETY_LOCK]</h3>
                            <p className="info-text">
                                Risk index critical or confidence too low. Automated processing disabled to prevent false positives. Manual verification required.
                            </p>
                        </div>
                        <div className="logic-card" style={{ borderLeft: '3px solid #333' }}>
                            <h3 style={{ color: '#fff' }}>COOLDOWN [STABILIZING]</h3>
                            <p className="info-text">
                                Post-abstention state. Risk decay is throttled (Safety Persistence) to prevent oscillation and ensure behavioral stability before resumption.
                            </p>
                        </div>
                    </div>
                </section>

            </div>

            <section className="philosophy-section">
                <h3 className="panel-title" style={{ color: 'var(--text-primary)', marginBottom: '15px' }}>
                    // Why Abstention Matters
                </h3>
                <p className="info-text" style={{ maxWidth: '800px' }}>
                    In safety-critical AI, <b>forced predictions are dangerous.</b> Most systems try to classify every event, often delivering high-confidence errors. SentinelAI is designed to realize when it "doesn't know," falling back to human expertise during edge cases. This approach mirrors the operational protocols of smart infrastructure and public safety networks.
                </p>
            </section>

            <div className="overview-grid" style={{ marginTop: '0' }}>
                <section>
                    <h3 className="panel-title" style={{ marginBottom: '25px' }}><Brain size={14} /> Memory & Decay Logic</h3>
                    <p className="info-text">
                        Behavior is not a snapshot; it's a duration. Risk in SentinelAI is <b>cumulative</b>:
                    </p>
                    <ul className="info-text" style={{ paddingLeft: '20px' }}>
                        <li>Individual anomalous bursts increase the risk score instantly.</li>
                        <li>Sustained anomalies result in exponential growth (Risk Scalability).</li>
                        <li>A <b>0.85 decay factor</b> ensures that normalization of behavior eventually restores the safety state.</li>
                    </ul>
                </section>

                <section>
                    <h3 className="panel-title" style={{ marginBottom: '25px' }}><Map size={14} /> Application Domains</h3>
                    <div className="tag-list">
                        {['Public Safety', 'Smart Buildings', 'Workplace Safety', 'Healthcare Observation', 'Perimeter Defense', 'Human-in-the-Loop CCTV'].map(domain => (
                            <span key={domain} className="tag" style={{ padding: '8px 15px', fontSize: '0.65rem' }}>{domain}</span>
                        ))}
                    </div>
                </section>
            </div>

            <footer style={{ marginTop: '60px', padding: '40px 0', borderTop: '1px solid var(--border-color)', opacity: 0.5 }}>
                <p className="info-text" style={{ fontSize: '0.6rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    SENTINELAI // V1.0.4 CORE OVERSEE // BUILT FOR HIGH-RELIABILITY ENVIRONMENTS
                </p>
            </footer>
        </div>
    );
}
