import React from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import { QubitSelector } from './QubitSelector';
import { TargetStateGrid } from './TargetStateGrid';
import { IterationControl } from './IterationControl';

export const ExperimentPanel: React.FC = () => {
  const { config } = useExperiment();
  const N = Math.pow(2, config.numQubits);
  const M = config.targetStates.length;

  return (
    <section className="quantum-card p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Experiment Configuration
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5 font-mono">
            n={config.numQubits} qubits · N={N} states · M={M} targets · k={config.iterations} iterations
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <QubitSelector />
        <TargetStateGrid />
        <IterationControl />
      </div>
    </section>
  );
};
