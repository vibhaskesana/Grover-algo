import React, { useState } from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Cell } from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const AmplitudeEvolution: React.FC = () => {
  const { result } = useExperiment();
  const [stepIdx, setStepIdx] = useState(0);

  if (!result || !result.stepEvolutions.length) return null;

  const steps = result.stepEvolutions;
  const step = steps[Math.min(stepIdx, steps.length - 1)];

  let chartData = step.amplitudes.map((st) => ({
    label: st.label,
    amplitude: st.amplitude,
    isTarget: st.isTarget,
  }));

  if (chartData.length > 8) {
    const marked = chartData.filter((d) => d.isTarget);
    const rest = chartData.filter((d) => !d.isTarget).sort((a, b) => Math.abs(b.amplitude) - Math.abs(a.amplitude)).slice(0, 8 - marked.length);
    chartData = [...marked, ...rest].sort((a, b) => a.label.localeCompare(b.label));
  }

  const stepLabel = step.stepName === 'initialization' ? 'Init' : step.stepName === 'oracle' ? `Oracle #${step.iteration}` : `Diffusion #${step.iteration}`;

  return (
    <div className="quantum-card p-5 space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-200">Amplitude Evolution</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStepIdx((p) => Math.max(0, p - 1))}
            disabled={stepIdx === 0}
            className="p-1 rounded border border-zinc-800 disabled:opacity-30 hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-zinc-400 min-w-[100px] text-center">
            {stepLabel} ({stepIdx + 1}/{steps.length})
          </span>
          <button
            onClick={() => setStepIdx((p) => Math.min(steps.length - 1, p + 1))}
            disabled={stepIdx === steps.length - 1}
            className="p-1 rounded border border-zinc-800 disabled:opacity-30 hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="text-[10px] font-mono text-zinc-500">
        μ = {step.meanAmplitude.toFixed(4)}
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#71717a' }} />
            <YAxis domain={[-1, 1]} tick={{ fontSize: 10, fill: '#71717a' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
              labelStyle={{ color: '#e4e4e7' }}
            />
            <ReferenceLine y={0} stroke="#3f3f46" strokeWidth={1} />
            <ReferenceLine y={step.meanAmplitude} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1} />
            <Bar dataKey="amplitude" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.isTarget ? (entry.amplitude < 0 ? '#ef4444' : '#f59e0b') : '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
