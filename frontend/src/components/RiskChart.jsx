import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RiskChart({ data }) {
    if (data.length === 0) {
        return (
            <div className="chart-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>SYNCHRONIZING_TELEMETRY...</p>
            </div>
        );
    }

    return (
        <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a1a1a" />
                    <XAxis
                        dataKey="time"
                        stroke="#444"
                        fontSize={8}
                        tickLine={false}
                        axisLine={false}
                        fontFamily="var(--font-mono)"
                        hide={data.length < 5}
                    />
                    <YAxis
                        stroke="#444"
                        fontSize={8}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 1]}
                        ticks={[0, 0.5, 1.0]}
                        fontFamily="var(--font-mono)"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#000',
                            border: '1px solid #222',
                            borderRadius: '0px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px'
                        }}
                        cursor={{ stroke: '#444', strokeWidth: 1 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="risk"
                        stroke="#ffffff"
                        fillOpacity={1}
                        fill="url(#riskGradient)"
                        strokeWidth={2}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

