import React from 'react';
import { ExperimentProvider, useExperiment } from './context/ExperimentContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ExperimentPanel } from './components/experiment/ExperimentPanel';
import { TheoreticalCard } from './components/results/TheoreticalCard';
import { SimulationDashboard } from './components/results/SimulationDashboard';
import { ProbabilityChart } from './components/visualization/ProbabilityChart';
import { AmplitudeEvolution } from './components/visualization/AmplitudeEvolution';
import { CircuitDiagram } from './components/visualization/CircuitDiagram';
import { MarkedStatesComparison } from './components/benchmark/MarkedStatesComparison';
import { QubitScalingCards } from './components/benchmark/QubitScalingCards';
import { KeyFindings } from './components/benchmark/KeyFindings';
import { UnifiedExperimentTable } from './components/benchmark/UnifiedExperimentTable';
import { QiskitCodePanel } from './components/code/QiskitCodePanel';

type TabId = 'simulator' | 'benchmarks' | 'export';

const tabs: { id: TabId; label: string }[] = [
  { id: 'simulator', label: 'Simulator' },
  { id: 'benchmarks', label: 'Benchmarks' },
  { id: 'export', label: 'Qiskit Export' },
];

const TabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useExperiment();
  return (
    <div className="flex gap-1 border-b border-zinc-800 mb-8">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveTab(t.id)}
          className={`px-5 py-2.5 text-sm font-medium transition-colors relative ${
            activeTab === t.id
              ? 'text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {t.label}
          {activeTab === t.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>
      ))}
    </div>
  );
};

const SimulatorView: React.FC = () => (
  <div className="space-y-6">
    <ExperimentPanel />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TheoreticalCard />
      <SimulationDashboard />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ProbabilityChart />
      <AmplitudeEvolution />
    </div>
    <CircuitDiagram />
  </div>
);

const BenchmarksView: React.FC = () => (
  <div className="space-y-6">
    <UnifiedExperimentTable />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <MarkedStatesComparison />
      <QubitScalingCards />
    </div>
    <KeyFindings />
  </div>
);

const ExportView: React.FC = () => (
  <QiskitCodePanel />
);

const Workspace: React.FC = () => {
  const { activeTab } = useExperiment();
  return (
    <>
      <TabBar />
      {activeTab === 'simulator' && <SimulatorView />}
      {activeTab === 'benchmarks' && <BenchmarksView />}
      {activeTab === 'export' && <ExportView />}
    </>
  );
};

export default function App() {
  return (
    <ExperimentProvider>
      <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-200 font-sans">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Workspace />
        </main>
        <Footer />
      </div>
    </ExperimentProvider>
  );
}
