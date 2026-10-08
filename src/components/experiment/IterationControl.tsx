import React from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import { calculateOptimalIterations } from '../../lib/grover-math';

export const IterationControl: React.FC = () => {
  const { config, setIterations, setShots, setNoiseLevel, setAutoOptimalIterations } = useExperiment();
  const totalStates = Math.pow(2, config.numQubits);
  const markedCount = config.targetStates.length;
  const optimalK = calculateOptimalIterations(markedCount, totalStates);
  const maxSliderK = Math.max(10, optimalK + 4);
  const isOptimal = config.iterations === optimalK;

  return (
    <div className="space-y-5">
      {/* Iterations */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-300">
            Grover Iterations (k)
          </label>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              k = {config.iterations}
            </span>
            {!isOptimal && (
              <button
                onClick={setAutoOptimalIterations}
                className="text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                → optimal (k={optimalK})
              </button>
            )}
            {isOptimal && (
              <span className="text-xs font-mono text-emerald-400">✓ optimal</span>
            )}
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={maxSliderK}
          step={1}
          value={config.iterations}
          onChange={(e) => setIterations(parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-[10px] font-mono text-zinc-600">
          <span>k = 0</span>
          <span className="text-indigo-400">optimal = {optimalK}</span>
          <span>k = {maxSliderK}</span>
        </div>
      </div>

      {/* Shots & Noise */}
      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-800/60">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Shots</span>
            <span className="font-mono text-white">{config.shots.toLocaleString()}</span>
          </div>
          <select
            value={config.shots}
            onChange={(e) => setShots(parseInt(e.target.value, 10))}
            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-700"
          >
            <option value={100}>100</option>
            <option value={1000}>1,000</option>
            <option value={5000}>5,000</option>
            <option value={10000}>10,000</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Noise Level</span>
            <span className="font-mono text-white">{(config.noiseLevel * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={0.15}
            step={0.01}
            value={config.noiseLevel}
            onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500 mt-2"
          />
        </div>
      </div>
    </div>
  );
};
