import React from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

export const ProbabilityChart: React.FC = () => {
  const { result, config } = useExperiment();
  if (!result) return null;

  const data = result.probabilityCurve.map((pt) => ({
    k: pt.k,
    probPct: Math.round(pt.prob * 1000) / 10,
    isOptimal: pt.isOptimal,
  }));

  const optimalPoint = data.find((d) => d.isOptimal);

  return (
    <div className="quantum-card p-5 space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-200">P(k) Probability Curve</h3>
        {optimalPoint && (
          <span className="text-[10px] font-mono text-emerald-400">
            peak at k={optimalPoint.k} ({optimalPoint.probPct}%)
          </span>
        )}
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="k"
              tick={{ fontSize: 10, fill: '#71717a' }}
              label={{ value: 'Iterations (k)', position: 'insideBottom', offset: -3, fill: '#71717a', fontSize: 10 }}
            />
            <YAxis
              domain={[0, 100]}
              unit="%"
              tick={{ fontSize: 10, fill: '#71717a' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
              labelStyle={{ color: '#e4e4e7' }}
              formatter={(value: any) => [`${value}%`, 'P(k)']}
              labelFormatter={(k) => `k = ${k}`}
            />
            {optimalPoint && (
              <ReferenceLine x={optimalPoint.k} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5} />
            )}
            <ReferenceLine x={config.iterations} stroke="#6366f1" strokeWidth={1} />
            <Line
              type="monotone"
              dataKey="probPct"
              stroke="#6366f1"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.k === config.iterations) {
                  return <circle key={`d-${payload.k}`} cx={cx} cy={cy} r={5} fill="#f59e0b" stroke="#18181b" strokeWidth={2} />;
                }
                if (payload.isOptimal) {
                  return <circle key={`d-${payload.k}`} cx={cx} cy={cy} r={4} fill="#10b981" stroke="#18181b" strokeWidth={2} />;
                }
                return <circle key={`d-${payload.k}`} cx={cx} cy={cy} r={2.5} fill="#6366f1" />;
              }}
              activeDot={{ r: 6, fill: '#818cf8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
