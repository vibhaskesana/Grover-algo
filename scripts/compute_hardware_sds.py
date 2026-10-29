import math
import numpy as np

# 8 standard Grover benchmark configurations
configs = [
    {"id": "2q-m2", "name": "n=2, M=2", "n": 2, "M": 2, "N": 4,  "p_ideal": 1.000, "p_sim": 0.900, "d_sim": 0.1000, "cz_gates": 1},
    {"id": "2q-m1", "name": "n=2, M=1", "n": 2, "M": 1, "N": 4,  "p_ideal": 1.000, "p_sim": 0.900, "d_sim": 0.1000, "cz_gates": 3},
    {"id": "3q-m4", "name": "n=3, M=4", "n": 3, "M": 4, "N": 8,  "p_ideal": 1.000, "p_sim": 0.900, "d_sim": 0.1000, "cz_gates": 12},
    {"id": "3q-m2", "name": "n=3, M=2", "n": 3, "M": 2, "N": 8,  "p_ideal": 1.000, "p_sim": 0.900, "d_sim": 0.1000, "cz_gates": 24},
    {"id": "3q-m1", "name": "n=3, M=1", "n": 3, "M": 1, "N": 8,  "p_ideal": 0.9453, "p_sim": 0.8635, "d_sim": 0.0865, "cz_gates": 39, "d_real": 0.2443},
    {"id": "4q-m4", "name": "n=4, M=4", "n": 4, "M": 4, "N": 16, "p_ideal": 1.000, "p_sim": 0.900, "d_sim": 0.1000, "cz_gates": 45},
    {"id": "4q-m2", "name": "n=4, M=2", "n": 4, "M": 2, "N": 16, "p_ideal": 0.9613, "p_sim": 0.8660, "d_sim": 0.0991, "cz_gates": 85},
    {"id": "4q-m1", "name": "n=4, M=1", "n": 4, "M": 1, "N": 16, "p_ideal": 0.9613, "p_sim": 0.8660, "d_sim": 0.0991, "cz_gates": 140},
]

# Real IBM Hardware Benchmark Result (ibm_marrakesh - Job dbhnsic2d77s739d42pg)
d_sim_3q1 = 0.086536  # ~ 8.65%
d_hardware_3q1 = 0.24434  # ~ 24.43%
kappa_hardware = d_hardware_3q1 / d_sim_3q1  # 2.8235x

print("=" * 85)
print("     GROVERLAB: HARDWARE-CALIBRATED SEARCH DIFFICULTY SCORE (SDS_QPU)")
print("=" * 85)
print(f"Empirical Hardware Calibration Ratio kappa_hardware: {kappa_hardware:.4f}")
print("Derived from IBM Quantum (ibm_marrakesh, 156-qubit Heron r2):")
print("  - P_ideal: 94.53% | P_hardware: 71.44% | Real QPU Degradation: 24.43%")
print("-" * 85)
print(f"{'Config ID':<9} | {'n':^3} | {'M':^3} | {'CZs':^4} | {'Q_norm':^6} | {'M_norm':^6} | {'SDS_sim':^8} | {'SDS_QPU':^8} | {'Hardware D_est':^14}")
print("-" * 85)

sds_sim_list = []
sds_qpu_list = []
hardware_deg_list = []

for c in configs:
    q_norm = c["n"] / 4.0
    f = c["M"] / c["N"]
    m_diff = 1.0 - f
    m_norm = (m_diff - 0.50) / 0.4375
    
    # Old Simulated SDS (uniform noise_norm = 1.0)
    sds_sim = math.sqrt(max(0, q_norm * m_norm * 2.0))
    sds_sim_list.append(sds_sim)
    
    # Physical gate overhead factor relative to the 3-qubit baseline on heavy-hex topology
    topo_overhead = c["cz_gates"] / 39.0
    
    # Predicted Physical QPU Degradation: D_hardware = D_sim * kappa * topo_factor
    # (Bounded physically between 0 and 90% saturation)
    d_qpu_est = min(0.90, c["d_sim"] * (1.0 + (kappa_hardware - 1.0) * topo_overhead))
    hardware_deg_list.append(d_qpu_est)
    
    # New Hardware-Calibrated SDS (SDS_QPU)
    noise_qpu_term = 1.0 + (kappa_hardware * topo_overhead)
    sds_qpu = math.sqrt(max(0, q_norm * m_norm * noise_qpu_term))
    sds_qpu_list.append(sds_qpu)
    
    print(f"{c['id']:<9} | {c['n']:^3} | {c['M']:^3} | {c['cz_gates']:^4} | {q_norm:^6.2f} | {m_norm:^6.3f} | {sds_sim:^8.4f} | {sds_qpu:^8.4f} | {d_qpu_est * 100:^12.2f}%")

print("-" * 85)

# Calculate Spearman rank correlation between SDS_QPU and estimated physical degradation
from scipy.stats import spearmanr, pearsonr
rho, p_val = spearmanr(sds_qpu_list, hardware_deg_list)
r, _ = pearsonr(sds_qpu_list, hardware_deg_list)
print(f"Spearman Rank Correlation (rho) : {rho:.4f} (p-value: {p_val:.4e})")
print(f"Pearson Linear Correlation (r)  : {r:.4f}")
print("=" * 85)
