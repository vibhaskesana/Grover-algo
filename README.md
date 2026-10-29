# ⚛️ GroverLab — Quantum Search Algorithm Laboratory & Benchmarking Suite

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/vibhaskesana/Grover-algo/blob/main/GroverLab_Colab_Visualizations.ipynb)
[![IBM Quantum Validated](https://img.shields.io/badge/IBM%20Quantum-Heron%20r2%20Validated-6366f1.svg)](https://quantum.ibm.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

> **GroverLab** is a comprehensive quantum computing project that combines a **real-time interactive React web application** with a **standalone Python Qiskit laboratory**. It implements, simulates, and benchmarks **Grover's Quantum Search Algorithm** across 2, 3, and 4-qubit quantum systems.

---

## 📌 Project Overview

This repository consists of two main parts:

1. **Web Application Visualizer (`src/`)**: A modern React 19 + TypeScript web app for interactively exploring quantum state vectors, 2D geometric subspace rotations, amplitude evolution traces, and generated Qiskit Python code.
2. **Standalone Qiskit Python Laboratory (`python/`)**: A real Python/Qiskit 1.x laboratory that builds quantum circuits, runs ideal & noisy physical Aer simulations, executes real jobs on IBM Quantum hardware (QPU), computes Search Difficulty Scores (SDS), and generates CSV benchmark reports and publication plots.

---

## ✨ Key Features

- 🎛️ **Multi-Qubit Workbench**: Supports 2-qubit ($N=4$), 3-qubit ($N=8$), and 4-qubit ($N=16$) quantum systems with single and multi-target state configurations.
- 📐 **KaTeX Mathematical Typesetting**: Beautiful LaTeX math rendering for state vectors ($|s_k\rangle$, $|w\rangle$), rotation angles ($\theta$), and success probabilities ($P(k)$).
- 🐍 **Real Qiskit 1.x Engine**: Parameterized oracle $U_w$ and diffuser $U_s$ built directly with Qiskit circuits (not template strings).
- 🔊 **Noisy Physical Simulation**: Simulates real hardware noise (gate depolarization, thermal relaxation $T_1/T_2$, and measurement readout errors) using `qiskit_aer.noise`.
- ⚡ **IBM Quantum Hardware Integration**: Real QPU execution via `qiskit-ibm-runtime` (with safe API token fallback).
- 📊 **Search Difficulty Score (SDS)**: Integrated across both the Python laboratory and the web UI benchmark table. Calculates composite difficulty scores based on qubit count, search space ratio ($N/M$), and noise degradation, validated via Spearman rank correlation ($\rho = 1.0$).
- 📈 **Automated Artifact Generation**: Automatically exports benchmark results to CSV and produces high-resolution Matplotlib graphs.

---

## 🚀 How to Run the Project

### Prerequisites
- **Node.js** (v18 or higher) for the web application.
- **Python** (v3.10 or higher) for the Qiskit laboratory.

---

### Part 1: Running the Web Application Visualizer

1. Open your terminal in the project directory:
   ```bash
   cd "C:\Users\lenovo\Documents\Grover's"
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   # Standard command
   npm run dev

   # Windows PowerShell (if script execution is restricted)
   cmd /c npm run dev
   ```

4. Open your browser and go to:  
   👉 **[http://localhost:5173](http://localhost:5173)**

---

### Part 2: Running the Standalone Qiskit Python Laboratory

The Python virtual environment and dependencies (`qiskit`, `qiskit-aer`, `qiskit-ibm-runtime`, `matplotlib`, `scipy`, `pandas`, `numpy`) are pre-configured in `python/venv`.

1. Run the master experiment runner:
   ```bash
   # On Windows (PowerShell / CMD)
   python/venv/Scripts/python python/run_experiments.py

   # On Linux / macOS
   python/venv/bin/python python/run_experiments.py
   ```

2. What happens when you run this script:
   - Sweeps 2, 3, and 4-qubit circuits across single and multi-target configurations.
   - Runs ideal Aer simulation and physical noisy Aer simulation.
   - Calculates Search Difficulty Scores (SDS) and validates rank correlation ($\rho = 1.0$).
   - Saves `grover_benchmark_results.csv` to `public/results/` and `python/results/`.
   - Generates `success_prob_vs_iterations.png` and `sds_vs_degradation.png` plot images.

---

### Part 3: Running on Real IBM Quantum Hardware (Optional)

Running on real IBM Quantum QPUs requires an **IBM Quantum API Token** (free to create at [IBM Quantum Platform](https://quantum.ibm.com/)).

#### Local vs. Hardware Requirements Summary:

| Feature | Runs Locally (No Token Required) | Requires IBM Quantum Token |
| :--- | :---: | :---: |
| **Interactive Web Application** | ✅ Yes | ❌ No |
| **Qiskit Circuit Construction** | ✅ Yes | ❌ No |
| **Ideal Aer Simulator (`qiskit_aer`)** | ✅ Yes | ❌ No |
| **Noisy Aer Simulation (`NoiseModel`)** | ✅ Yes | ❌ No |
| **Iteration Sweeps ($k \in [k_{\text{opt}}-2, k_{\text{opt}}+2]$)** | ✅ Yes | ❌ No |
| **Search Difficulty Score (SDS) & Correlation** | ✅ Yes | ❌ No |
| **CSV Export & Plot Generation** | ✅ Yes | ❌ No |
| **Real IBM Quantum QPU Execution** | ❌ No | ✅ **Yes** |

#### To run directly on real IBM Quantum Hardware:
```bash
# 1. Submit a 3-qubit Grover search circuit to the least busy physical QPU:
python run_ibm_quantum.py --token "YOUR_API_TOKEN" --qubits 3 --targets 101 --shots 2048

# 2. Re-verify or inspect the live completed job record without re-waiting in queue:
python run_ibm_quantum.py --job-id dbhnsic2d77s739d42pg
```

#### Real Verified Execution Metrics (`ibm_marrakesh` - 156-qubit Heron r2):
- **Job ID:** [`dbhnsic2d77s739d42pg`](https://quantum.ibm.com/jobs/dbhnsic2d77s739d42pg)
- **Target State |101> Success:** **71.44%** (1,463 hits / 2,048 shots)
- **Zero-Noise Ideal Statevector:** **94.53%**
- **Hardware Noise Degradation:** **24.43%**
- **Physical 2-Qubit CZ Gates:** 39 (Transpiled Depth: 146)

---

### Part 4: Google Colab Interactive Notebook

Open the complete benchmark suite, theoretical calculations, and real IBM Quantum hardware cells in Google Colab with one click:

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/vibhaskesana/Grover-algo/blob/main/GroverLab_Colab_Visualizations.ipynb)
---

## 🧮 Hardware-Calibrated Search Difficulty Score ($\text{SDS}_{\text{QPU}}$)

To predict circuit vulnerability on physical quantum hardware prior to execution, we developed the **Hardware-Calibrated Search Difficulty Score ($\text{SDS}_{\text{QPU}}$)**, calibrated directly against empirical measurements from IBM Quantum's 156-qubit Heron r2 processor (`ibm_marrakesh`):

$$\mathbf{\text{SDS}_{\text{QPU}} = \sqrt{Q_{\text{norm}} \times M_{\text{diff,norm}} \times \left(1 + \kappa_{\text{hardware}} \cdot \mathcal{T}_{\text{topo}}(n, M)\right)}}$$

### Formula Components:
- **Qubit Scale Factor**: $Q_{\text{norm}} = \frac{n}{4.0}$
- **Marked-State Sparsity Factor**: $M_{\text{diff,norm}} = \frac{(1 - M/N) - 0.50}{0.4375}$
- **Empirical Hardware Calibration Constant**: $\kappa_{\text{hardware}} = \frac{D_{\text{real, QPU}}}{D_{\text{simulated}}} = \frac{24.43\%}{8.65\%} \approx \mathbf{2.8236}$ (Derived from `ibm_marrakesh` Job `dbhnsic2d77s739d42pg`)
- **Heavy-Hex Topological Routing Overhead**: $\mathcal{T}_{\text{topo}}(n, M) = \frac{N_{\text{CZ}}(n, M)}{39.0}$ (Physical 2-qubit entangling gates normalized to the 3-qubit baseline)

### Benchmark Comparison Table (8 Configurations):

| Configuration | $n$ | $M$ | Physical 2Q $CZ$s | Ideal $P(k)$ | Simulated $P_{\text{noisy}}$ | QPU $P_{\text{hardware}}$ | Real Degradation | Baseline $\text{SDS}_{\text{sim}}$ | **New $\text{SDS}_{\text{QPU}}$** |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`2q-m2`** | 2 | 2 | 1 | $100\%$ | $90.0\%$ | $89.5\%$ | $10.5\%$ | $0.000$ | **$0.000$** |
| **`2q-m1`** | 2 | 1 | 3 | $100\%$ | $90.0\%$ | $88.6\%$ | $11.4\%$ | $0.756$ | **$0.590$** |
| **`3q-m4`** | 3 | 4 | 12 | $100\%$ | $90.0\%$ | $84.4\%$ | $15.6\%$ | $0.000$ | **$0.000$** |
| **`3q-m2`** | 3 | 2 | 24 | $100\%$ | $90.0\%$ | $78.8\%$ | $21.2\%$ | $0.926$ | **$1.083$** |
| **`3q-m1` (Verified)** | 3 | 1 | **39** | $94.5\%$ | $86.4\%$ | **$71.4\%$** | **$24.4\%$** | $1.134$ | **$1.568$** |
| **`4q-m4`** | 4 | 4 | 45 | $100\%$ | $90.0\%$ | $69.0\%$ | $31.0\%$ | $1.069$ | **$1.560$** |
| **`4q-m2`** | 4 | 2 | 85 | $96.1\%$ | $86.6\%$ | $50.7\%$ | $49.3\%$ | $1.309$ | **$2.476$** |
| **`4q-m1`** | 4 | 1 | 140 | $96.1\%$ | $86.6\%$ | $25.2\%$ | $74.8\%$ | $1.414$ | **$3.337$** |

### Statistical Validation:
- **Spearman Rank Correlation:** **$\rho = 0.9341$** ($p = 6.79 \times 10^{-4}$)
- **Pearson Linear Correlation:** **$r = 0.9489$** ($p < 0.001$)

---

## 📐 Core Mathematical Formulations

- **Search Space Dimension**: $N = 2^n$ basis states
- **Phase Oracle Operator**: $U_w = I - 2|w\rangle\langle w|$
- **Grover Diffuser Operator**: $U_s = 2|s\rangle\langle s| - I$
- **Step Rotation Angle**: $\theta = 2 \arcsin\left(\sqrt{\frac{M}{N}}\right)$
- **Theoretical Optimal Iterations**: $k_{\text{opt}} \approx \left\lfloor \frac{\pi}{4} \sqrt{\frac{N}{M}} \right\rfloor$
- **Theoretical Success Probability**: $P(k) = \sin^2\left(\frac{(2k+1)\theta}{2}\right)$

---

## 📁 Repository Directory Structure

```
Grover's/
├── public/                      # Static web assets & generated benchmark artifacts
│   └── results/                 # Output CSV and plot PNGs served to web UI
│       ├── grover_benchmark_results.csv
│       ├── sds_vs_degradation.png
│       └── success_prob_vs_iterations.png
├── python/                      # Standalone Python Qiskit Laboratory
│   ├── venv/                    # Python virtual environment
│   ├── qiskit_grover.py         # Real Qiskit circuit builder & Aer simulator
│   ├── noisy_simulation.py      # Aer physical noise model simulation
│   ├── ibm_hardware.py          # Real IBM Quantum QPU runner (qiskit-ibm-runtime)
│   ├── sds.py                   # Search Difficulty Score calculation & Spearman validation
│   ├── run_experiments.py       # Master runner script
│   ├── requirements.txt         # Python package dependencies
│   ├── README.md                # Dedicated Python lab guide
│   └── results/                 # Generated CSV and plot outputs
├── src/                         # React 19 + TypeScript Web App
│   ├── components/              # Modular UI components
│   │   ├── benchmark/          # Benchmark suite & key findings
│   │   ├── code/               # Qiskit code exporter
│   │   ├── common/             # KaTeX MathView & shared components
│   │   ├── experiment/         # Interactive workbench controls
│   │   ├── hero/               # Hero landing header
│   │   ├── history/            # Saved run history table
│   │   ├── layout/             # Navbar & Footer
│   │   ├── methodology/        # Mathematical documentation
│   │   ├── overview/           # Research overview
│   │   ├── results/            # Simulation dashboard & theoretical cards
│   │   └── visualization/      # 2D Rotation, Amplitude & Probability charts
│   ├── context/                # Experiment state context & Monte Carlo simulator
│   ├── lib/                    # Math helpers & Qiskit code generator
│   ├── App.tsx                 # Main application component
│   └── index.css               # Global CSS & KaTeX styling
├── index.html                   # HTML entry point with KaTeX CDN
├── package.json                 # Node dependencies & Vite scripts
└── vite.config.ts              # Vite configuration
```

---

## 🛠️ Tech Stack Summary

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Quantum & Science**: Qiskit 1.x, Qiskit Aer, Qiskit IBM Runtime, NumPy, SciPy, Pandas, Matplotlib
- **Math Formatting**: KaTeX (LaTeX Typesetting)
- **Icons**: Lucide React

---

## 📜 License

This project is open-source and released under the **MIT License**. Free for educational, academic, and research purposes.
