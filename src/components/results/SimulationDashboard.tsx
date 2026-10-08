import React from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export const SimulationDashboard: React.FC = () => {
  const { result, config } = useExperiment();
  if (!result) return null;

  const allStates = result.simulatedDistribution;
  let chartData = allStates.map((st) => ({
    label: `|${st.binary}⟩`,
    count: st.count,
    probPct: Math.round(st.prob * 1000) / 10,
    isTarget: st.isTarget,
  }));

  if (chartData.length > 8) {
    const marked = chartData.filter((d) => d.isTarget);
    const nonMarked = chartData.filter((d) => !d.isTarget).sort((a, b) => b.count - a.count).slice(0, 8 - marked.length);
    chartData = [...marked, ...nonMarked].sort((a, b) => a.label.localeCompare(b.label));
  }

  const empiricalPct = Math.round(result.empiricalSuccessRate * 1000) / 10;
  const theoreticalPct = Math.round(result.theoreticalProb * 1000) / 10;

  return (
    <div className="quantum-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-200">Simulation Results</h3>
        <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
          {config.shots.toLocaleString()} shots · {result.executionTimeMs}ms
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900/80 rounded-lg p-3 border border-zinc-800/60">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Success Rate</span>
          <span className="font-mono text-xl font-bold text-teal-400 block mt-1">{empiricalPct}%</span>
          <span className="text-[10px] font-mono text-zinc-500">theory: {theoreticalPct}%</span>
        </div>
        <div className="bg-zinc-900/80 rounded-lg p-3 border border-zinc-800/60">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Top State</span>
          <span className="font-mono text-xl font-bold text-amber-400 block mt-1">{result.topMeasuredState}</span>
          <span className="text-[10px] font-mono text-zinc-500">highest count</span>
        </div>
        <div className="bg-zinc-900/80 rounded-lg p-3 border border-zinc-800/60">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Fidelity</span>
          <span className="font-mono text-xl font-bold text-emerald-400 block mt-1">{(result.fidelityScore * 100).toFixed(1)}%</span>
          <span className="text-[10px] font-mono text-zinc-500">state overlap</span>
        </div>
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#71717a' }} />
            <YAxis tick={{ fontSize: 10, fill: '#71717a' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
              labelStyle={{ color: '#e4e4e7' }}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.isTarget ? '#f59e0b' : '#0d9488'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
