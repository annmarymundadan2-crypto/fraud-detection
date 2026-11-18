import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { ANN_NOTEBOOK_CELLS, RF_NOTEBOOK_CELLS } from '../data/notebookData';

export const NotebookPipeline: React.FC = () => {
  const [selectedNotebook, setSelectedNotebook] = useState<'ann' | 'rf'>('ann');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const cells = selectedNotebook === 'ann' ? ANN_NOTEBOOK_CELLS : RF_NOTEBOOK_CELLS;

  const handleCopy = async (code: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(idx);
      window.setTimeout(() => setCopiedIndex(null), 1800);
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Source Notebook Pipelines
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Exact code cells and execution outputs from both Colab notebooks
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedNotebook('ann')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedNotebook === 'ann'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ANN_DL_prj_61a82bde.ipynb
          </button>
          <button
            type="button"
            onClick={() => setSelectedNotebook('rf')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedNotebook === 'rf'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PRJ_RF_UPI_50a30f40.ipynb
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {cells.map((cell, idx) => (
          <div
            key={cell.step}
            className="bg-white border border-slate-200 rounded-lg overflow-hidden"
          >
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-semibold text-blue-700 mr-2">
                  {cell.step}
                </span>
                <span className="text-xs font-semibold text-slate-900">{cell.title}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(cell.code, idx)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Python
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-slate-800 bg-white overflow-x-auto leading-relaxed">
              <code>{cell.code}</code>
            </pre>

            {cell.output && (
              <div className="px-4 py-3 bg-slate-900 text-slate-100 border-t border-slate-800">
                <div className="text-[11px] font-mono text-slate-400 mb-1.5">
                  Notebook Stdout
                </div>
                <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                  {cell.output}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
