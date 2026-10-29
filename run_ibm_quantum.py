#!/usr/bin/env python3
"""
IBM Quantum Hardware Execution Runner for GroverLab
Submits Grover's search algorithm circuit to real IBM Quantum superconducting QPUs via Qiskit Runtime.

Usage:
    python run_ibm_quantum.py --token <YOUR_IBM_TOKEN>
    python run_ibm_quantum.py --token <YOUR_IBM_TOKEN> --qubits 3 --targets 101 --shots 2048
    python run_ibm_quantum.py  # Prompts securely for token if not passed or set in environment

Environment Variable:
    export IBM_QUANTUM_TOKEN="your_token_here"
"""

import os
import sys
import argparse
import getpass
import math
import time
from typing import List, Dict, Tuple, Optional

try:
    from qiskit import QuantumCircuit, transpile
    from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler
except ImportError:
    print("\n[ERROR] Required packages not found.")
    print("Please install Qiskit and Qiskit IBM Runtime:")
    print("    pip install qiskit qiskit-ibm-runtime\n")
    sys.exit(1)


# =====================================================================
# Circuit Construction Functions
# =====================================================================

def build_phase_oracle(n_qubits: int, target_states: List[str]) -> QuantumCircuit:
    """
    Constructs an exact phase oracle gate U_w for specified target states.
    Applies a -1 phase factor to basis states |x> in target_states.
    """
    oracle = QuantumCircuit(n_qubits, name="U_oracle")
    
    for target in target_states:
        target_str = target.zfill(n_qubits)
        
        # Apply X gates to map target state to |11...1>
        # Note: Qiskit uses little-endian ordering (qubit 0 is LSB)
        for q in range(n_qubits):
            bit = target_str[n_qubits - 1 - q]
            if bit == '0':
                oracle.x(q)
                
        # Apply multi-controlled Z gate
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
        else:
            controls = list(range(n_qubits - 1))
            target_q = n_qubits - 1
            oracle.h(target_q)
            oracle.mcx(controls, target_q)
            oracle.h(target_q)
            
        # Uncompute X gates
        for q in range(n_qubits):
            bit = target_str[n_qubits - 1 - q]
            if bit == '0':
                oracle.x(q)
                
    return oracle


def build_diffuser(n_qubits: int) -> QuantumCircuit:
    """
    Constructs the Grover diffusion operator U_s (2|s><s| - I).
    Reflects state amplitudes about their mean.
    """
    diffuser = QuantumCircuit(n_qubits, name="U_diffuser")
    
    # 1. Hadamard transform
    diffuser.h(range(n_qubits))
    
    # 2. X transform
    diffuser.x(range(n_qubits))
    
    # 3. Multi-controlled Z gate
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
    else:
        controls = list(range(n_qubits - 1))
        target_q = n_qubits - 1
        diffuser.h(target_q)
        diffuser.mcx(controls, target_q)
        diffuser.h(target_q)
        
    # 4. Uncompute X and H
    diffuser.x(range(n_qubits))
    diffuser.h(range(n_qubits))
    
    return diffuser


def build_grover_circuit(n_qubits: int, target_states: List[str], iterations: int) -> QuantumCircuit:
    """
    Assembles complete Grover quantum search circuit.
    """
    qc = QuantumCircuit(n_qubits, n_qubits)
    
    # State preparation: Uniform superposition
    qc.h(range(n_qubits))
    qc.barrier()
    
    oracle = build_phase_oracle(n_qubits, target_states)
    diffuser = build_diffuser(n_qubits)
    
    # Grover iteration loop
    for _ in range(iterations):
        qc.append(oracle.to_gate(), range(n_qubits))
        qc.append(diffuser.to_gate(), range(n_qubits))
        qc.barrier()
        
    # Measurement onto classical register
    qc.measure(range(n_qubits), range(n_qubits))
    return qc


def calculate_optimal_iterations(n_qubits: int, marked_count: int) -> int:
    """Computes theoretical optimal iterations: floor((pi / 4) * sqrt(N / M))"""
    N = 2 ** n_qubits
    M = max(1, marked_count)
    if M >= N:
        return 0
    k_opt = math.floor((math.pi / 4) * math.sqrt(N / M))
    return max(1, k_opt)


def calculate_theoretical_probability(n_qubits: int, marked_count: int, k: int) -> float:
    """Computes exact theoretical success probability: sin^2((2k + 1) * theta / 2)"""
    N = 2 ** n_qubits
    M = marked_count
    if M >= N:
        return 1.0
    theta = 2.0 * math.asin(math.sqrt(M / N))
    angle = (2 * k + 1) * (theta / 2.0)
    return float(math.sin(angle) ** 2)


# =====================================================================
# Main Execution Runner
# =====================================================================

def print_banner():
    print("=" * 72)
    print("        GROVERLAB: IBM QUANTUM REAL HARDWARE EXECUTION RUNNER         ")
    print("=" * 72)


