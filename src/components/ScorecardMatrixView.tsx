import React from 'react';
import { Round } from '../types';
import { courseData } from '../data/courseData';
import { DiscIcon, FlagIcon } from './Icons';

interface ScorecardMatrixViewProps {
  round: Round | null;
  onSelectHole: (holeNumber: number) => void;
  onStartRoundClick?: () => void;
}

export const ScorecardMatrixView: React.FC<ScorecardMatrixViewProps> = ({
  round,
  onSelectHole,
  onStartRoundClick
}) => {
  const getCellBg = (strokes: number | undefined, par: number) => {
    if (strokes === undefined) return 'bg-[#090d16] text-neutral-600';
    const diff = strokes - par;
    if (strokes === 1) return 'bg-amber-400 text-neutral-950 font-black';
    if (diff <= -2) return 'bg-blue-600 text-white font-black';
    if (diff === -1) return 'bg-emerald-500 text-neutral-950 font-black';
    if (diff === 0) return 'bg-neutral-700/60 text-neutral-200';
    if (diff === 1) return 'bg-orange-600/80 text-white font-bold';
    return 'bg-rose-700 text-white font-black';
  };

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto pb-28 pt-2 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-white/10 rounded-3xl p-4 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-black shadow-md">
            <FlagIcon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight leading-tight">
              Scorecard Matrix
            </h2>
            <p className="text-[11px] text-neutral-400 font-bold">
              {courseData.name} • 9 Holes • Par {courseData.totalPar}
            </p>
          </div>
        </div>

        {round ? (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-xs font-black">
            Live Card
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-neutral-300 text-xs font-bold">
            Course Layout
          </span>
        )}
      </div>

      {/* Main Matrix Table Container */}
      <div className="bg-[#111827] border border-white/10 rounded-3xl p-4 shadow-xl overflow-hidden">
        <div className="overflow-x-auto -mx-2 px-1 no-scrollbar">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400 font-extrabold uppercase text-[11px]">
                <th className="py-2.5 px-2 text-left sticky left-0 bg-[#111827] z-10">Hole</th>
                {courseData.holes.map((h) => (
                  <th
                    key={h.number}
                    onClick={() => onSelectHole(h.number)}
                    className="py-2 px-1.5 min-w-[34px] cursor-pointer hover:text-emerald-400 transition-colors"
                    title={`Hole ${h.number}: Par ${h.par}, ${h.distanceFt}ft`}
                  >
                    {h.number}
                  </th>
                ))}
                <th className="py-2 px-2 font-black text-white">Tot</th>
                <th className="py-2 px-2 font-black text-white">+/-</th>
              </tr>

              {/* Par Row */}
              <tr className="border-b border-white/10 text-emerald-400 font-bold bg-emerald-950/30">
                <td className="py-1.5 px-2 text-left sticky left-0 bg-[#111827] z-10 text-emerald-400">
                  Par
                </td>
                {courseData.holes.map((h) => (
                  <td key={h.number} className="py-1.5 px-1 font-extrabold">
                    {h.par}
                  </td>
                ))}
                <td className="py-1.5 px-2 font-black">{courseData.totalPar}</td>
                <td className="py-1.5 px-2 font-black">E</td>
              </tr>

              {/* Distance Row */}
              <tr className="border-b border-white/10 text-neutral-400 text-[10px]">
                <td className="py-1 px-2 text-left sticky left-0 bg-[#111827] z-10">Feet</td>
                {courseData.holes.map((h) => (
                  <td key={h.number} className="py-1 px-1">
                    {h.distanceFt}
                  </td>
                ))}
                <td className="py-1 px-2 font-bold">{courseData.totalDistanceFt}</td>
                <td className="py-1 px-2">-</td>
              </tr>

              {/* Basket Row */}
              <tr className="border-b border-white/15 text-amber-300 text-[10px] font-bold">
                <td className="py-1 px-2 text-left sticky left-0 bg-[#111827] z-10">Basket</td>
                {courseData.holes.map((h) => (
                  <td key={h.number} className="py-1 px-1">
                    B{h.basket.basketNumber}
                  </td>
                ))}
                <td className="py-1 px-2">3 Axiom</td>
                <td className="py-1 px-2">-</td>
              </tr>
            </thead>

            <tbody>
              {round && round.players && round.players.length > 0 ? (
                round.players.map((player) => {
                  let total = 0;
                  courseData.holes.forEach((h) => {
                    total += player.scores[h.number] ?? h.par;
                  });
                  const scoreToPar = total - courseData.totalPar;

                  return (
                    <tr key={player.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-2 text-left font-extrabold sticky left-0 bg-[#111827] z-10 flex items-center gap-1.5 whitespace-nowrap">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: player.color }}
                        />
                        <span className="text-white truncate max-w-[80px]">{player.name}</span>
                      </td>

                      {courseData.holes.map((h) => {
                        const strokes = player.scores[h.number];
                        return (
                          <td
                            key={h.number}
                            onClick={() => onSelectHole(h.number)}
                            className="py-1 px-0.5 cursor-pointer"
                          >
                            <div
                              className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center text-xs shadow-sm transition-transform hover:scale-110 ${getCellBg(
                                strokes,
                                h.par
                              )}`}
                            >
                              {strokes ?? '-'}
                            </div>
                          </td>
                        );
                      })}

                      <td className="py-2 px-2 font-black text-white text-sm">{total}</td>
                      <td
                        className={`py-2 px-2 font-black text-sm ${
                          scoreToPar < 0
                            ? 'text-emerald-400'
                            : scoreToPar === 0
                            ? 'text-neutral-300'
                            : 'text-orange-400'
                        }`}
                      >
                        {scoreToPar > 0 ? `+${scoreToPar}` : scoreToPar === 0 ? 'E' : scoreToPar}
                      </td>
                    </tr>
                  );
                })
              ) : (
                // When no active round: show sample/scratch row with CTA
                <tr className="border-b border-white/5">
                  <td className="py-3 px-2 text-left font-bold sticky left-0 bg-[#111827] z-10 text-neutral-400">
                    Your Score
                  </td>
                  {courseData.holes.map((h) => (
                    <td key={h.number} className="py-3 px-1 text-neutral-600 font-bold">
                      -
                    </td>
                  ))}
                  <td className="py-3 px-2 text-neutral-600">-</td>
                  <td className="py-3 px-2 text-neutral-600">-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3 mt-2 text-[11px] text-neutral-300 border-t border-white/10">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-400 inline-block" /> Ace
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Birdie
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-neutral-700 inline-block" /> Par
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-orange-600 inline-block" /> Bogey
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-rose-700 inline-block" /> Double+
          </div>
        </div>
      </div>

      {/* Start Round CTA if not playing */}
      {!round && onStartRoundClick && (
        <button
          onClick={onStartRoundClick}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-base shadow-xl shadow-emerald-950/40 border border-emerald-400 flex items-center justify-center gap-2 transition-transform active:scale-98"
        >
          <DiscIcon size={20} className="text-neutral-950" />
          <span>Start New Round to Log Scores</span>
        </button>
      )}

      {/* Course Architecture Notes */}
      <div className="bg-[#111827] border border-white/10 rounded-3xl p-4 shadow-lg flex flex-col gap-2 text-xs">
        <h3 className="font-extrabold text-white text-sm">3 Basket Distribution</h3>
        <p className="text-neutral-400">
          <strong className="text-emerald-400">Basket 1:</strong> Serves Hole 1 (272'), Hole 4 (272'), Hole 8 (226')
        </p>
        <p className="text-neutral-400">
          <strong className="text-emerald-400">Basket 2:</strong> Serves Hole 2 (226'), Hole 5 (266'), Hole 7 (170')
        </p>
        <p className="text-neutral-400">
          <strong className="text-emerald-400">Basket 3:</strong> Serves Hole 3 (161'), Hole 6 (262'), Hole 9 (289' Par 4)
        </p>
      </div>
    </div>
  );
};
