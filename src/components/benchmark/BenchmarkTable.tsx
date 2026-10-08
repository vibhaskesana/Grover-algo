import React, { useMemo, useState } from 'react';
import { generateBenchmarkSuite } from '../../lib/grover-math';
import { useExperiment } from '../../context/ExperimentContext';

export const BenchmarkTable: React.FC = () => {
  const { config } = useExperiment();
  const [qubitFilter, setQubitFilter] = useState<number | 'all'>('all');
  
  // Re-generate benchmarks whenever shots or noiseLevel changes
  const allBenchmarks = useMemo(() => generateBenchmarkSuite(config.shots, config.noiseLevel), [config.shots, config.noiseLevel]);
  
  const benchmarks = qubitFilter === 'all' 
    ? allBenchmarks 
    : allBenchmarks.filter(b => b.numQubits === qubitFilter);

  const exportCSV = () => {
    const headers = ['Qubits', 'States(N)', 'Targets(M)', 'Target Config', 'Optimal(k)', 'Max Prob Theory(%)', 'Max Prob Exp(%)', 'Classical(q)', 'Speedup', 'SDS Score'];
    const rows = benchmarks.map(b => [
      b.numQubits, b.totalStates, b.markedCount, b.targetStatesStr,
      b.optimalIterations, (b.theoreticalMaxProb * 100).toFixed(1), (b.empiricalMaxProb * 100).toFixed(1),
      b.classicalAvgQueries, b.speedupFactor.toFixed(1) + 'x',
      b.sdsScore.toFixed(2)
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grover_benchmarks.csv';
    a.click();
  };

  return (
    <div className="quantum-card p-5 space-y-4 overflow-hidden flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Grover Algorithm Configuration Benchmarks</h3>
          <p className="text-[11px] text-zinc-500 font-mono mt-1">Cross-analyzing N, M, iterations, and Search Difficulty Score (SDS).</p>
        </div>
        <div className="flex gap-2 text-xs font-mono">
          <select 
            value={qubitFilter} 
            onChange={e => setQubitFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded px-2 py-1 outline-none"
          >
            <option value="all">All Qubits</option>
            <option value={2}>2 Qubits</option>
            <option value={3}>3 Qubits</option>
            <option value={4}>4 Qubits</option>
          </select>
          <button 
            onClick={exportCSV}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded transition-colors border border-zinc-700"
          >
            CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px]">
              <th className="p-2">n</th>
              <th className="p-2">N</th>
              <th className="p-2 text-amber-500/80">M</th>
              <th className="p-2">Targets</th>
              <th className="p-2 text-indigo-400">k_opt</th>
              <th className="p-2">Max P (Theory)</th>
              <th className="p-2">Max P (Exp)</th>
              <th className="p-2 text-emerald-400">Speedup</th>
              <th className="p-2 text-rose-400">SDS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {benchmarks.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-900/50 transition-colors">
                <td className="p-2 font-semibold text-zinc-300">{row.numQubits}</td>
                <td className="p-2 text-zinc-400">{row.totalStates}</td>
                <td className="p-2 text-amber-400 font-bold">{row.markedCount}</td>
                <td className="p-2 text-zinc-500 truncate max-w-[120px]" title={row.targetStatesStr}>{row.targetStatesStr}</td>
                <td className="p-2 text-indigo-400 font-bold">{row.optimalIterations}</td>
                <td className="p-2 text-zinc-400">{(row.theoreticalMaxProb * 100).toFixed(1)}%</td>
                <td className="p-2 text-zinc-400">{(row.empiricalMaxProb * 100).toFixed(1)}%</td>
                <td className="p-2 text-emerald-400">{row.speedupFactor.toFixed(1)}x</td>
                <td className="p-2 text-rose-400 font-bold">{row.sdsScore.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