def main():
    parser = argparse.ArgumentParser(
        description="Run Grover's algorithm on real IBM Quantum superconducting hardware."
    )
    parser.add_argument(
        "--token",
        type=str,
        default=None,
        help="IBM Quantum API Token (or via IBM_QUANTUM_TOKEN environment variable)"
    )
    parser.add_argument(
        "--qubits",
        type=int,
        choices=[2, 3, 4],
        default=3,
        help="Number of qubits (default: 3)"
    )
    parser.add_argument(
        "--targets",
        nargs="+",
        default=["101"],
        help="Marked target bitstring(s), e.g. --targets 101 or --targets 01 10 (default: 101)"
    )
    parser.add_argument(
        "--iterations",
        type=int,
        default=None,
        help="Grover iterations k (default: theoretical optimal k_opt)"
    )
    parser.add_argument(
        "--shots",
        type=int,
        default=2048,
        help="Number of measurement shots (default: 2048)"
    )
    parser.add_argument(
        "--backend",
        type=str,
        default=None,
        help="IBM Quantum backend name (e.g. ibm_fez, ibm_kyoto, ibm_brisbane). Default: least busy QPU"
    )
    parser.add_argument(
        "--channel",
        type=str,
        choices=["ibm_quantum_platform", "ibm_cloud"],
        default=None,
        help="Channel type: 'ibm_quantum_platform' or 'ibm_cloud' (default: auto-detect)"
    )
    parser.add_argument(
        "--instance",
        type=str,
        default=None,
        help="IBM Cloud service instance CRN (optional if account has default instance)"
    )
    parser.add_argument(
        "--optimization",
        type=int,
        choices=[0, 1, 2, 3],
        default=3,
        help="Transpiler optimization level (default: 3 for hardware error reduction)"
    )

    args = parser.parse_args()
    print_banner()

    # 1. Resolve API Token
    token = args.token or os.environ.get("IBM_QUANTUM_TOKEN")
    if not token:
        print("[!] No API token passed or found in environment.")
        print("    You can create a free IBM Quantum account at https://quantum.ibm.com")
        print("    Copy your API token from: https://quantum.ibm.com/account\n")
        try:
            token = getpass.getpass("Enter your IBM Quantum API Token (input will be hidden): ").strip()
        except KeyboardInterrupt:
            print("\nAborted.")
            sys.exit(0)

    if not token:
        print("[ERROR] Token cannot be empty. Exiting.")
        sys.exit(1)

    # 2. Validate Target States
    n_qubits = args.qubits
    targets = [t.strip().zfill(n_qubits) for t in args.targets]
    for t in targets:
        if len(t) != n_qubits or not all(c in '01' for c in t):
            print(f"[ERROR] Invalid target state '{t}' for n={n_qubits} qubits. Must be {n_qubits}-bit binary.")
            sys.exit(1)

    k_opt = calculate_optimal_iterations(n_qubits, len(targets))
    iterations = args.iterations if args.iterations is not None else k_opt
    p_theory = calculate_theoretical_probability(n_qubits, len(targets), iterations)

    print(f"\n[1/5] Configuration:")
    print(f"      Qubits (n)          : {n_qubits} (Search space N = {2**n_qubits})")
    print(f"      Target States (M={len(targets)}): {[f'|{t}>' for t in targets]}")
    print(f"      Iterations (k)      : {iterations} (Optimal k_opt = {k_opt})")
    print(f"      Shots               : {args.shots}")
    print(f"      Ideal Probability   : {p_theory * 100:.2f}%")

    # 3. Authenticate to IBM Quantum
    print(f"\n[2/5] Authenticating to IBM Quantum Runtime Service...")
    channels_to_try = [args.channel] if args.channel else ["ibm_quantum_platform", "ibm_cloud"]
    service = None
    last_error = None

    for ch in channels_to_try:
        try:
            kwargs = {"channel": ch, "token": token}
            if args.instance:
                kwargs["instance"] = args.instance
            service = QiskitRuntimeService(**kwargs)
            print(f"      [OK] Successfully authenticated via channel '{ch}'!")
            break
        except Exception as e:
            last_error = e

    if service is None:
        err_msg = str(last_error)
        print(f"\n[ERROR] Authentication failed: {last_error}")
        
        if "No matching instances found" in err_msg or "instances" in err_msg.lower():
            print("\n" + "=" * 70)
            print("  ACTION REQUIRED: ACTIVATE FREE QISKIT RUNTIME INSTANCE")
            print("=" * 70)
            print("Your IBM token was verified, but your account has 0 active Qiskit Runtime instances.")
            print("To enable access to physical IBM quantum computers (100% free):")
            print("  1. Open your browser to:")
            print("     https://cloud.ibm.com/catalog/services/qiskit-runtime")
            print("  2. Select the 'Lite' plan (Free tier with 10 min QPU time/month).")
            print("  3. Click the blue 'Create' button in the bottom right corner.")
            print("  4. Once created, re-run this command and it will connect immediately!")
            print("=" * 70 + "\n")
        else:
            print("Please verify your API key at https://cloud.ibm.com/iam/apikeys or https://quantum.ibm.com/account")
        sys.exit(1)

    # 4. Backend Selection
    print(f"\n[3/5] Selecting Target Quantum Backend...")
    try:
        if args.backend:
            backend = service.backend(args.backend)
            print(f"      Target Backend Selected: {backend.name} ({backend.num_qubits} qubits)")
        else:
            print("      Querying for least busy operational quantum hardware...")
            backend = service.least_busy(operational=True, simulator=False, min_num_qubits=n_qubits)
            print(f"      [OK] Selected Least Busy QPU: {backend.name} ({backend.num_qubits} physical qubits)")
            
        status = backend.status()
        print(f"      Status: {'Operational' if status.operational else 'Non-operational'} | Pending Jobs in Queue: {status.pending_jobs}")
    except Exception as e:
        print(f"\n[ERROR] Failed to connect to backend: {e}")
        sys.exit(1)

    # 5. Build and Transpile Circuit
    print(f"\n[4/5] Building & Transpiling Grover Circuit (Optimization Level = {args.optimization})...")
    qc = build_grover_circuit(n_qubits, targets, iterations)
    print(f"      Abstract Circuit Depth: {qc.depth()}, Gate Operations: {dict(qc.count_ops())}")

    transpiled_qc = transpile(qc, backend=backend, optimization_level=args.optimization)
    t_depth = transpiled_qc.depth()
    t_ops = dict(transpiled_qc.count_ops())
    print(f"      Transpiled Depth      : {t_depth}")
    print(f"      Physical Gates        : {t_ops}")

    # 6. Submit Job to Hardware
    print(f"\n[5/5] Submitting Job to Physical Quantum Computer ({backend.name})...")
    print("      Using Qiskit Runtime SamplerV2 primitive...")
    try:
        sampler = Sampler(mode=backend)
        job = sampler.run([transpiled_qc], shots=args.shots)
        job_id = job.job_id()
        print(f"      [OK] Job Submitted! Job ID: {job_id}")
        print(f"      Monitor your job live at: https://quantum.ibm.com/jobs/{job_id}")
        print("      Waiting for hardware execution to complete (polling status)...")

        # Polling status
        last_status = None
        while True:
            current_status = job.status()
            if current_status != last_status:
                print(f"      -> Current Job Status: {current_status}")
                last_status = current_status
            if current_status in ["DONE", "CANCELLED", "ERROR"]:
                break
            time.sleep(5)

        if current_status != "DONE":
            print(f"\n[ERROR] Job ended with non-successful status: {current_status}")
            sys.exit(1)

        result = job.result()
        pub_result = result[0]
        bitstrings = pub_result.data.meas.get_bitstrings()

        # Aggregate counts
        counts: Dict[str, int] = {}
        for bs in bitstrings:
            counts[bs] = counts.get(bs, 0) + 1

    except Exception as e:
        print(f"\n[ERROR] Runtime execution failed: {e}")
        sys.exit(1)

    # 7. Analyze & Display Results
    print("\n" + "=" * 72)
    print("                        EXPERIMENTAL RESULTS                          ")
    print("=" * 72)

    total_shots = sum(counts.values())
    target_shots = sum(counts.get(t, 0) for t in targets)
    p_hardware = target_shots / total_shots if total_shots > 0 else 0.0
    relative_degradation = ((p_theory - p_hardware) / p_theory) * 100.0 if p_theory > 0 else 0.0

    print(f"\nBackend                    : {backend.name}")
    print(f"Job ID                     : {job_id}")
    print(f"Total Measured Shots       : {total_shots}")
    print(f"Ideal Theoretical Prob     : {p_theory * 100:.2f}%")
    print(f"Real Hardware Success Prob : {p_hardware * 100:.2f}%")
    print(f"Hardware Noise Degradation : {relative_degradation:.2f}%\n")

    print("Measured State Distribution:")
    print("-" * 55)
    print(f"{'State':^10} | {'Counts':^10} | {'Probability':^14} | {'Target?'}")
    print("-" * 55)

    # Sort states by binary value
    all_states = [format(i, f'0{n_qubits}b') for i in range(2**n_qubits)]
    max_count = max(counts.values()) if counts else 1

    for st in all_states:
        c = counts.get(st, 0)
        prob = (c / total_shots) * 100.0
        is_tgt = "* TARGET" if st in targets else ""
        bar_len = int((c / max_count) * 20)
        bar = "#" * bar_len
        print(f"|{st}>      | {c:>7}    | {prob:>6.2f}% {bar:<20} | {is_tgt}")

    print("-" * 55)
    print("\n[OK] Real quantum hardware execution finished successfully!")
    print(f"  View full execution record and fidelity in IBM Quantum Dashboard:\n  https://quantum.ibm.com/jobs/{job_id}\n")


if __name__ == "__main__":
    main()
