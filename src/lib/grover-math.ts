import type {
  QubitCount,
  GroverExperimentConfig,
  GroverExperimentResult,
  BasisState,
  StateAmplitude,
  StepEvolution,
  ProbabilityCurvePoint,
  SimulatedShot,
  BenchmarkRow
} from './types';

// Deterministic PRNG for reproducible simulations
export function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

/**
 * Generate all 2^n binary strings of length n in order.
 */
export function generateBasisStates(numQubits: QubitCount, targetStates: string[]): BasisState[] {
  const total = Math.pow(2, numQubits);
  const states: BasisState[] = [];
  const targetSet = new Set(targetStates);

  for (let i = 0; i < total; i++) {
    const binary = i.toString(2).padStart(numQubits, '0');
    states.push({
      binary,
      decimal: i,
      label: `|${binary}⟩`,
      isTarget: targetSet.has(binary),
    });
  }

  return states;
}

/**
 * Calculate rotation angle theta per Grover iteration: theta = 2 * asin(sqrt(M / N))
 */
export function calculateTheta(markedCount: number, totalStates: number): number {
  if (markedCount <= 0 || totalStates <= 0) return 0;
  if (markedCount >= totalStates) return Math.PI;
  const ratio = markedCount / totalStates;
  return 2 * Math.asin(Math.sqrt(ratio));
}

/**
 * Calculate theoretical success probability at iteration k: P(k) = sin^2((2k + 1) * theta / 2)
 */
export function calculateTheoreticalProb(k: number, theta: number): number {
  if (theta <= 0) return 0;
  const angle = ((2 * k + 1) * theta) / 2;
  const val = Math.sin(angle);
  return Math.min(1, Math.max(0, val * val));
}

/**
 * Find exact theoretical optimal iteration count k_opt maximizing P(k).
 */
export function calculateOptimalIterations(markedCount: number, totalStates: number): number {
  if (markedCount <= 0 || markedCount >= totalStates) return 0;
  const theta = calculateTheta(markedCount, totalStates);
  if (theta <= 0) return 0;

  // Formula: k_opt = round((PI / theta - 1) / 2)
  const theoreticalK = (Math.PI / theta - 1) / 2;
  const rounded = Math.round(theoreticalK);

  // Boundary check around rounded integer to ensure global max
  let bestK = Math.max(0, rounded);
  let maxP = calculateTheoreticalProb(bestK, theta);

  for (let cand = Math.max(0, rounded - 2); cand <= rounded + 2; cand++) {
    const p = calculateTheoreticalProb(cand, theta);
    if (p > maxP) {
      maxP = p;
      bestK = cand;
    }
  }

  return bestK;
}

/**
 * Generate full probability curve P(k) for k = 0 ... maxK
 */
export function generateProbabilityCurve(
  markedCount: number,
  totalStates: number,
  currentK: number,
  maxK: number = 10
): ProbabilityCurvePoint[] {
  const theta = calculateTheta(markedCount, totalStates);
  const optimalK = calculateOptimalIterations(markedCount, totalStates);
  const points: ProbabilityCurvePoint[] = [];

  const upperLimit = Math.max(maxK, optimalK + 4);

  for (let k = 0; k <= upperLimit; k++) {
    points.push({
      k,
      prob: calculateTheoreticalProb(k, theta),
      isOptimal: k === optimalK,
      isCurrent: k === currentK,
    });
  }

  return points;
}

/**
 * Perform exact step-by-step state vector simulation of Grover's Algorithm.
 */
