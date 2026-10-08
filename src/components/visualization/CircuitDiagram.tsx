import React from 'react';
import { useExperiment } from '../../context/ExperimentContext';

export const CircuitDiagram: React.FC = () => {
  const { config } = useExperiment();
  const { numQubits, iterations, targetStates } = config;

  const wireH = 40;
  const startX = 65;
  const hWidth = 38;
  const loopW = 130;
  const measureW = 45;

  const totalW = startX + hWidth + (iterations > 0 ? iterations * loopW : loopW) + measureW + 50;
  const totalH = numQubits * wireH + 35;

  return (
    <div className="quantum-card p-5 space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-200">Circuit Diagram</h3>
        <span className="text-[10px] font-mono text-zinc-500">
          {numQubits}q · {iterations} iter · targets: {targetStates.map((s) => '|' + s + '⟩').join(', ')}
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg width={Math.max(500, totalW)} height={totalH} className="font-mono text-xs select-none">
          {/* Qubit wires */}
          {Array.from({ length: numQubits }).map((_, q) => {
            const y = 28 + q * wireH;
            return (
              <g key={`w-${q}`}>
                <text x={10} y={y + 4} className="fill-zinc-400 font-bold" style={{ fontSize: 11 }}>q{q}</text>
                <line x1={startX} y1={y} x2={totalW - 25} y2={y} stroke="#3f3f46" strokeWidth={1.5} />
              </g>
            );
          })}

          {/* Hadamard gates */}
          {Array.from({ length: numQubits }).map((_, q) => {
            const y = 28 + q * wireH;
            const x = startX + 10;
            return (
              <g key={`h-${q}`}>
                <rect x={x} y={y - 12} width={24} height={24} rx={4} fill="#7c3aed" stroke="#8b5cf6" strokeWidth={0.5} />
                <text x={x + 12} y={y + 4} textAnchor="middle" fill="white" style={{ fontSize: 11, fontWeight: 700 }}>H</text>
              </g>
            );
          })}

          {/* Separator */}
          <line x1={startX + hWidth + 10} y1={10} x2={startX + hWidth + 10} y2={totalH - 10} stroke="#27272a" strokeWidth={1} strokeDasharray="4 4" />

          {/* Grover iterations */}
          {iterations > 0 ? (
            Array.from({ length: iterations }).map((_, i) => {
              const bx = startX + hWidth + 25 + i * loopW;
              const boxH = numQubits * wireH - 8;
              return (
                <g key={`it-${i}`}>
                  <rect x={bx} y={14} width={42} height={boxH} rx={6} fill="rgba(245,158,11,0.12)" stroke="#f59e0b" strokeWidth={1.5} />
                  <text x={bx + 21} y={14 + boxH / 2 + 4} textAnchor="middle" fill="#fbbf24" style={{ fontSize: 11, fontWeight: 700 }}>Uω</text>

                  <rect x={bx + 52} y={14} width={42} height={boxH} rx={6} fill="rgba(13,148,136,0.12)" stroke="#0d9488" strokeWidth={1.5} />
                  <text x={bx + 73} y={14 + boxH / 2 + 4} textAnchor="middle" fill="#2dd4bf" style={{ fontSize: 11, fontWeight: 700 }}>Us</text>

                  <text x={bx + 47} y={totalH - 3} textAnchor="middle" fill="#52525b" style={{ fontSize: 9 }}>iter {i + 1}</text>
                </g>
              );
            })
          ) : (
            <text x={startX + hWidth + 70} y={totalH / 2} fill="#52525b" style={{ fontSize: 11 }}>(k=0: no iterations)</text>
          )}

          {/* Measurement */}
          {Array.from({ length: numQubits }).map((_, q) => {
            const y = 28 + q * wireH;
            const mx = totalW - 40;
            return (
              <g key={`m-${q}`}>
                <rect x={mx} y={y - 12} width={24} height={24} rx={4} fill="#18181b" stroke="#3f3f46" strokeWidth={1} />
                <path d={`M ${mx + 5} ${y + 5} A 7 7 0 0 1 ${mx + 19} ${y + 5}`} stroke="#71717a" fill="none" strokeWidth={1} />
                <line x1={mx + 12} y1={y + 5} x2={mx + 17} y2={y - 3} stroke="#f59e0b" strokeWidth={1.5} />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
