import React, { useState } from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import { generateQiskitCode } from '../../lib/qiskit-generator';

export const QiskitCodePanel: React.FC = () => {
  const { config } = useExperiment();
  const [style, setStyle] = useState<'basic' | 'grover_operator'>('basic');
  const [copied, setCopied] = useState(false);

  const code = generateQiskitCode(config, {
    includeImports: true,
    includeComments: true,
    style,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="quantum-card p-5 space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-white">Qiskit Python Export</h2>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
            n={config.numQubits}, targets=[{config.targetStates.map((s) => '|' + s + '⟩').join(', ')}], k={config.iterations}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex bg-zinc-900 p-0.5 rounded border border-zinc-800">
            <button
              onClick={() => setStyle('basic')}
              className={`px-3 py-1 rounded transition-colors ${style === 'basic' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Explicit
            </button>
            <button
              onClick={() => setStyle('grover_operator')}
              className={`px-3 py-1 rounded transition-colors ${style === 'grover_operator' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Operator
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        <div className="bg-[#18181b] px-3 py-1.5 border-b border-zinc-800 text-[10px] font-mono text-zinc-500 flex justify-between">
          <span>grover_experiment.py</span>
          <span>Qiskit 1.x</span>
        </div>
        <pre className="p-4 bg-[#09090b] text-zinc-300 text-[11px] font-mono overflow-x-auto leading-relaxed max-h-[600px]">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