export function simulateStateEvolution(
  numQubits: QubitCount,
  targetStates: string[],
  iterations: number
): { stepEvolutions: StepEvolution[]; finalAmplitudes: StateAmplitude[] } {
  const total = Math.pow(2, numQubits);
  const basis = generateBasisStates(numQubits, targetStates);

  // 1. Initial State Vector |s_0> = 1 / sqrt(N) for all states
  let vec = new Array<number>(total).fill(1 / Math.sqrt(total));

  const stepEvolutions: StepEvolution[] = [];

  const formatAmplitudes = (v: number[]): StateAmplitude[] => {
    return v.map((amp, idx) => {
      const prob = amp * amp;
      return {
        binary: basis[idx].binary,
        label: basis[idx].label,
        isTarget: basis[idx].isTarget,
        amplitude: Math.round(amp * 100000) / 100000,
        probability: Math.round(prob * 100000) / 100000,
        phaseDeg: amp < -1e-9 ? 180 : 0,
      };
    });
  };

  const initialMean = vec.reduce((a, b) => a + b, 0) / total;
  stepEvolutions.push({
    stepIndex: 0,
    iteration: 0,
    stepName: 'initialization',
    description: `Uniform Superposition (H^⊗${numQubits}): Equal amplitude 1/√${total} = ${(1 / Math.sqrt(total)).toFixed(4)} across all basis states.`,
    amplitudes: formatAmplitudes(vec),
    meanAmplitude: Math.round(initialMean * 100000) / 100000,
  });

  // Iterative Grover Steps
  let globalStepCounter = 1;
  for (let k = 1; k <= iterations; k++) {
    // A. Oracle Phase Flip U_w: flip sign of target states
    vec = vec.map((amp, idx) => (basis[idx].isTarget ? -amp : amp));
    const meanPostOracle = vec.reduce((a, b) => a + b, 0) / total;

    stepEvolutions.push({
      stepIndex: globalStepCounter++,
      iteration: k,
      stepName: 'oracle',
      description: `Iteration ${k} — Oracle Phase Flip (U_ω): Inverts phase (sign) of marked target state(s).`,
      amplitudes: formatAmplitudes(vec),
      meanAmplitude: Math.round(meanPostOracle * 100000) / 100000,
    });

    // B. Diffusion Operator U_s: Inversion about the mean
    const mean = vec.reduce((a, b) => a + b, 0) / total;
    vec = vec.map((amp) => 2 * mean - amp);
    const meanPostDiff = vec.reduce((a, b) => a + b, 0) / total;

    stepEvolutions.push({
      stepIndex: globalStepCounter++,
      iteration: k,
      stepName: 'diffusion',
      description: `Iteration ${k} — Diffusion Operator (U_s): Inverts amplitudes about mean value μ = ${mean.toFixed(4)}, amplifying marked state(s).`,
      amplitudes: formatAmplitudes(vec),
      meanAmplitude: Math.round(meanPostDiff * 100000) / 100000,
    });
  }

  return {
    stepEvolutions,
    finalAmplitudes: formatAmplitudes(vec),
  };
}

/**
 * Simulate Monte Carlo quantum measurement sampling with optional depolarizing noise.
 */
export function simulateShotMeasurements(
  finalAmplitudes: StateAmplitude[],
  shots: number,
  noiseLevel: number = 0,
  rng: () => number = Math.random
): { distribution: SimulatedShot[]; empiricalSuccessRate: number; topMeasuredState: string; fidelityScore: number } {
  const totalStates = finalAmplitudes.length;

  // Build probability array with noise adjustment
  let probabilities = finalAmplitudes.map((st) => st.probability);

  if (noiseLevel > 0) {
    const uniformProb = 1 / totalStates;
    probabilities = probabilities.map((p) => (1 - noiseLevel) * p + noiseLevel * uniformProb);
  }

  // Normalize to prevent floating point drift
  const sumP = probabilities.reduce((a, b) => a + b, 0);
  probabilities = probabilities.map((p) => p / Math.max(1e-9, sumP));

  // Cumulative distribution function
  const cdf: number[] = [];
  let currentCDF = 0;
  for (let i = 0; i < probabilities.length; i++) {
    currentCDF += probabilities[i];
    cdf.push(currentCDF);
  }

  // Draw Monte Carlo shots
  const counts = new Array<number>(totalStates).fill(0);
  for (let s = 0; s < shots; s++) {
    const rand = rng();
    let idx = 0;
    while (idx < totalStates - 1 && rand > cdf[idx]) {
      idx++;
    }
    counts[idx]++;
  }

  let markedSuccessCount = 0;
  let maxCount = -1;
  let topStateBinary = '|00⟩';

  const distribution: SimulatedShot[] = finalAmplitudes.map((st, idx) => {
    const count = counts[idx];
    const empiricalProb = count / shots;

    if (st.isTarget) {
      markedSuccessCount += count;
    }
    if (count > maxCount) {
      maxCount = count;
      topStateBinary = st.label;
    }

    return {
      binary: st.binary,
      label: st.label,
      count,
      prob: Math.round(empiricalProb * 100000) / 100000,
      isTarget: st.isTarget,
    };
  });

  const empiricalSuccessRate = Math.round((markedSuccessCount / shots) * 100000) / 100000;

  // Calculate Fidelity / Overlap between ideal theoretical distribution and sampled distribution
  let overlapSum = 0;
  finalAmplitudes.forEach((st, idx) => {
    const pIdeal = st.probability;
    const pSampled = counts[idx] / shots;
    overlapSum += Math.sqrt(pIdeal * pSampled);
  });
  const fidelityScore = Math.min(1.0, Math.round(overlapSum * overlapSum * 10000) / 10000);

  return {
    distribution,
    empiricalSuccessRate,
    topMeasuredState: topStateBinary,
    fidelityScore,
  };
}

/**
 * Master simulation engine running the full Grover experiment pipeline.
 */
