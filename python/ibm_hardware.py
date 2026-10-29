"""
IBM Quantum Hardware Execution Module
Submits Grover circuits to real IBM Quantum hardware via qiskit-ibm-runtime.
"""

import os
from typing import Dict, Optional, Tuple
from qiskit import QuantumCircuit, transpile
from qiskit_grover import build_grover_circuit


def run_on_ibm_hardware(
    qc: QuantumCircuit,
    api_token: Optional[str] = None,
    backend_name: Optional[str] = None,
    shots: int = 2048
) -> Tuple[Optional[Dict[str, int]], Dict]:
    """
    Submits Grover circuit to real IBM Quantum hardware using Qiskit Runtime API.
    Returns: (counts_dict, hardware_metadata)
    
    Requirement:
    Requires an active IBM Quantum API Token.
    Can be set via environment variable: export IBM_QUANTUM_TOKEN="your_token_here"
    or passed directly as api_token="your_token_here".
    """
    token = api_token or os.environ.get("IBM_QUANTUM_TOKEN")
    
    if not token:
        metadata = {
            "status": "SKIPPED_NO_TOKEN",
            "message": "IBM Quantum Token not provided. Set IBM_QUANTUM_TOKEN environment variable to run on real hardware.",
            "requires_token": True,
            "transpiled_depth": None,
            "gate_counts": None
        }
        return None, metadata
        
    try:
        from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler
        
        # Initialize IBM Quantum Runtime Service
        # Initialize IBM Quantum Runtime Service
        service = None
        for ch in ["ibm_quantum_platform", "ibm_cloud"]:
            try:
                service = QiskitRuntimeService(channel=ch, token=token)
                break
            except Exception:
                continue
        if service is None:
            raise ValueError("Failed to authenticate with IBM Quantum. Please check your token or ensure a free Qiskit Runtime instance is provisioned at https://cloud.ibm.com/catalog/services/qiskit-runtime")
        
        # Select target hardware backend
        if backend_name:
            backend = service.backend(backend_name)
        else:
            # Select least busy operational backend with at least 5 qubits
            backend = service.least_busy(operational=True, simulator=False, min_num_qubits=5)
            
        print(f"Submitting job to IBM Quantum backend: {backend.name}")
        
        # Transpile circuit for target hardware topology and basis gates
        transpiled_qc = transpile(qc, backend=backend, optimization_level=3)
        depth = transpiled_qc.depth()
        gate_counts = dict(transpiled_qc.count_ops())
        
        # Instantiate Sampler primitive and submit job
        sampler = Sampler(mode=backend)
        job = sampler.run([transpiled_qc], shots=shots)
        print(f"Job submitted successfully. Job ID: {job.job_id()}")
        
        result = job.result()
        pub_result = result[0]
        
        # Convert bitstring counts
        bitstrings = pub_result.data.meas.get_bitstrings()
        counts: Dict[str, int] = {}
        for bs in bitstrings:
            counts[bs] = counts.get(bs, 0) + 1
            
        metadata = {
            "status": "SUCCESS",
            "backend_name": backend.name,
            "job_id": job.job_id(),
            "transpiled_depth": depth,
            "gate_counts": gate_counts,
            "requires_token": False
        }
        
        return counts, metadata

    except Exception as e:
        metadata = {
            "status": "ERROR",
            "message": str(e),
            "requires_token": True,
            "transpiled_depth": None,
            "gate_counts": None
        }
        return None, metadata
