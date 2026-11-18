import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  NOTEBOOK_PRESETS,
  TransactionInput,
  TransactionType,
} from '../data/notebookData';
import { evaluateDualModels } from '../lib/fraudModels';

interface LiveSimulatorProps {
  transaction: TransactionInput;
  onChange: (next: TransactionInput) => void;
  onReset: () => void;
  onSaveToDataset: (tx: TransactionInput, verdict: 0 | 1) => void;
}

type DiagnosticTab = 'drivers' | 'preprocessing' | 'internals';

export const LiveSimulator: React.FC<LiveSimulatorProps> = ({
  transaction,
  onChange,
  onReset,
  onSaveToDataset,
}) => {
  const [diagTab, setDiagTab] = useState<DiagnosticTab>('drivers');
  const [savedNotice, setSavedNotice] = useState(false);

  const evaluation = useMemo(() => evaluateDualModels(transaction), [transaction]);
  const { ann, rf, agreement } = evaluation;

  const updateField = <K extends keyof TransactionInput>(
    key: K,
    value: TransactionInput[K]
  ) => {
    onChange({ ...transaction, [key]: value });
  };

  const handleSave = () => {
    onSaveToDataset(transaction, ann.verdict === 'FRAUD' ? 1 : 0);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2400);
  };

  const maxImpact = Math.max(
    1.5,
    ...ann.contributions.map((c) => Math.abs(c.riskImpact))
  );

  return (
    <div className="space-y-6">
      {/* Quick Presets Row */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Notebook &amp; Dataset Test Cases
            </h2>
            <p className="text-xs text-slate-500">
              Load exact inputs from ANN_DL_prj_61a82bde.ipynb and PRJ_RF_UPI_50a30f40.ipynb
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to ANN Sample
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {NOTEBOOK_PRESETS.map((preset) => {
            const isSelected =
              preset.input.amount === transaction.amount &&
              preset.input.transaction_type === transaction.transaction_type &&
              preset.input.hour === transaction.hour &&
              preset.input.failed_attempts === transaction.failed_attempts &&
              preset.input.location_match === transaction.location_match &&
              preset.input.device_match === transaction.device_match;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange({ ...preset.input })}
                className={`text-left p-3 rounded-md border transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-blue-700 bg-blue-50/50'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {preset.label}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {preset.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Transaction Parameter Inputs */}
        <section
          aria-label="Transaction Feature Inputs"
          className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-900">
                Transaction Features (8 Inputs)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">float / int / cat</span>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="tx-amount" className="text-xs font-medium text-slate-700">
                Transaction Amount (INR)
              </label>
              <span className="text-xs font-mono tabular-nums font-semibold text-slate-900">
                ₹{transaction.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="tx-amount"
                type="number"
                min={1}
                max={100000}
                step={50}
                value={transaction.amount}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  updateField('amount', Number.isFinite(v) && v >= 0 ? v : 0);
                }}
                className="w-28 px-2.5 py-1.5 text-sm font-mono tabular-nums border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700"
              />
              <input
                type="range"
                aria-label="Transaction Amount Slider"
                min={100}
                max={30000}
                step={100}
                value={Math.min(30000, transaction.amount)}
                onChange={(e) => updateField('amount', Number(e.target.value))}
                className="flex-1 accent-blue-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Transaction Type */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-slate-700">
              Transaction Type
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-md">
              {(['UPI', 'P2P', 'P2M'] as TransactionType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateField('transaction_type', type)}
                  className={`py-2 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    transaction.transaction_type === type
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Hour of Day */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="tx-hour" className="text-xs font-medium text-slate-700">
                Transaction Hour (0–23)
              </label>
              <span className="text-xs font-mono tabular-nums font-semibold text-slate-900">
                {String(transaction.hour).padStart(2, '0')}:00
                {transaction.hour <= 5 || transaction.hour >= 22 ? ' (Nocturnal)' : ' (Daytime)'}
              </span>
            </div>
            <input
              id="tx-hour"
              type="range"
              min={0}
              max={23}
              step={1}
              value={transaction.hour}
              onChange={(e) => updateField('hour', Number(e.target.value))}
              className="w-full accent-blue-700 cursor-pointer"
            />
          </div>

          {/* Daily Transactions & Failed Attempts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="tx-daily" className="block text-xs font-medium text-slate-700">
                Daily Transactions
              </label>
              <input
                id="tx-daily"
                type="number"
                min={0}
                max={50}
                value={transaction.daily_transactions}
                onChange={(e) =>
                  updateField('daily_transactions', Math.max(0, Math.min(50, Number(e.target.value) || 0)))
                }
                className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tx-failed" className="block text-xs font-medium text-slate-700">
                Failed Attempts
              </label>
              <input
                id="tx-failed"
                type="number"
                min={0}
                max={15}
                value={transaction.failed_attempts}
                onChange={(e) =>
                  updateField('failed_attempts', Math.max(0, Math.min(15, Number(e.target.value) || 0)))
                }
                className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
          </div>

          {/* Binary Flags */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-slate-700">Location Match</span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
                <button
                  type="button"
                  onClick={() => updateField('location_match', 1)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    transaction.location_match === 1
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Match (1)
                </button>
                <button
                  type="button"
                  onClick={() => updateField('location_match', 0)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    transaction.location_match === 0
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mismatch (0)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-slate-700">Device Match</span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
                <button
                  type="button"
                  onClick={() => updateField('device_match', 1)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    transaction.device_match === 1
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Trusted (1)
                </button>
                <button
                  type="button"
                  onClick={() => updateField('device_match', 0)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    transaction.device_match === 0
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Unknown (0)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-slate-700">New Beneficiary</span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
                <button
                  type="button"
                  onClick={() => updateField('new_beneficiary', 0)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    transaction.new_beneficiary === 0
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Existing (0)
                </button>
                <button
                  type="button"
                  onClick={() => updateField('new_beneficiary', 1)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    transaction.new_beneficiary === 1
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  New Payee (1)
                </button>
              </div>
            </div>
          </div>

          {/* Save Case Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {savedNotice ? 'Logged to Dataset Explorer' : 'Log Transaction to Dataset Table'}
            </button>
          </div>
        </section>

        {/* Right Column: Dual Model Verdicts & Diagnostics */}
        <section
          aria-label="Dual Model Classification Results"
          className="lg:col-span-7 space-y-6"
        >
          {/* Side-by-Side Model Verdicts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ANN Verdict */}
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">Keras ANN (MLP)</span>
                <span className="font-mono tabular-nums">83.25% Test Acc</span>
              </div>

              <div className="mt-3 flex items-center gap-2.5">
                {ann.verdict === 'FRAUD' ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                <span
                  className={`text-lg font-bold tracking-tight ${
                    ann.verdict === 'FRAUD' ? 'text-red-700' : 'text-emerald-700'
                  }`}
                >
                  {ann.verdict === 'FRAUD' ? 'FRAUD TRANSACTION' : 'NORMAL TRANSACTION'}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">Sigmoid Output Probability</span>
                  <span className="font-mono tabular-nums text-base font-semibold text-slate-900">
                    {(ann.probability * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      ann.verdict === 'FRAUD' ? 'bg-red-600' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(2, ann.probability * 100))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-400">
                  <span>0.00 (Normal)</span>
                  <span>Threshold: 0.50</span>
                  <span>1.00 (Fraud)</span>
                </div>
              </div>
            </div>

            {/* Random Forest Verdict */}
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">Random Forest (100 Trees)</span>
                <span className="font-mono tabular-nums">81.00% Test Acc</span>
              </div>

              <div className="mt-3 flex items-center gap-2.5">
                {rf.verdict === 'FRAUD' ? (
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                <span
                  className={`text-lg font-bold tracking-tight ${
                    rf.verdict === 'FRAUD' ? 'text-red-700' : 'text-emerald-700'
                  }`}
                >
                  {rf.verdict === 'FRAUD' ? 'ALERT: FRAUD' : 'Normal Transaction'}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500">Ensemble Tree Majority Vote</span>
                  <span className="font-mono tabular-nums text-base font-semibold text-slate-900">
                    {rf.fraudVotes} / 100 trees
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      rf.verdict === 'FRAUD' ? 'bg-red-600' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${rf.fraudVotes}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-400">
                  <span>Normal votes: {rf.normalVotes}</span>
                  <span>Split: ≥50</span>
                  <span>Fraud votes: {rf.fraudVotes}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Consensus Summary Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="font-semibold">Model Consensus:</span>
              <span>
                {agreement
                  ? `Both ANN and Random Forest classify this transaction as ${ann.verdict}.`
                  : `Model divergence — ANN predicts ${ann.verdict} (${(ann.probability * 100).toFixed(1)}%), whereas Random Forest votes ${rf.verdict} (${rf.fraudVotes}/100 trees).`}
              </span>
            </div>
            <span className="font-mono tabular-nums text-slate-500">
              Raw Prob Delta: {(Math.abs(ann.probability - rf.probability) * 100).toFixed(1)}%
            </span>
          </div>

          {/* Diagnostic Detail Panel */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                Inference Inspection
              </h3>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md self-start sm:self-auto">
                {(
                  [
                    { id: 'drivers', label: 'Risk Drivers' },
                    { id: 'preprocessing', label: 'Encoded Vectors' },
                    { id: 'internals', label: 'Layer & Tree Splits' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDiagTab(t.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      diagTab === t.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {diagTab === 'drivers' && (
              <div className="mt-4 divide-y divide-slate-100">
                {ann.contributions.map((item) => {
                  const pct = Math.min(100, (Math.abs(item.riskImpact) / maxImpact) * 100);
                  const isFraudPush = item.riskImpact >= 0;
                  return (
                    <div
                      key={item.feature}
                      className="py-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                    >
                      <div className="sm:col-span-4">
                        <div className="font-medium text-slate-900">{item.label}</div>
                        <div className="text-[11px] text-slate-500">{item.explanation}</div>
                      </div>
                      <div className="sm:col-span-2 font-mono tabular-nums text-slate-700 sm:text-right">
                        {item.rawValue}
                      </div>
                      <div className="sm:col-span-4 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded overflow-hidden">
                          <div
                            className={`h-full transition-all duration-200 ${
                              isFraudPush ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(6, pct)}%` }}
                          />
                        </div>
                      </div>
                      <div
                        className={`sm:col-span-2 font-mono tabular-nums text-right font-medium ${
                          isFraudPush ? 'text-red-700' : 'text-emerald-700'
                        }`}
                      >
                        {isFraudPush ? '+' : ''}
                        {item.riskImpact.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {diagTab === 'preprocessing' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="text-xs font-semibold text-slate-900 mb-1">
                    ANN Vector: get_dummies(drop_first=True) + StandardScaler
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    9 features (P2P dropped as reference baseline)
                  </p>
                  <div className="border border-slate-200 rounded-md overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="text-left font-medium px-3 py-2">Feature</th>
                          <th className="text-right font-medium px-3 py-2">Raw</th>
                          <th className="text-right font-medium px-3 py-2">Scaled (z)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                        {ann.encodedVector9.map((row) => (
                          <tr key={row.name} className="hover:bg-slate-50/70">
                            <td className="px-3 py-1.5 text-slate-700 truncate max-w-[140px]">
                              {row.name}
                            </td>
                            <td className="px-3 py-1.5 text-right text-slate-900">{row.raw}</td>
                            <td className="px-3 py-1.5 text-right text-blue-700">
                              {row.scaled >= 0 ? `+${row.scaled.toFixed(2)}` : row.scaled.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-900 mb-1">
                    Random Forest Vector: Full One-Hot (Unscaled)
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    10 features (P2M, P2P, UPI all retained)
                  </p>
                  <div className="border border-slate-200 rounded-md overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="text-left font-medium px-3 py-2">Feature</th>
                          <th className="text-right font-medium px-3 py-2">Tree Input</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                        {rf.encodedVector10.map((row) => (
                          <tr key={row.name} className="hover:bg-slate-50/70">
                            <td className="px-3 py-1.5 text-slate-700">{row.name}</td>
                            <td className="px-3 py-1.5 text-right text-slate-900">{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {diagTab === 'internals' && (
              <div className="mt-4 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                    <div className="text-[11px] text-slate-500">Dense(16, ReLU) Active</div>
                    <div className="text-base font-mono tabular-nums font-semibold text-slate-900 mt-1">
                      {ann.hiddenLayer1ActiveCount} / 16 neurons
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                    <div className="text-[11px] text-slate-500">Dense(8, ReLU) Active</div>
                    <div className="text-base font-mono tabular-nums font-semibold text-slate-900 mt-1">
                      {ann.hiddenLayer2ActiveCount} / 8 neurons
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                    <div className="text-[11px] text-slate-500">Output Sigmoid Logit (z)</div>
                    <div className="text-base font-mono tabular-nums font-semibold text-slate-900 mt-1">
                      {ann.logit >= 0 ? `+${ann.logit}` : ann.logit}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-900 mb-2">
                    Random Forest Key Split Conditions Evaluated
                  </h4>
                  <div className="border border-slate-200 rounded-md divide-y divide-slate-100">
                    {rf.triggeredRules.map((rule) => (
                      <div
                        key={rule.ruleName}
                        className="px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-medium text-slate-900">{rule.ruleName}</span>
                          <span className="text-slate-400 mx-2">·</span>
                          <code className="font-mono text-[11px] text-slate-600">
                            {rule.condition}
                          </code>
                        </div>
                        <div className="flex items-center gap-3 font-mono tabular-nums">
                          <span
                            className={
                              rule.triggered ? 'text-red-700 font-medium' : 'text-slate-400'
                            }
                          >
                            {rule.triggered ? 'TRIGGERED' : 'CLEAR'}
                          </span>
                          <span className="text-slate-600">
                            +{rule.treesSupportingFraud} trees
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
