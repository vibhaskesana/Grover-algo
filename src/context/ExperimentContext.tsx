import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  GroverExperimentConfig,
  GroverExperimentResult,
  QubitCount
} from '../lib/types';
import { runGroverSimulation, calculateOptimalIterations } from '../lib/grover-math';

export type TabId = 'simulator' | 'benchmarks' | 'export' | 'ibm';

interface ExperimentContextType {
  config: GroverExperimentConfig;
  result: GroverExperimentResult | null;
  isRunning: boolean;
  activeTab: TabId;
  setNumQubits: (n: QubitCount) => void;
  toggleTargetState: (binaryState: string) => void;
  setIterations: (k: number) => void;
  setShots: (shots: number) => void;
  setNoiseLevel: (noise: number) => void;
  setAutoOptimalIterations: () => void;
  loadPreset: (presetId: string) => void;
  runExperiment: () => void;
  setActiveTab: (tab: TabId) => void;
}

const defaultConfig: GroverExperimentConfig = {
  numQubits: 3,
  targetStates: ['101'],
  iterations: 2,
  shots: 1000,
  noiseLevel: 0,
};

const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

export const ExperimentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<GroverExperimentConfig>(defaultConfig);
  const [result, setResult] = useState<GroverExperimentResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('simulator');

  useEffect(() => {
    document.documentElement.classList.add('dark');
    setResult(runGroverSimulation(defaultConfig));
  }, []);

  const runSimulation = useCallback((currentConfig: GroverExperimentConfig) => {
    setIsRunning(true);
    try {
      setResult(runGroverSimulation(currentConfig));
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsRunning(false);
    }
  }, []);

  const setNumQubits = (numQubits: QubitCount) => {
    const defaultTarget = '1'.repeat(numQubits);
    const newConfig: GroverExperimentConfig = {
      ...config,
      numQubits,
      targetStates: [defaultTarget],
      iterations: calculateOptimalIterations(1, Math.pow(2, numQubits)),
    };
    setConfig(newConfig);
    runSimulation(newConfig);
  };

  const toggleTargetState = (binaryState: string) => {
    const isTarget = config.targetStates.includes(binaryState);
    let newTargets: string[];
    if (isTarget) {
      if (config.targetStates.length <= 1) return;
      newTargets = config.targetStates.filter((s) => s !== binaryState);
    } else {
      newTargets = [...config.targetStates, binaryState];
    }
    const totalStates = Math.pow(2, config.numQubits);
    const newConfig: GroverExperimentConfig = {
      ...config,
      targetStates: newTargets,
      iterations: calculateOptimalIterations(newTargets.length, totalStates),
    };
    setConfig(newConfig);
    runSimulation(newConfig);
  };

  const setIterations = (iterations: number) => {
    const c = { ...config, iterations };
    setConfig(c);
    runSimulation(c);
  };

  const setShots = (shots: number) => {
    const c = { ...config, shots };
    setConfig(c);
    runSimulation(c);
  };

  const setNoiseLevel = (noiseLevel: number) => {
    const c = { ...config, noiseLevel };
    setConfig(c);
    runSimulation(c);
  };

  const setAutoOptimalIterations = () => {
    const totalStates = Math.pow(2, config.numQubits);
    const optimalK = calculateOptimalIterations(config.targetStates.length, totalStates);
    setIterations(optimalK);
  };

  const loadPreset = (presetId: string) => {
    const presets: Record<string, GroverExperimentConfig> = {
      '2q-single': { numQubits: 2, targetStates: ['11'], iterations: 1, shots: 1000, noiseLevel: 0, presetId },
      '2q-dual': { numQubits: 2, targetStates: ['01', '10'], iterations: 1, shots: 1000, noiseLevel: 0, presetId },
      '3q-single': { numQubits: 3, targetStates: ['101'], iterations: 2, shots: 1000, noiseLevel: 0, presetId },
      '3q-triple': { numQubits: 3, targetStates: ['001', '010', '100'], iterations: 1, shots: 1000, noiseLevel: 0, presetId },
      '4q-single': { numQubits: 4, targetStates: ['1010'], iterations: 3, shots: 1000, noiseLevel: 0, presetId },
      '4q-quad': { numQubits: 4, targetStates: ['0001', '0010', '0100', '1000'], iterations: 1, shots: 1000, noiseLevel: 0, presetId },
    };
    const presetConfig = presets[presetId];
    if (!presetConfig) return;
    setConfig(presetConfig);
    runSimulation(presetConfig);
  };

  const runExperiment = () => runSimulation(config);

  return (
    <ExperimentContext.Provider value={{
      config, result, isRunning, activeTab,
      setNumQubits, toggleTargetState, setIterations, setShots,
      setNoiseLevel, setAutoOptimalIterations, loadPreset, runExperiment, setActiveTab,
    }}>
      {children}
    </ExperimentContext.Provider>
  );
};

export const useExperiment = () => {
  const ctx = useContext(ExperimentContext);
  if (!ctx) throw new Error('useExperiment must be used within ExperimentProvider');
  return ctx;
};
