import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export const MarkedStatesComparison: React.FC = () => {
  const data4Q = [
    { m: 1, kOpt: 3, ratioPct: 6.25, thetaDeg: 28.9, maxP: 96.1 },
    { m: 2, kOpt: 2, ratioPct: 12.5, thetaDeg: 41.4, maxP: 94.5 },
    { m: 4, kOpt: 1, ratioPct: 25.0, thetaDeg: 60.0, maxP: 100.0 },
    { m: 8, kOpt: 1, ratioPct: 50.0, thetaDeg: 90.0, maxP: 100.0 },
  ];

  return (
    <div className="quantum-card p-5 space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-200">M vs k_opt (N=16)</h3>
        <span className="text-[10px] font-mono text-zinc-500">k_opt ∝ √(N/M)</span>
      </div>

      <div className="h-48 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data4Q} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="m" tick={{ fontSize: 10, fill: '#71717a' }} label={{ value: 'Targets (M)', position: 'insideBottom', offset: -5, fill: '#71717a', fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10, fill: '#71717a' }} domain={[0, 4]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
              labelStyle={{ color: '#e4e4e7' }}
              formatter={(value) => [`${value} iter`, 'k_opt']}
              labelFormatter={(m) => `M = ${m}`}
            />
            <Bar dataKey="kOpt" radius={[3, 3, 0, 0]}>
              {data4Q.map((_, index) => (
                <Cell key={index} fill={index === 0 ? '#6366f1' : '#d97706'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