export function runGroverSimulation(config: GroverExperimentConfig): GroverExperimentResult {
  const startTime = performance.now();
  const totalStates = Math.pow(2, config.numQubits);
  const markedCount = config.targetStates.length;
  const markedRatio = markedCount / totalStates;

  const theta = calculateTheta(markedCount, totalStates);
  const thetaDegrees = Math.round(((theta * 180) / Math.PI) * 100) / 100;
  const optimalIterations = calculateOptimalIterations(markedCount, totalStates);

  const theoreticalProb = calculateTheoreticalProb(config.iterations, theta);
  const theoreticalMaxProb = calculateTheoreticalProb(optimalIterations, theta);

  const maxKChart = Math.max(12, optimalIterations + 5);
  const probabilityCurve = generateProbabilityCurve(markedCount, totalStates, config.iterations, maxKChart);

  const { stepEvolutions, finalAmplitudes } = simulateStateEvolution(
    config.numQubits,
    config.targetStates,
    config.iterations
  );

  const { distribution, empiricalSuccessRate, topMeasuredState, fidelityScore } = simulateShotMeasurements(
    finalAmplitudes,
    config.shots,
    config.noiseLevel
  );

  const endTime = performance.now();

  return {
    config,
    totalStates,
    markedCount,
    markedRatio: Math.round(markedRatio * 10000) / 10000,
    theta: Math.round(theta * 10000) / 10000,
    thetaDegrees,
    optimalIterations,
    theoreticalProb: Math.round(theoreticalProb * 10000) / 10000,
    theoreticalMaxProb: Math.round(theoreticalMaxProb * 10000) / 10000,
    probabilityCurve,
    simulatedDistribution: distribution,
    empiricalSuccessRate,
    topMeasuredState,
    fidelityScore,
    stepEvolutions,
    executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate standard benchmark metrics table comparing 2, 3, and 4 qubits with different marked state counts.
 */
export function generateBenchmarkSuite(shots: number = 10000, noiseLevel: number = 0): BenchmarkRow[] {
  const configs = [
    { numQubits: 2, markedCount: 1, targets: ['11'] },
    { numQubits: 2, markedCount: 2, targets: ['01', '10'] },
    { numQubits: 3, markedCount: 1, targets: ['101'] },
    { numQubits: 3, markedCount: 2, targets: ['011', '110'] },
    { numQubits: 3, markedCount: 3, targets: ['001', '010', '100'] },
    { numQubits: 4, markedCount: 1, targets: ['1010'] },
    { numQubits: 4, markedCount: 2, targets: ['0101', '1100'] },
    { numQubits: 4, markedCount: 4, targets: ['0001', '0010', '0100', '1000'] },
  ];

  return configs.map((cfg) => {
    const totalStates = Math.pow(2, cfg.numQubits);
    const thetaRad = calculateTheta(cfg.markedCount, totalStates);
    const optimalK = calculateOptimalIterations(cfg.markedCount, totalStates);
    const maxProb = calculateTheoreticalProb(optimalK, thetaRad);

    // Classical average search queries: (N + 1) / (M + 1)
    const classicalQueries = (totalStates + 1) / (cfg.markedCount + 1);

    // Quantum queries = optimalK (or 1 if optimalK is 0)
    const quantumQueries = Math.max(1, optimalK);
    const speedup = Math.round((classicalQueries / quantumQueries) * 100) / 100;

    // Search Difficulty Score (SDS) calculation: w1=0.35, w2=0.35, w3=0.30
    const nNorm = (cfg.numQubits - 2) / 2; // (numQubits - 2) / (4 - 2)
    const nmRatio = totalStates / cfg.markedCount;
    const nmNorm = Math.min(1.0, (nmRatio - 1) / 15);
    const noiseNorm = Math.min(1.0, (1 - maxProb) / 0.5);
    const sdsScore = Math.round((0.35 * nNorm + 0.35 * nmNorm + 0.30 * noiseNorm) * 100) / 100;

    // Run simulation to get empirical result using current context shots/noise
    const { finalAmplitudes } = simulateStateEvolution(cfg.numQubits as 2|3|4, cfg.targets, optimalK);
    const { empiricalSuccessRate } = simulateShotMeasurements(finalAmplitudes, shots, noiseLevel);

    return {
      id: `${cfg.numQubits}q-m${cfg.markedCount}`,
      numQubits: cfg.numQubits,
      totalStates,
      markedCount: cfg.markedCount,
      targetStatesStr: cfg.targets.map((t) => `|${t}⟩`).join(', '),
      thetaRad: Math.round(thetaRad * 10000) / 10000,
      optimalIterations: optimalK,
      theoreticalMaxProb: Math.round(maxProb * 10000) / 10000,
      empiricalMaxProb: empiricalSuccessRate,
      classicalAvgQueries: Math.round(classicalQueries * 100) / 100,
      speedupFactor: speedup,
      sdsScore: Math.max(0.12, sdsScore),
    };
  });
}
