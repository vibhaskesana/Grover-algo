import React from 'react';

export const QubitScalingCards: React.FC = () => {
  const scalingData = [
    { qubits: 2, states: 4, classicalQueries: 2, quantumQueries: 1, speedup: '2.0x' },
    { qubits: 4, states: 16, classicalQueries: 8, quantumQueries: 3, speedup: '2.7x' },
    { qubits: 8, states: 256, classicalQueries: 128, quantumQueries: 12, speedup: '10.7x' },
    { qubits: 16, states: 65536, classicalQueries: 32768, quantumQueries: 201, speedup: '163.0x' },
  ];

  return (
    <div className="quantum-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-200">Quadratic Speedup Scaling</h3>
        <span className="text-[10px] font-mono text-teal-400">O(N) vs O(√N)</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {scalingData.map((item) => (
          <div key={item.qubits} className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white">{item.qubits} Qubits</span>
              <span className="text-[10px] font-mono text-teal-400">{item.speedup}</span>
            </div>
            <div className="space-y-1 font-mono text-[10px]">
              <div className="flex justify-between text-zinc-500">
                <span>N</span>
                <span className="text-zinc-400">{item.states.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Classical</span>
                <span className="text-zinc-400">{item.classicalQueries.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Quantum</span>
                <span className="text-indigo-400">{item.quantumQueries.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
