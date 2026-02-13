import React, { useEffect, useState } from "react";
import { User, Activity, AlertCircle, Box, Clock } from "lucide-react";

export default function VideoFeed({ onData }) {
    const [data, setData] = useState([]);
    const [health, setHealth] = useState({ fps: 0, latency: 0, status: 'WAITING' });
    const [heatmap, setHeatmap] = useState(new Array(100).fill(0));

    useEffect(() => {
        const id = setInterval(async () => {
            try {
                const res = await fetch("http://localhost:8000/stream");
                const envelope = await res.json();
                const json = envelope.data || [];

                setData(json);
                setHealth(envelope.health || {});
                onData(json);

                setHeatmap(prev => {
                    const next = [...prev];
                    json.forEach(d => {
                        const idx = Math.floor(Math.random() * 100);
                        next[idx] = Math.min(next[idx] + (d.risk_score * 0.2), 1.0);
                    });
                    return next.map(v => v * 0.95);
                });
            } catch (e) { console.error("Link fail"); }
        }, 1000);
        return () => clearInterval(id);
    }, [onData]);

    return (
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* System Health Overlay */}
            <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, background: 'rgba(0,0,0,0.8)', padding: '5px 10px', borderRadius: '4px', fontSize: '0.55rem', fontFamily: 'var(--font-mono)', border: '1px solid #222' }}>
                <span style={{ color: health.status === 'ONLINE' ? 'var(--color-success)' : 'var(--color-warning)' }}>● {health.status}</span> | FPS: {health.fps} | LAT: {health.latency}ms
            </div>

            <div className="heatmap-overlay" style={{ opacity: 0.15 }}>
                {heatmap.map((v, i) => <div key={i} className="heatmap-cell" style={{ background: `rgba(255, 255, 255, ${v})` }}></div>)}
            </div>

            <div className="decision-stream" style={{ position: 'relative', zIndex: 1 }}>
                <div className="decision-row" style={{ background: '#0d0d0d', color: 'var(--text-muted)', fontSize: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div>ENTITY_ID // STATE</div>
                    <div>HYPOTHESES & CONFIDENCE</div>
                    <div style={{ textAlign: 'center' }}>SCORE</div>
                    <div style={{ textAlign: 'right' }}>DECISION</div>
                </div>

                {data.map((d) => (
                    <div key={d.person_id} style={{ borderBottom: '1px solid #111', background: d.decision !== 'PROCEED' ? 'rgba(255, 30, 30, 0.03)' : 'transparent' }}>
                        <div className="decision-row" style={{ borderBottom: 'none', paddingBottom: '5px' }}>
                            <div className="entity-label" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={10} /> {d.person_id}</div>
                                <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', marginTop: '4px' }}>STATE: <b style={{ color: '#fff' }}>[{d.state}]</b></div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span className="signature-tag">{d.pattern || 'TRANSIENT'}</span>
                                    <div style={{ fontSize: '0.6rem', color: d.confidence < 0.6 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
                                        CONF: <b>{(d.confidence * 100).toFixed(0)}%</b>
                                    </div>
                                </div>
                                {/* Competing Hypotheses View */}
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {(d.hypotheses || []).map(([name, weight], i) => (
                                        <div key={i} style={{ fontSize: '0.55rem', background: i === 0 ? '#222' : '#111', padding: '2px 6px', border: '1px solid #333', borderRadius: '2px', opacity: i === 0 ? 1 : 0.5 }}>
                                            {name}: {(weight * 100).toFixed(0)}%
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                                <div style={{ fontSize: '0.8rem' }}>{Math.min(d.risk_score * 100, 100).toFixed(1)}%</div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <span className={`status-badge status-${d.decision}`}>
                                    {d.decision.split('_')[0]}
                                </span>
                            </div>
                        </div>

                        <div style={{ padding: '0 15px 12px 95px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p className="rationale-text" style={{ flex: 1, margin: 0 }}>
                                    <Activity size={10} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                    {d.rationale}
                                </p>
                                {d.prediction && (
                                    <div style={{ background: 'var(--color-danger)', color: '#fff', fontSize: '0.55rem', padding: '2px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={10} /> {d.prediction}
                                    </div>
                                )}
                            </div>

                            <div className="entity-trail">
                                {(d.trail || []).map((pos, idx) => (
                                    <div key={idx} className="trail-dot" style={{ opacity: (idx + 1) / d.trail.length, backgroundColor: d.risk_score > 0.6 ? 'var(--color-danger)' : d.risk_score > 0.3 ? 'var(--color-warning)' : 'var(--text-muted)' }} />
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '8px', opacity: 0.5, marginTop: '8px' }}>
                                <button className="verified-btn" style={{ fontSize: '0.5rem' }}>REWIND_5S</button>
                                <button className="verified-btn" style={{ fontSize: '0.5rem' }}>FORENSIC_SNAPSHOT</button>
                            </div>
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div style={{ padding: '40px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                        <div className="live-pulse"></div> ANALYZING_TEMPORAL_GRAPHS...
                    </div>
                )}
            </div>
        </div>
    );
}
