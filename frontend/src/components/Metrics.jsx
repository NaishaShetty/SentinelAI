import React from "react";
import { HelpCircle } from "lucide-react";

export default function Metrics({ data }) {
    const abstentions = data.filter((d) => d.decision.includes("ABSTAIN")).length;
    const warnings = data.filter((d) => d.decision === "WARN").length;
    const avgRisk = data.length > 0
        ? (data.reduce((acc, curr) => acc + curr.risk_score, 0) / data.length).toFixed(3)
        : "0.000";

    return (
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-label">Active_Entities</div>
                <div className="stat-value">{data.length}</div>
                <p style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Unique IDs tracked in current frame.
                </p>
            </div>

            <div className="stat-card" style={{ borderLeft: '2px solid var(--text-primary)' }}>
                <div className="stat-label">Abstention_Threshold</div>
                <div className="stat-value">{new Date().getHours() >= 22 || new Date().getHours() <= 6 ? '0.45' : '0.60'}</div>
                <p style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Dynamic limit: Auto-scales sensitivity during night hours.
                </p>
            </div>


            <div className="stat-card" style={{ borderLeftColor: abstentions > 0 ? 'var(--color-danger)' : 'var(--border-active)' }}>
                <div className="stat-label">Abstentions</div>
                <div className="stat-value" style={{ color: abstentions > 0 ? 'var(--color-danger)' : 'inherit' }}>
                    {abstentions}
                </div>
                <p style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Automated refusal due to risk/uncertainty.
                </p>
            </div>

            <div className="stat-card" style={{ borderLeftColor: warnings > 0 ? 'var(--color-warning)' : 'var(--border-active)' }}>
                <div className="stat-label">Critical_Alerts</div>
                <div className="stat-value" style={{ color: warnings > 0 ? 'var(--color-warning)' : 'inherit' }}>
                    {warnings}
                </div>
                <p style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Human oversight required (Moderate risk).
                </p>
            </div>

            <div className="stat-card">
                <div className="stat-label">Mean_Risk_Index</div>
                <div className="stat-value">{avgRisk}</div>
                <p style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Aggregated situational risk (0-1).
                </p>
            </div>
        </div>
    );
}
