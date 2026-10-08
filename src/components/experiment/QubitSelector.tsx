import React from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import type { QubitCount } from '../../lib/types';

export const QubitSelector: React.FC = () => {
  const { config, setNumQubits } = useExperiment();

  const options: { qubits: QubitCount; states: number }[] = [
    { qubits: 2, states: 4 },
    { qubits: 3, states: 8 },
    { qubits: 4, states: 16 },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-300">
        Qubits (n)
        <span className="text-zinc-500 ml-2 font-mono text-xs">
          N = 2<sup>n</sup> = {Math.pow(2, config.numQubits)}
        </span>
      </label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const active = config.numQubits === opt.qubits;
          return (
            <button
              key={opt.qubits}
              onClick={() => setNumQubits(opt.qubits)}
              className={`py-2.5 px-4 rounded-lg text-sm font-mono font-medium transition-all ${
                active
                  ? 'bg-indigo-600 text-white ring-1 ring-indigo-500'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              {opt.qubits} qubits
              <span className="block text-xs opacity-60 mt-0.5">N = {opt.states}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
