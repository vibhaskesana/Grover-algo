import React from 'react';
import { useExperiment } from '../../context/ExperimentContext';

export const TheoreticalCard: React.FC = () => {
  const { result, config } = useExperiment();
  if (!result) return null;

  const metrics = [
    { label: 'Search Space', value: `N = ${result.totalStates}`, sub: `2^${config.numQubits}` },
    { label: 'Marked States', value: `M = ${result.markedCount}`, sub: `${(result.markedRatio * 100).toFixed(1)}%`, accent: true },
    { label: 'Rotation θ', value: `${result.theta.toFixed(3)} rad`, sub: `${result.thetaDegrees}°` },
    { label: 'Optimal k', value: `k = ${result.optimalIterations}`, sub: `P = ${(result.theoreticalMaxProb * 100).toFixed(1)}%`, highlight: true },
  ];

  return (
    <div className="quantum-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-200">Theoretical Baseline</h3>
        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
          Analytical
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-zinc-900/80 rounded-lg p-3 border border-zinc-800/60">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">{m.label}</span>
            <span className={`font-mono text-lg font-bold block mt-1 ${
              m.highlight ? 'text-emerald-400' : m.accent ? 'text-amber-400' : 'text-white'
            }`}>
              {m.value}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 block">{m.sub}</span>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900/80 rounded-lg p-3 border border-zinc-800/60 font-mono text-xs text-zinc-400 flex flex-wrap gap-x-8 gap-y-1">
        <span>k_opt ≈ ⌊(π/4)√(N/M)⌋ = <strong className="text-emerald-400">{result.optimalIterations}</strong></span>
        <span>P(k) = sin²((2k+1)θ/2) = <strong className="text-indigo-400">{(result.theoreticalProb * 100).toFixed(1)}%</strong></span>
      </div>
    </div>
  );
};
