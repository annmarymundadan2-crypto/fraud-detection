import React from 'react';
import { ArrowRight } from 'lucide-react';
import { MODEL_BENCHMARK_METRICS } from '../data/notebookData';
import { TrainingChart } from './TrainingChart';

interface ModelBenchmarkProps {
  onOpenSimulator: () => void;
}

export const ModelBenchmark: React.FC<ModelBenchmarkProps> = ({ onOpenSimulator }) => {
  const { ann, rf } = MODEL_BENCHMARK_METRICS;

  const annLayers = [
    { name: 'Input Layer', shape: '9 features', detail: 'StandardScaler z-scores' },
    { name: 'Dense Layer 1', shape: '16 units', detail: 'ReLU · 160 params' },
    { name: 'Dense Layer 2', shape: '8 units', detail: 'ReLU · 136 params' },
    { name: 'Output Layer', shape: '1 unit', detail: 'Sigmoid · 9 params' },
  ];

  const comparisonRows = [
    {
      metric: 'Notebook Source',
      annVal: ann.notebookFile,
      rfVal: rf.notebookFile,
    },
    {
      metric: 'Test Set Accuracy (400 rows)',
      annVal: `${ann.testAccuracy.toFixed(2)}%`,
      rfVal: `${rf.testAccuracy.toFixed(2)}%`,
    },
    {
      metric: 'Training Split Strategy',
      annVal: 'train_test_split(test_size=0.2, random_state=42)',
      rfVal: 'train_test_split(test_size=0.2, random_state=42, stratify=y)',
    },
    {
      metric: 'Categorical Encoding',
      annVal: 'pd.get_dummies(X, drop_first=True) -> 9 cols',
      rfVal: 'pd.get_dummies(X, columns=["transaction_type"]) -> 10 cols',
    },
    {
      metric: 'Feature Scaling',
      annVal: 'StandardScaler (fit on X_train, transform X_test)',
      rfVal: 'None (Decision Trees are scale-invariant)',
    },
    {
      metric: 'Model Architecture',
      annVal: 'Sequential MLP (16 -> 8 -> 1, Adam, 30 epochs)',
      rfVal: 'RandomForestClassifier (n_estimators=100, random_state=42)',
    },
    {
      metric: 'Inference Output',
      annVal: 'Continuous Sigmoid Probability (0.9987213 on sample)',
      rfVal: 'Discrete Class Vote (1 -> ALERT! Fraud Transaction Detected)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs text-slate-500">ANN Test Accuracy</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-blue-700">
            83.25%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Keras Sequential · +2.25% over RF
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs text-slate-500">Random Forest Test Accuracy</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-slate-900">
            81.00%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            100 Decision Trees · Stratified split
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs text-slate-500">ANN Epoch 30 Train Acc / Loss</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-slate-900">
            86.00% <span className="text-sm font-normal text-slate-400">/</span> 0.3197
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Up from 61.06% accuracy at Epoch 1
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="text-xs text-slate-500">Dataset Partition</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-slate-900">
            1,600 <span className="text-sm font-normal text-slate-400">/</span> 400
          </div>
          <div className="mt-1 text-xs text-slate-500">
            upi_fraud_dataset_2000_v2.csv (80/20)
          </div>
        </div>
      </div>

      {/* Interactive 30-Epoch Training Curve */}
      <TrainingChart />

      {/* Architecture Comparison Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ANN Topology */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Artificial Neural Network Topology
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total trainable parameters: 305 (without Dropout)
              </p>
            </div>
            <span className="text-xs font-mono text-blue-700">TensorFlow / Keras</span>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-stretch">
            {annLayers.map((layer, idx) => (
              <div
                key={layer.name}
                className="relative p-3 bg-slate-50 border border-slate-200 rounded-md flex flex-col justify-between"
              >
                <div className="text-[11px] text-slate-500">
                  0{idx + 1}. {layer.name}
                </div>
                <div className="text-sm font-mono font-semibold text-slate-900 my-1.5">
                  {layer.shape}
                </div>
                <div className="text-[11px] text-slate-600">{layer.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Random Forest Topology */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Random Forest Ensemble Architecture
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Parallel bagging across 100 unpruned CART trees
                </p>
              </div>
              <span className="text-xs font-mono text-slate-600">scikit-learn</span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <div className="text-slate-500">Estimators</div>
                <div className="text-base font-mono font-semibold text-slate-900 mt-1">
                  100 Trees
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <div className="text-slate-500">Feature Space</div>
                <div className="text-base font-mono font-semibold text-slate-900 mt-1">
                  10 Cols
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <div className="text-slate-500">Aggregation</div>
                <div className="text-base font-mono font-semibold text-slate-900 mt-1">
                  Majority
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Test both architectures interactively on live inputs
            </span>
            <button
              type="button"
              onClick={onOpenSimulator}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Open Live Simulator
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Side-by-Side Matrix */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            Pipeline &amp; Hyperparameter Comparison Matrix
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="font-medium px-5 py-3 w-56">Dimension</th>
                <th className="font-medium px-5 py-3">ANN (ANN_DL_prj)</th>
                <th className="font-medium px-5 py-3">Random Forest (PRJ_RF_UPI)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonRows.map((row) => (
                <tr key={row.metric} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-medium text-slate-900">{row.metric}</td>
                  <td className="px-5 py-3 font-mono text-slate-700">{row.annVal}</td>
                  <td className="px-5 py-3 font-mono text-slate-700">{row.rfVal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
