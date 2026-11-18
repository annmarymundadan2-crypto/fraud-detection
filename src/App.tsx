import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  Code2,
  Database,
  Menu,
  X,
} from 'lucide-react';
import {
  DATASET_SAMPLE_ROWS,
  DatasetRow,
  NOTEBOOK_PRESETS,
  TransactionInput,
} from './data/notebookData';
import { LiveSimulator } from './components/LiveSimulator';
import { ModelBenchmark } from './components/ModelBenchmark';
import { DatasetExplorer } from './components/DatasetExplorer';
import { NotebookPipeline } from './components/NotebookPipeline';

type WorkspaceTab = 'simulator' | 'benchmark' | 'dataset' | 'notebooks';

const NAV_ITEMS: { id: WorkspaceTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'simulator', label: 'Live Simulator', icon: Activity },
  { id: 'benchmark', label: 'Model Benchmark', icon: BarChart3 },
  { id: 'dataset', label: 'Dataset Explorer', icon: Database },
  { id: 'notebooks', label: 'Notebook Pipeline', icon: Code2 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('simulator');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transaction, setTransaction] = useState<TransactionInput>({
    ...NOTEBOOK_PRESETS[0].input,
  });
  const [datasetRows, setDatasetRows] = useState<DatasetRow[]>(DATASET_SAMPLE_ROWS);

  const activeNav = NAV_ITEMS.find((item) => item.id === activeTab) ?? NAV_ITEMS[0];

  const handleLoadIntoSimulator = (input: TransactionInput) => {
    setTransaction({ ...input });
    setActiveTab('simulator');
    setMobileMenuOpen(false);
  };

  const handleResetToANNSample = () => {
    setTransaction({ ...NOTEBOOK_PRESETS[0].input });
    setActiveTab('simulator');
  };

  const handleSaveToDataset = (input: TransactionInput, verdict: 0 | 1) => {
    const nextId =
      datasetRows.reduce((max, row) => Math.max(max, row.transaction_id), 0) + 1;
    const newRow: DatasetRow = {
      ...input,
      transaction_id: nextId,
      is_fraud: verdict,
      source_note: 'Custom simulator case',
    };
    setDatasetRows((prev) => [newRow, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar Rail */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[252px] bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="h-14 px-5 border-b border-slate-200 flex items-center justify-between">
            <span className="font-display text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              UPI Fraud Bench
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="p-1.5 text-slate-500 hover:text-slate-900 lg:hidden cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav aria-label="Primary Workspace" className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quiet Dataset Context */}
        <div className="p-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
          <div className="font-mono text-slate-700 truncate">
            upi_fraud_dataset_2000_v2.csv
          </div>
          <div className="tabular-nums">
            2,000 rows · 80/20 split · seed 42
          </div>
          <div className="tabular-nums text-slate-400">
            ANN 83.25% · RF 81.00%
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar Contract: Breadcrumb Left — Single Action Right */}
        <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 lg:hidden cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm truncate">
              <span className="text-slate-400 hidden sm:inline">Models</span>
              <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <h1 className="font-semibold text-slate-900 truncate">
                {activeNav.label}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetToANNSample}
            className="px-3.5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Load Sample Case
          </button>
        </header>

        {/* Active View Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1220px] w-full mx-auto">
          {activeTab === 'simulator' && (
            <LiveSimulator
              transaction={transaction}
              onChange={setTransaction}
              onReset={handleResetToANNSample}
              onSaveToDataset={handleSaveToDataset}
            />
          )}

          {activeTab === 'benchmark' && (
            <ModelBenchmark onOpenSimulator={() => setActiveTab('simulator')} />
          )}

          {activeTab === 'dataset' && (
            <DatasetExplorer
              rows={datasetRows}
              onLoadIntoSimulator={handleLoadIntoSimulator}
            />
          )}

          {activeTab === 'notebooks' && <NotebookPipeline />}
        </main>
      </div>
    </div>
  );
}
