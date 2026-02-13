import React, { useState, useEffect } from "react";
import VideoFeed from "./components/VideoFeed";
import RiskChart from "./components/RiskChart";
import Metrics from "./components/Metrics";
import SystemOverview from "./components/SystemOverview";
import { Shield, Activity, BarChart3, Database, Cpu, RefreshCw, Play, Pause, History, Lock, Eye, AlertTriangle, TrendingUp } from "lucide-react";
import { getApiUrl } from "./api";

export default function App() {
    const [data, setData] = useState([]);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('live');
    const [posture, setPosture] = useState('ACTIVE_WATCH');
    const [uptime, setUptime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [sensitivity, setSensitivity] = useState(1.0);
    const [auditLogs, setAuditLogs] = useState([]);
    const [sysMetrics, setSysMetrics] = useState({ total_abstentions: 0, avg_recovery_time: 0 });
    const [activeScenario, setActiveScenario] = useState('NORMAL');

    useEffect(() => {
        if (isPaused || activeTab !== 'live') return;
        const rawAvg = data.length > 0 ? data.reduce((acc, curr) => acc + curr.risk_score, 0) / data.length : 0;
        const avgRisk = Math.min(rawAvg, 1.0);
        setHistory(prev => [...prev, { time: new Date().toLocaleTimeString().split(' ')[0], risk: avgRisk }].slice(-40));
    }, [data, isPaused, activeTab]);

    useEffect(() => {
        const timer = setInterval(() => { if (!isPaused) setUptime(u => u + 1); }, 1000);
        return () => clearInterval(timer);
    }, [isPaused]);

    useEffect(() => {
        const fetchMetrics = () => {
            fetch(getApiUrl("/metrics")).then(r => r.json()).then(setSysMetrics);
        }
        const mTimer = setInterval(fetchMetrics, 5000);
        return () => clearInterval(mTimer);
    }, []);

    useEffect(() => {
        if (activeTab === 'audit') {
            fetch(getApiUrl("/audit")).then(r => r.json()).then(setAuditLogs);
        }
    }, [activeTab]);

    const handlePosture = async (val) => {
        setPosture(val);
        await fetch(getApiUrl(`/control/posture?value=${val}`), { method: 'POST' });
    };

    const handlePause = async () => {
        const nextState = !isPaused;
        await fetch(getApiUrl(`/control/pause?paused=${nextState}`), { method: 'POST' });
        setIsPaused(nextState);
    };

    const handleReset = async () => {
        await fetch(getApiUrl(`/control/reset`), { method: 'POST' });
    };

    const handleSensitivity = async (e) => {
        const val = parseFloat(e.target.value);
        setSensitivity(val);
        await fetch(getApiUrl(`/control/sensitivity?value=${val}`), { method: 'POST' });
    };

    const handleScenario = async (slug) => {
        setActiveScenario(slug);
        await fetch(getApiUrl(`/control/scenario?slug=${slug}`), { method: 'POST' });
    };

    const formatUptime = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
        const d = (s % 60).toString().padStart(2, '0');
        return `${h}:${m}:${d}`;
    };

    return (
        <div className="soc-app">
            <header className="soc-header">
                <div className="brand">
                    <Shield size={18} />
                    <h1>SentinelAI // Core</h1>
                </div>

                <nav className="nav-tabs">
                    {['live', 'overview', 'audit'].map(tab => (
                        <div key={tab} className={`nav-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            {tab.replace('_', ' ')}
                        </div>
                    ))}
                </nav>

                <div className="control-bar">
                    {activeTab === 'live' && (
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div className="telemetry-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                SENSITIVITY:
                                <input type="range" min="0.5" max="2.0" step="0.1" className="soc-slider" style={{ width: '100px' }} value={sensitivity} onChange={handleSensitivity} />
                                <b style={{ minWidth: '30px' }}>{sensitivity}x</b>
                            </div>

                            <div style={{ display: 'flex', background: '#111', padding: '2px', borderRadius: '4px', border: '1px solid #222' }}>
                                {[
                                    { id: 'STANDBY', icon: <Eye size={10} /> },
                                    { id: 'ACTIVE_WATCH', icon: <Lock size={10} /> },
                                    { id: 'ZERO_TRUST', icon: <AlertTriangle size={10} /> }
                                ].map(p => (
                                    <button key={p.id} className="soc-btn" style={{ border: 'none', background: posture === p.id ? '#333' : 'transparent', color: posture === p.id ? '#fff' : '#555' }} onClick={() => handlePosture(p.id)} title={p.id}>
                                        {p.icon}
                                    </button>
                                ))}
                            </div>
                            <button className="soc-btn" onClick={handleReset}><RefreshCw size={10} style={{ marginRight: '4px' }} /> RESET</button>
                            <button className={`soc-btn ${isPaused ? 'active' : ''}`} onClick={handlePause}>
                                {isPaused ? <Play size={10} /> : <Pause size={10} />}
                            </button>
                        </div>
                    )}
                </div>
                <div className="telemetry-row">
                    <div className="telemetry-item">UPTIME: <b>{formatUptime(uptime)}</b></div>
                </div>
            </header>

            {activeTab === 'live' && (
                <main className="soc-main">
                    <section className="panel" style={{ gridArea: '1 / 1 / 2 / 2' }}>
                        <header className="panel-header"><h2 className="panel-title"><Activity size={12} /> Live Engine Feed</h2></header>
                        <div className="panel-content" style={{ padding: 0, position: 'relative' }}>
                            <VideoFeed onData={setData} />
                        </div>
                    </section>

                    <aside className="panel" style={{ gridArea: '1 / 2 / 3 / 3' }}>
                        <header className="panel-header"><h2 className="panel-title"><Database size={12} /> Analytics</h2></header>
                        <div className="panel-content">
                            <Metrics data={data} sysMetrics={sysMetrics} />

                            <div style={{ marginTop: '30px', borderTop: '1px solid #111', paddingTop: '20px' }}>
                                <header className="panel-title"><TrendingUp size={12} /> Reliability Index</header>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                    <div className="stat-card">
                                        <div className="stat-label">Abstention_Rate</div>
                                        <div className="stat-value" style={{ fontSize: '1rem' }}>{sysMetrics.total_abstentions}</div>
                                        <p style={{ fontSize: '0.5rem', color: '#555', marginTop: '4px' }}>Frequency of safety-lock overrides.</p>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-label">Recovery_ETA</div>
                                        <div className="stat-value" style={{ fontSize: '1rem' }}>{sysMetrics.avg_recovery_time.toFixed(1)}s</div>
                                        <p style={{ fontSize: '0.5rem', color: '#555', marginTop: '4px' }}>Speed of return to safe state.</p>
                                    </div>

                                </div>
                            </div>

                            <div style={{ marginTop: '30px', borderTop: '1px solid #111', paddingTop: '20px' }}>
                                <header className="panel-title"><History size={12} /> Scenario Replay</header>
                                <div style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
                                    {[
                                        { id: 'NORMAL', title: 'Normal Walk', desc: 'Baseline behavior tracking' },
                                        { id: 'PACING', title: 'Pacing / Entry', desc: 'Anomalous stationary patterns' },
                                        { id: 'FALL', title: 'Sudden Fall', desc: 'Emergency response trigger' }
                                    ].map(s => (
                                        <div
                                            key={s.id}
                                            className={`scenario-card ${activeScenario === s.id ? 'active' : ''}`}
                                            onClick={() => handleScenario(s.id)}
                                        >
                                            <div className="scenario-title">{s.title}</div>
                                            <div className="scenario-desc">{s.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginTop: '40px' }}>
                                <header className="panel-title"><Cpu size={12} /> Posture: <b>{posture}</b></header>
                                <p className="info-text" style={{ fontSize: '0.6rem', marginTop: '10px' }}>
                                    {posture === 'ZERO_TRUST' ? "Safety Factor: 1.5x | Manual Override Required" : "Automated Processing: Active"}
                                </p>
                            </div>

                        </div>
                    </aside>

                    <section className="panel" style={{ gridArea: '2 / 1 / 3 / 2' }}>
                        <header className="panel-header"><h2 className="panel-title"><BarChart3 size={12} /> Risk Pulse</h2></header>
                        <div className="panel-content"><RiskChart data={history} /></div>
                    </section>
                </main>
            )}

            {activeTab === 'overview' && <main style={{ flex: 1, background: 'var(--panel-bg)', overflowY: 'auto' }}><SystemOverview /></main>}

            {activeTab === 'audit' && (
                <main style={{ flex: 1, background: 'var(--panel-bg)', padding: '40px', overflowY: 'auto' }}>
                    <h2 className="panel-title" style={{ marginBottom: '30px' }}><History size={14} /> Forensic Audit Logs</h2>
                    {Array.isArray(auditLogs) ? auditLogs.map(log => (
                        <div key={log.id} className="audit-card">
                            <div>
                                <span className="signature-tag">{log.signature}</span>
                                <span style={{ fontSize: '0.7rem', color: '#fff' }}>ID_{log.person_id} — {log.decision}</span>
                                <p className="rationale-text" style={{ marginTop: '8px' }}>{log.rationale}</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <button className="verified-btn" onClick={async () => {
                                    await fetch(getApiUrl(`/control/verify?log_id=${log.id}&correct=true`), { method: 'POST' });
                                    setAuditLogs(prev => prev.filter(l => l.id !== log.id));
                                }}>VERIFY</button>
                                <button className="verified-btn" onClick={async () => {
                                    await fetch(getApiUrl(`/control/verify?log_id=${log.id}&correct=false`), { method: 'POST' });
                                    setAuditLogs(prev => prev.filter(l => l.id !== log.id));
                                }}>DISMISS</button>
                            </div>
                        </div>
                    )) : null}
                </main>
            )}
        </div>
    );
}
