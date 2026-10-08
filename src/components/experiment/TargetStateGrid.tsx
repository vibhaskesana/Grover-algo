import React from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import { generateBasisStates } from '../../lib/grover-math';

export const TargetStateGrid: React.FC = () => {
  const { config, toggleTargetState, loadPreset } = useExperiment();
  const basisStates = generateBasisStates(config.numQubits, config.targetStates);
  const M = config.targetStates.length;
  const N = basisStates.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-300">
          Target States (M)
        </label>
        <span className="text-xs font-mono text-zinc-500">
          M = {M} / {N} ({((M / N) * 100).toFixed(1)}%)
        </span>
      </div>

      <div className={`grid gap-1.5 ${config.numQubits === 4 ? 'grid-cols-4 sm:grid-cols-8' : config.numQubits === 3 ? 'grid-cols-4 sm:grid-cols-8' : 'grid-cols-4'}`}>
        {basisStates.map((st) => (
          <button
            key={st.binary}
            onClick={() => toggleTargetState(st.binary)}
            className={`py-2 rounded-lg text-center font-mono text-xs transition-all ${
              st.isTarget
                ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/50 font-bold'
                : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            |{st.binary}⟩
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        <span className="text-[11px] text-zinc-600 mr-1">Presets:</span>
        {config.numQubits === 2 && (
          <>
            <button onClick={() => loadPreset('2q-single')} className="px-2 py-0.5 text-[11px] font-mono rounded bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800 transition-colors">|11⟩</button>
            <button onClick={() => loadPreset('2q-dual')} className="px-2 py-0.5 text-[11px] font-mono rounded bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800 transition-colors">|01⟩+|10⟩</button>
          </>
        )}
        {config.numQubits === 3 && (
          <>
            <button onClick={() => loadPreset('3q-single')} className="px-2 py-0.5 text-[11px] font-mono rounded bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800 transition-colors">|101⟩</button>
            <button onClick={() => loadPreset('3q-triple')} className="px-2 py-0.5 text-[11px] font-mono rounded bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800 transition-colors">3 targets</button>
          </>
        )}
        {config.numQubits === 4 && (
          <>
            <button onClick={() => loadPreset('4q-single')} className="px-2 py-0.5 text-[11px] font-mono rounded bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800 transition-colors">|1010⟩</button>
            <button onClick={() => loadPreset('4q-quad')} className="px-2 py-0.5 text-[11px] font-mono rounded bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800 transition-colors">4 targets</button>
          </>
        )}
      </div>
    </div>
  );
};
