import React, { useState } from 'react';
import { ANN_TRAINING_HISTORY } from '../data/notebookData';

type SeriesMode = 'both' | 'accuracy' | 'loss';

export const TrainingChart: React.FC = () => {
  const [seriesMode, setSeriesMode] = useState<SeriesMode>('both');
  const [hoveredEpoch, setHoveredEpoch] = useState<number | null>(null);

  const width = 760;
  const height = 300;
  const padLeft = 52;
  const padRight = 52;
  const padTop = 24;
  const padBottom = 38;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const minEpoch = 1;
  const maxEpoch = 30;
  const accMin = 0.55;
  const accMax = 0.90;
  const lossMin = 0.25;
  const lossMax = 0.75;

  const getX = (epoch: number) =>
    padLeft + ((epoch - minEpoch) / (maxEpoch - minEpoch)) * plotW;

  const getAccY = (acc: number) =>
    padTop + plotH - ((acc - accMin) / (accMax - accMin)) * plotH;

  const getLossY = (loss: number) =>
    padTop + plotH - ((loss - lossMin) / (lossMax - lossMin)) * plotH;

  const accPath = ANN_TRAINING_HISTORY.map(
    (d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.epoch).toFixed(1)} ${getAccY(d.accuracy).toFixed(1)}`
  ).join(' ');

  const lossPath = ANN_TRAINING_HISTORY.map(
    (d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.epoch).toFixed(1)} ${getLossY(d.loss).toFixed(1)}`
  ).join(' ');

  const activePoint =
    hoveredEpoch !== null
      ? ANN_TRAINING_HISTORY.find((d) => d.epoch === hoveredEpoch) ?? ANN_TRAINING_HISTORY[29]
      : ANN_TRAINING_HISTORY[29];

  const yTicks = [0.6, 0.7, 0.8, 0.9];
  const lossTicks = [0.3, 0.45, 0.6, 0.75];
  const xTicks = [1, 5, 10, 15, 20, 25, 30];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            ANN Training Trajectory (30 Epochs)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Adam optimizer · binary_crossentropy · batch_size=32 · 1,600 training rows
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md self-start sm:self-auto">
          {(
            [
              { id: 'both', label: 'Accuracy & Loss' },
              { id: 'accuracy', label: 'Accuracy' },
              { id: 'loss', label: 'Loss' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSeriesMode(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                seriesMode === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live readout strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 text-xs border-b border-slate-100">
        <div className="flex items-center gap-5">
          <span className="font-mono tabular-nums text-slate-600">
            Epoch <strong className="text-slate-900">{activePoint.epoch}/30</strong>
          </span>
          {(seriesMode === 'both' || seriesMode === 'accuracy') && (
            <span className="flex items-center gap-2 font-mono tabular-nums text-slate-700">
              <span className="inline-block w-2.5 h-0.5 bg-blue-700" aria-hidden="true" />
              Accuracy: <strong className="text-blue-700">{(activePoint.accuracy * 100).toFixed(2)}%</strong>
            </span>
          )}
          {(seriesMode === 'both' || seriesMode === 'loss') && (
            <span className="flex items-center gap-2 font-mono tabular-nums text-slate-700">
              <span className="inline-block w-2.5 h-0.5 bg-amber-600" aria-hidden="true" />
              Loss: <strong className="text-amber-700">{activePoint.loss.toFixed(4)}</strong>
            </span>
          )}
        </div>
        <span className="text-slate-400">Hover chart points to inspect individual epochs</span>
      </div>

      {/* SVG Plot */}
      <div className="mt-3 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[540px] h-auto select-none"
          role="img"
          aria-label="30-epoch ANN accuracy and loss training curves"
          onMouseLeave={() => setHoveredEpoch(null)}
        >
          {/* Horizontal Grid Lines */}
          {yTicks.map((val) => {
            const y = getAccY(val);
            return (
              <g key={val}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth={1}
                />
                {(seriesMode === 'both' || seriesMode === 'accuracy') && (
                  <text
                    x={padLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-slate-400 text-[10px] font-mono tabular-nums"
                  >
                    {(val * 100).toFixed(0)}%
                  </text>
                )}
              </g>
            );
          })}

          {/* Right Y-axis ticks for Loss */}
          {(seriesMode === 'both' || seriesMode === 'loss') &&
            lossTicks.map((val) => {
              const y = getLossY(val);
              return (
                <text
                  key={val}
                  x={width - padRight + 8}
                  y={y + 3}
                  textAnchor="start"
                  className="fill-amber-700 text-[10px] font-mono tabular-nums"
                >
                  {val.toFixed(2)}
                </text>
              );
            })}

          {/* X-axis ticks */}
          {xTicks.map((ep) => {
            const x = getX(ep);
            return (
              <g key={ep}>
                <line
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={height - padBottom}
                  stroke="#f8fafc"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={height - 14}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px] font-mono tabular-nums"
                >
                  Ep {ep}
                </text>
              </g>
            );
          })}

          {/* Baseline axes */}
          <line
            x1={padLeft}
            y1={height - padBottom}
            x2={width - padRight}
            y2={height - padBottom}
            stroke="#e2e8f0"
            strokeWidth={1}
          />

          {/* Active hover crosshair */}
          <line
            x1={getX(activePoint.epoch)}
            y1={padTop}
            x2={getX(activePoint.epoch)}
            y2={height - padBottom}
            stroke="#cbd5e1"
            strokeDasharray="3 3"
            strokeWidth={1}
          />

          {/* Loss Curve */}
          {(seriesMode === 'both' || seriesMode === 'loss') && (
            <>
              <path
                d={lossPath}
                fill="none"
                stroke="#d97706"
                strokeWidth={2}
                strokeLinejoin="round"
              />
              <circle
                cx={getX(activePoint.epoch)}
                cy={getLossY(activePoint.loss)}
                r={4}
                fill="#d97706"
                stroke="#ffffff"
                strokeWidth={1.5}
              />
            </>
          )}

          {/* Accuracy Curve */}
          {(seriesMode === 'both' || seriesMode === 'accuracy') && (
            <>
              <path
                d={accPath}
                fill="none"
                stroke="#1d4ed8"
                strokeWidth={2.25}
                strokeLinejoin="round"
              />
              <circle
                cx={getX(activePoint.epoch)}
                cy={getAccY(activePoint.accuracy)}
                r={4.5}
                fill="#1d4ed8"
                stroke="#ffffff"
                strokeWidth={1.5}
              />
            </>
          )}

          {/* Invisible hover hit targets for each epoch */}
          {ANN_TRAINING_HISTORY.map((d) => {
            const bandW = plotW / 29;
            return (
              <rect
                key={d.epoch}
                x={getX(d.epoch) - bandW / 2}
                y={padTop}
                width={bandW}
                height={plotH}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredEpoch(d.epoch)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};
