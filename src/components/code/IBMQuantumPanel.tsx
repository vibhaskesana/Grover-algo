import React, { useState, useEffect } from 'react';
import { useExperiment } from '../../context/ExperimentContext';
import {
  Cpu,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  ShieldCheck,
  Sparkles,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const IBMQuantumPanel: React.FC = () => {
  const { config } = useExperiment();
  const [apiToken, setApiToken] = useState<string>('');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [selectedBackend, setSelectedBackend] = useState<string>('auto');
  const [shots, setShots] = useState<number>(2048);
  const [optimizationLevel, setOptimizationLevel] = useState<number>(3);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedCli, setCopiedCli] = useState<boolean>(false);
  const [tokenSaved, setTokenSaved] = useState<boolean>(false);

  // Load token from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ibm_quantum_api_token');
    if (saved) {
      setApiToken(saved);
      setTokenSaved(true);
    }
  }, []);

  const handleSaveToken = () => {
    if (apiToken.trim()) {
      localStorage.setItem('ibm_quantum_api_token', apiToken.trim());
      setTokenSaved(true);
    }
  };

  const handleClearToken = () => {
    localStorage.removeItem('ibm_quantum_api_token');
    setApiToken('');
    setTokenSaved(false);
  };

  const targetsFormatted = config.targetStates.map((t) => `'${t}'`).join(', ');
  const targetsCli = config.targetStates.join(' ');
  const displayToken = apiToken.trim() ? apiToken.trim() : 'YOUR_IBM_QUANTUM_TOKEN';

  const cliCommand = `python run_ibm_quantum.py --token "${displayToken}" --qubits ${config.numQubits} --targets ${targetsCli} --shots ${shots}${
    selectedBackend !== 'auto' ? ` --backend ${selectedBackend}` : ''
  }`;

  const pythonScript = `"""
Grover's Search Algorithm on Real IBM Quantum Superconducting Hardware
Target: ${config.targetStates.map((s) => '|' + s + '>').join(', ')} | Qubits: ${config.numQubits} | Grover Iterations: ${config.iterations}
Backend: ${selectedBackend === 'auto' ? 'Least Busy QPU' : selectedBackend} | Shots: ${shots}
"""

import os
import math
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler

# 1. Provide your IBM Quantum API Token
# Create a free account at https://quantum.ibm.com to obtain your API token
API_TOKEN = "${displayToken}"

# 2. Build Grover Circuit (n=${config.numQubits}, M=${config.targetStates.length}, k=${config.iterations})
n_qubits = ${config.numQubits}
targets = [${targetsFormatted}]
iterations = ${config.iterations}
shots = ${shots}

qc = QuantumCircuit(n_qubits, n_qubits)
qc.h(range(n_qubits)) # Uniform Superposition |s>
qc.barrier()

# Build Oracle Gate
oracle = QuantumCircuit(n_qubits, name="U_oracle")
for target in targets:
    for q in range(n_qubits):
        if target[n_qubits - 1 - q] == '0':
            oracle.x(q)
    if n_qubits == 2:
        oracle.cz(0, 1)
    elif n_qubits == 3:
        oracle.h(2)
        oracle.mcx([0, 1], 2)
        oracle.h(2)
    elif n_qubits == 4:
        oracle.h(3)
        oracle.mcx([0, 1, 2], 3)
        oracle.h(3)
    for q in range(n_qubits):
        if target[n_qubits - 1 - q] == '0':
            oracle.x(q)

# Build Diffuser Gate (2|s><s| - I)
diffuser = QuantumCircuit(n_qubits, name="U_diffuser")
diffuser.h(range(n_qubits))
diffuser.x(range(n_qubits))
if n_qubits == 2:
    diffuser.cz(0, 1)
elif n_qubits == 3:
    diffuser.h(2)
    diffuser.mcx([0, 1], 2)
    diffuser.h(2)
elif n_qubits == 4:
    diffuser.h(3)
    diffuser.mcx([0, 1, 2], 3)
    diffuser.h(3)
diffuser.x(range(n_qubits))
diffuser.h(range(n_qubits))

# Grover Amplification Iterations
for _ in range(iterations):
    qc.append(oracle.to_gate(), range(n_qubits))
    qc.append(diffuser.to_gate(), range(n_qubits))
    qc.barrier()

# Measurement
qc.measure(range(n_qubits), range(n_qubits))

# 3. Authenticate to IBM Quantum Runtime Service
print("Authenticating to IBM Quantum Runtime...")
service = None
for channel in ["ibm_quantum_platform", "ibm_cloud"]:
    try:
        service = QiskitRuntimeService(channel=channel, token=API_TOKEN)
        break
    except Exception:
        continue
if service is None:
    raise ValueError("Authentication failed. Please verify your token and ensure a free Qiskit Runtime instance is created at cloud.ibm.com/catalog/services/qiskit-runtime")

# 4. Select Backend
${
  selectedBackend === 'auto'
    ? 'backend = service.least_busy(operational=True, simulator=False, min_num_qubits=n_qubits)'
    : `backend = service.backend("${selectedBackend}")`
}
print(f"Target QPU selected: {backend.name} ({backend.num_qubits} physical qubits)")

# 5. Transpile to Physical Topology (Heavy-Hex Layout & Basis Gates)
print(f"Transpiling circuit (Optimization Level ${optimizationLevel})...")
transpiled_qc = transpile(qc, backend=backend, optimization_level=${optimizationLevel})
print(f"Transpiled Depth: {transpiled_qc.depth()} | Gate Counts: {dict(transpiled_qc.count_ops())}")

# 6. Submit Job via Qiskit Runtime SamplerV2
print(f"Submitting job to physical QPU ({backend.name}) with {shots} shots...")
sampler = Sampler(mode=backend)
job = sampler.run([transpiled_qc], shots=shots)
print(f"✓ Job submitted! ID: {job.job_id()}")
print(f"Monitor job live at: https://quantum.ibm.com/jobs/{job.job_id()}")

# 7. Retrieve & Print Results
result = job.result()
pub_result = result[0]
bitstrings = pub_result.data.meas.get_bitstrings()

counts = {}
for bs in bitstrings:
    counts[bs] = counts.get(bs, 0) + 1

target_hits = sum(counts.get(t, 0) for t in targets)
p_hardware = target_hits / shots

print("\\n" + "="*50)
print(f"Real Hardware Success Probability: {p_hardware * 100:.2f}%")
print("Raw Counts:", counts)
print("="*50)
`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#181824] via-[#12121a] to-[#0d0d14] border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                IBM Quantum Runtime Integration
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Activity className="w-3 h-3 text-emerald-400" />
                Superconducting QPUs Online
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Physical Quantum Computer (QPU) Execution
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Dispatch your parameterized Grover search circuit directly to IBM Quantum superconducting processors (Heron & Eagle 127-qubit fleet). Compare real decoherence and gate noise against theoretical simulations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://colab.research.google.com/github/vibhaskesana/Grover-algo/blob/main/GroverLab_Colab_Visualizations.ipynb"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Colab</span>
            </a>
            <a
              href="https://quantum.ibm.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>IBM Quantum Platform</span>
            </a>
          </div>
        </div>
      </div>

      {/* API Key Configuration Card */}
      <div className="quantum-card p-5 border border-zinc-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">IBM Quantum API Token</h2>
              <p className="text-[11px] text-zinc-400">
                Your personal API key from{' '}
                <a
                  href="https://quantum.ibm.com/account"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  quantum.ibm.com/account <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </p>
            </div>
          </div>
          {tokenSaved && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Token saved locally
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={apiToken}
              onChange={(e) => {
                setApiToken(e.target.value);
                setTokenSaved(false);
              }}
              placeholder="Paste your 64-character IBM Quantum API Token here..."
              className="w-full bg-[#09090c] border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors pr-24"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
                title={showToken ? 'Hide Token' : 'Show Token'}
              >
                {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs space-y-1">
            <p className="font-semibold text-amber-300 flex items-center gap-1.5">
              <span>💡</span> If using an IBM Cloud API Key:
            </p>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              Ensure you have created the free <span className="font-semibold text-white">Qiskit Runtime (Lite Plan)</span> service instance on your account:{' '}
              <a
                href="https://cloud.ibm.com/catalog/services/qiskit-runtime"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 underline font-medium hover:text-amber-300 inline-flex items-center gap-0.5"
              >
                cloud.ibm.com/catalog/services/qiskit-runtime <ExternalLink className="w-2.5 h-2.5" />
              </a>
              . Select <span className="text-white font-mono">Lite</span> and click <span className="text-white font-semibold">Create</span> (100% free with 10 min/month QPU execution).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToken}
                disabled={!apiToken.trim()}
                className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium transition-colors"
              >
                Save Token in Browser
              </button>
              {tokenSaved && (
                <button
                  onClick={handleClearToken}
                  className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  Clear Token
                </button>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 italic">
              🔒 Tokens are stored exclusively in your local browser storage and never transmitted to any third-party server.
            </p>
          </div>
        </div>
      </div>

      {/* Hardware Settings Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Backend Selector */}
        <div className="quantum-card p-4 border border-zinc-800 rounded-xl space-y-2">
          <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Target Hardware Backend
          </label>
          <select
            value={selectedBackend}
            onChange={(e) => setSelectedBackend(e.target.value)}
            className="w-full bg-[#09090c] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="auto">Least Busy Operational QPU (Auto)</option>
            <option value="ibm_fez">ibm_fez (156 Qubits - Heron r2)</option>
            <option value="ibm_brisbane">ibm_brisbane (127 Qubits - Eagle r3)</option>
            <option value="ibm_kyoto">ibm_kyoto (127 Qubits - Eagle r3)</option>
            <option value="ibm_osaka">ibm_osaka (127 Qubits - Eagle r3)</option>
            <option value="ibm_sherbrooke">ibm_sherbrooke (127 Qubits - Eagle r3)</option>
            <option value="ibm_torino">ibm_torino (133 Qubits - Heron r1)</option>
          </select>
          <p className="text-[10px] text-zinc-500">
            Auto mode queries IBM Quantum live queue for the shortest wait time.
          </p>
        </div>

        {/* Shots Selector */}
        <div className="quantum-card p-4 border border-zinc-800 rounded-xl space-y-2">
          <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            Measurement Shots
          </label>
          <select
            value={shots}
            onChange={(e) => setShots(Number(e.target.value))}
            className="w-full bg-[#09090c] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            <option value={1024}>1,024 Shots (Fast sampling)</option>
            <option value={2048}>2,048 Shots (Optimal convergence)</option>
            <option value={4096}>4,096 Shots (High precision)</option>
          </select>
          <p className="text-[10px] text-zinc-500">
            Higher shots reduce statistical sampling noise ($\pm 1/\sqrt{'{'}\text{'{'}shots{'}'}{'}'}$).
          </p>
        </div>

        {/* Transpiler Optimization */}
        <div className="quantum-card p-4 border border-zinc-800 rounded-xl space-y-2">
          <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            Transpiler Optimization
          </label>
          <select
            value={optimizationLevel}
            onChange={(e) => setOptimizationLevel(Number(e.target.value))}
            className="w-full bg-[#09090c] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
          >
            <option value={3}>Level 3 (Heavy noise routing & 2Q gate cancellation)</option>
            <option value={2}>Level 2 (Commutation analysis & mapping)</option>
            <option value={1}>Level 1 (Basic layout mapping)</option>
          </select>
          <p className="text-[10px] text-zinc-500">
            Level 3 minimises CNOT/ECR depth across superconducting couplings.
          </p>
        </div>
      </div>

      {/* CLI Instant Runner Card */}
      <div className="quantum-card p-5 border border-zinc-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              1-Click Terminal Command (Local Execution)
            </h3>
          </div>
          <button
            onClick={handleCopyCli}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            {copiedCli ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCli ? 'Copied' : 'Copy Command'}</span>
          </button>
        </div>
        <div className="p-3 bg-[#08080b] border border-zinc-800/80 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto select-all">
          <code>{cliCommand}</code>
        </div>
        <p className="text-[11px] text-zinc-400">
          Run directly in your terminal from the project folder. The CLI will transpile the circuit, submit the job to IBM Quantum, poll the queue, and print real hardware execution fidelity.
        </p>
      </div>

      {/* Generated Standalone Python Script */}
      <div className="quantum-card p-5 border border-zinc-800 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Self-Contained Qiskit Runtime V2 Script
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              Target: {config.targetStates.map((s) => '|' + s + '⟩').join(', ')} | Qubits: {config.numQubits} | Iterations: {config.iterations}
            </p>
          </div>
          <button
            onClick={handleCopyScript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors self-start sm:self-auto shadow-sm"
          >
            {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedScript ? 'Copied Script' : 'Copy Script'}</span>
          </button>
        </div>

        <div className="border border-zinc-800 rounded-lg overflow-hidden">
          <div className="bg-[#121217] px-3 py-1.5 border-b border-zinc-800 text-[10px] font-mono text-zinc-500 flex justify-between">
            <span>run_grover_ibm.py</span>
            <span>qiskit 2.x + qiskit-ibm-runtime</span>
          </div>
          <pre className="p-4 bg-[#09090c] text-zinc-300 text-[11px] font-mono overflow-x-auto leading-relaxed max-h-[500px]">
            <code>{pythonScript}</code>
          </pre>
        </div>
      </div>

      {/* How to Guide Card */}
      <div className="quantum-card p-5 border border-zinc-800 rounded-xl space-y-4">
        <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          Step-by-Step Guide: Running on Real IBM Quantum Hardware
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-lg space-y-1.5">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Step 1</span>
            <h4 className="font-semibold text-zinc-100">Create Free Account</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Visit <a href="https://quantum.ibm.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">quantum.ibm.com</a> and sign up with an IBM or Google account. Free tier grants 10 minutes of real QPU time every month.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-lg space-y-1.5">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Step 2</span>
            <h4 className="font-semibold text-zinc-100">Copy API Token</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Navigate to your Account Dashboard at <a href="https://quantum.ibm.com/account" target="_blank" rel="noreferrer" className="text-indigo-400 underline">quantum.ibm.com/account</a> and click &quot;Copy Token&quot;. Paste it into the API token field above.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-lg space-y-1.5">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Step 3</span>
            <h4 className="font-semibold text-zinc-100">Execute Circuit</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Run <code className="text-indigo-300 font-mono">python run_ibm_quantum.py</code> in your project terminal or execute the Google Colab Section 9 cell.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-lg space-y-1.5">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Step 4</span>
            <h4 className="font-semibold text-zinc-100">Analyze Degradation</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Compare physical superconducting gate fidelity against ideal statevector probabilities to evaluate real decoherence ($T_1, T_2$) and CNOT noise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
