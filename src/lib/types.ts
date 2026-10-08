export type QubitCount = 2 | 3 | 4;

export interface GroverExperimentConfig {
  numQubits: QubitCount;
  targetStates: string[]; // Binary strings like '01', '101', etc.
  iterations: number;     // k Grover iterations
  shots: number;          // e.g. 1000
  noiseLevel: number;     // 0.0 to 0.15 (0% to 15%)
  presetId?: string;
}

export interface BasisState {
  binary: string;
  decimal: number;
  label: string;
  isTarget: boolean;
}

export interface StateAmplitude {
  binary: string;
  label: string;
  isTarget: boolean;
  amplitude: number;     // Signed amplitude (-1.0 to +1.0)
  probability: number;   // amplitude^2
  phaseDeg: number;      // 0 or 180
}

export interface StepEvolution {
  stepIndex: number;      // 0 (init), 1 (Oracle 1), 2 (Diffuser 1), etc.
  iteration: number;      // Grover iteration index (0 = setup, 1, 2, ...)
  stepName: 'initialization' | 'oracle' | 'diffusion';
  description: string;
  amplitudes: StateAmplitude[];
  meanAmplitude: number;
}

export interface ProbabilityCurvePoint {
  k: number;
  prob: number;
  isOptimal: boolean;
  isCurrent: boolean;
}

export interface SimulatedShot {
  binary: string;
  label: string;
  count: number;
  prob: number;
  isTarget: boolean;
}

export interface GroverExperimentResult {
  config: GroverExperimentConfig;
  totalStates: number;          // N = 2^n
  markedCount: number;          // M
  markedRatio: number;          // M / N
  theta: number;                // theta = 2 * asin(sqrt(M/N)) in radians
  thetaDegrees: number;
  optimalIterations: number;    // k_opt
  theoreticalProb: number;      // P(k) at current config.iterations
  theoreticalMaxProb: number;   // P(k_opt)
  probabilityCurve: ProbabilityCurvePoint[];
  simulatedDistribution: SimulatedShot[];
  empiricalSuccessRate: number;
  topMeasuredState: string;
  fidelityScore: number;        // Overlap fidelity (0 to 1)
  stepEvolutions: StepEvolution[];
  executionTimeMs: number;
  timestamp: string;
}

export interface BenchmarkRow {
  id: string;
  numQubits: number;
  totalStates: number;
  markedCount: number;
  targetStatesStr: string;
  thetaRad: number;
  optimalIterations: number;
  theoreticalMaxProb: number;
  empiricalMaxProb: number;
  classicalAvgQueries: number;  // (N + 1) / (M + 1) or N / (2M)
  speedupFactor: number;        // classical / quantum
  sdsScore: number;             // Search Difficulty Score (0.0 to 1.0)
}

export interface SavedExperiment {
  id: string;
  name: string;
  timestamp: string;
  config: GroverExperimentConfig;
  result: GroverExperimentResult;
}

export interface QiskitExportOptions {
  includeImports: boolean;
  includeComments: boolean;
  style: 'basic' | 'grover_operator';
}
