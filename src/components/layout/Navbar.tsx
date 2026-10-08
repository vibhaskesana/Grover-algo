import React from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import { Cpu, Play } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { runExperiment, isRunning } = useExperiment();

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold text-sm tracking-wide text-zinc-100">GroverLab</span>
        </div>

        <button
          onClick={runExperiment}
          disabled={isRunning}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-medium text-white transition-colors"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Running...' : 'Run Simulation'}</span>
        </button>
      </div>
    </header>
  );
};
