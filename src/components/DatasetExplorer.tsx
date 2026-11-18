import React, { useMemo, useState } from 'react';
import { Play, Search } from 'lucide-react';
import { DatasetRow, TransactionInput, TransactionType } from '../data/notebookData';
import { evaluateDualModels } from '../lib/fraudModels';

interface DatasetExplorerProps {
  rows: DatasetRow[];
  onLoadIntoSimulator: (input: TransactionInput) => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  rows,
  onLoadIntoSimulator,
}) => {
  const [search, setSearch] = useState('');
  const [labelFilter, setLabelFilter] = useState<'all' | 'fraud' | 'normal'>('all');
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');

  const evaluatedRows = useMemo(() => {
    return rows.map((row) => {
      const evalRes = evaluateDualModels(row);
      return {
        row,
        annProb: evalRes.ann.probability,
        annVerdict: evalRes.ann.verdict,
        rfVotes: evalRes.rf.fraudVotes,
        rfVerdict: evalRes.rf.verdict,
      };
    });
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return evaluatedRows.filter(({ row }) => {
      if (labelFilter === 'fraud' && row.is_fraud !== 1) return false;
      if (labelFilter === 'normal' && row.is_fraud !== 0) return false;
      if (typeFilter !== 'ALL' && row.transaction_type !== typeFilter) return false;
      if (q) {
        const matchesId = String(row.transaction_id).includes(q);
        const matchesNote = row.source_note.toLowerCase().includes(q);
        const matchesType = row.transaction_type.toLowerCase().includes(q);
        return matchesId || matchesNote || matchesType;
      }
      return true;
    });
  }, [evaluatedRows, labelFilter, typeFilter, search]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const fraudCount = filtered.filter((r) => r.row.is_fraud === 1).length;
    const annCorrect = filtered.filter(
      (r) => (r.annVerdict === 'FRAUD' ? 1 : 0) === r.row.is_fraud
    ).length;
    const rfCorrect = filtered.filter(
      (r) => (r.rfVerdict === 'FRAUD' ? 1 : 0) === r.row.is_fraud
    ).length;
    return { total, fraudCount, annCorrect, rfCorrect };
  }, [filtered]);

  return (
    <div className="space-y-5">
      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID, channel, or pattern note..."
            aria-label="Search dataset rows"
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Ground Truth Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
            {(
              [
                { id: 'all', label: 'All Labels' },
                { id: 'fraud', label: 'Fraud (1)' },
                { id: 'normal', label: 'Normal (0)' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLabelFilter(opt.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  labelFilter === opt.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Channel Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
            {(['ALL', 'UPI', 'P2P', 'P2M'] as const).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setTypeFilter(ch)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  typeFilter === ch
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {ch === 'ALL' ? 'All Channels' : ch}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Batch Summary Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-1 text-xs text-slate-600">
        <div>
          Showing <strong className="font-mono tabular-nums text-slate-900">{stats.total}</strong>{' '}
          rows from <span className="font-mono text-slate-800">upi_fraud_dataset_2000_v2.csv</span>{' '}
          <span aria-hidden="true">·</span>{' '}
          <span className="font-mono tabular-nums">{stats.fraudCount} Fraud</span> /{' '}
          <span className="font-mono tabular-nums">{stats.total - stats.fraudCount} Normal</span>
        </div>
        {stats.total > 0 && (
          <div className="font-mono tabular-nums">
            Batch Match: ANN {stats.annCorrect}/{stats.total} <span aria-hidden="true">·</span> RF{' '}
            {stats.rfCorrect}/{stats.total}
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm font-medium text-slate-900">
              No transactions match your current filters
            </p>
            <p className="text-xs text-slate-500">
              Clear the search term or reset channel/label filters to inspect the dataset rows.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setLabelFilter('all');
                setTypeFilter('ALL');
              }}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="font-medium px-4 py-3">ID</th>
                  <th className="font-medium px-4 py-3 text-right">Amount</th>
                  <th className="font-medium px-4 py-3">Type</th>
                  <th className="font-medium px-4 py-3 text-right">Hour</th>
                  <th className="font-medium px-4 py-3 text-center">Loc</th>
                  <th className="font-medium px-4 py-3 text-center">Dev</th>
                  <th className="font-medium px-4 py-3 text-right">Daily</th>
                  <th className="font-medium px-4 py-3 text-right">Failed</th>
                  <th className="font-medium px-4 py-3 text-center">New Payee</th>
                  <th className="font-medium px-4 py-3">Ground Truth</th>
                  <th className="font-medium px-4 py-3 text-right">ANN Score</th>
                  <th className="font-medium px-4 py-3 text-right">RF Votes</th>
                  <th className="font-medium px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 tabular-nums">
                {filtered.map(({ row, annProb, rfVotes }) => (
                  <tr key={row.transaction_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-slate-500">
                      #{row.transaction_id}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-right font-medium text-slate-900">
                      ₹{row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">
                      {row.transaction_type}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-right text-slate-700">
                      {String(row.hour).padStart(2, '0')}:00
                    </td>
                    <td className="px-4 py-2.5 font-mono text-center text-slate-700">
                      {row.location_match}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-center text-slate-700">
                      {row.device_match}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-right text-slate-700">
                      {row.daily_transactions}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-right text-slate-700">
                      {row.failed_attempts}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-center text-slate-700">
                      {row.new_beneficiary}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`font-semibold ${
                          row.is_fraud === 1 ? 'text-red-700' : 'text-emerald-700'
                        }`}
                      >
                        {row.is_fraud === 1 ? 'Fraud (1)' : 'Normal (0)'}
                      </span>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {row.source_note}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-right font-medium text-slate-900">
                      {(annProb * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 font-mono text-right text-slate-700">
                      {rfVotes}/100
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          onLoadIntoSimulator({
                            amount: row.amount,
                            transaction_type: row.transaction_type,
                            hour: row.hour,
                            location_match: row.location_match,
                            device_match: row.device_match,
                            daily_transactions: row.daily_transactions,
                            failed_attempts: row.failed_attempts,
                            new_beneficiary: row.new_beneficiary,
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        Simulate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
