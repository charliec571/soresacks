import React from 'react';
import { Round } from '../types';
import { courseData } from '../data/courseData';
import { CloseIcon } from './Icons';

interface FullScorecardModalProps {
  round: Round;
  onClose: () => void;
  onSelectHole: (holeNumber: number) => void;
}

export const FullScorecardModal: React.FC<FullScorecardModalProps> = ({
  round,
  onClose,
  onSelectHole
}) => {
  const getCellBg = (strokes: number | undefined, par: number) => {
    if (strokes === undefined) return 'bg-[#0c1f24] text-neutral-600';
    const diff = strokes - par;
    if (strokes === 1) return 'bg-amber-400 text-neutral-950 font-black';
    if (diff <= -2) return 'bg-blue-600 text-white font-black';
    if (diff === -1) return 'bg-blue-500/80 text-white font-bold';
    if (diff === 0) return 'bg-neutral-700/60 text-neutral-300';
    if (diff === 1) return 'bg-orange-600/80 text-white font-bold';
    return 'bg-rose-700 text-white font-black';
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-[#132d34] border border-[#f6eedb]/20 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-xl font-black text-[#f6eedb] tracking-tight">
              Scorecard Matrix
            </h2>
            <p className="text-xs text-[#d1dfdb]/70">
              {courseData.name} • 9 Holes • Par {courseData.totalPar}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Scrollable Matrix Table */}
        <div className="overflow-x-auto my-4 -mx-1">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#d1dfdb]/60 font-extrabold uppercase">
                <th className="py-2 px-2 text-left sticky left-0 bg-[#132d34] z-10">Hole</th>
                {courseData.holes.map((h) => (
                  <th
                    key={h.number}
                    onClick={() => {
                      onSelectHole(h.number);
                      onClose();
                    }}
                    className="py-2 px-2 min-w-[34px] cursor-pointer hover:text-white"
                  >
                    {h.number}
                  </th>
                ))}
                <th className="py-2 px-2.5 font-black text-white">Tot</th>
                <th className="py-2 px-2.5 font-black text-white">+/-</th>
              </tr>

              {/* Par Row */}
              <tr className="border-b border-white/10 text-emerald-400/90 font-bold bg-emerald-950/20">
                <td className="py-1.5 px-2 text-left sticky left-0 bg-[#132d34] z-10">Par</td>
                {courseData.holes.map((h) => (
                  <td key={h.number} className="py-1.5 px-1 font-bold">
                    {h.par}
                  </td>
                ))}
                <td className="py-1.5 px-2 font-black">{courseData.totalPar}</td>
                <td className="py-1.5 px-2 font-black">E</td>
              </tr>

              {/* Distance Row */}
              <tr className="border-b border-white/10 text-neutral-400 text-[10px]">
                <td className="py-1 px-2 text-left sticky left-0 bg-[#132d34] z-10">Feet</td>
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
                <td className="py-1 px-2 text-left sticky left-0 bg-[#132d34] z-10">Basket</td>
                {courseData.holes.map((h) => (
                  <td key={h.number} className="py-1 px-1">
                    B{h.basket.basketNumber}
                  </td>
                ))}
                <td className="py-1 px-2">3</td>
                <td className="py-1 px-2">-</td>
              </tr>
            </thead>

            <tbody>
              {round.players.map((player) => {
                let total = 0;
                courseData.holes.forEach((h) => {
                  total += player.scores[h.number] ?? h.par;
                });
                const scoreToPar = total - courseData.totalPar;

                return (
                  <tr key={player.id} className="border-b border-white/10">
                    <td className="py-2 px-2 text-left font-extrabold sticky left-0 bg-[#132d34] z-10 flex items-center gap-1.5 whitespace-nowrap">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: player.color }}
                      />
                      <span className="text-white truncate max-w-[85px]">{player.name}</span>
                    </td>

                    {courseData.holes.map((h) => {
                      const strokes = player.scores[h.number];
                      return (
                        <td
                          key={h.number}
                          onClick={() => {
                            onSelectHole(h.number);
                            onClose();
                          }}
                          className="py-1.5 px-0.5 cursor-pointer"
                        >
                          <div
                            className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center shadow-sm ${getCellBg(
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
                          ? 'text-blue-400'
                          : scoreToPar === 0
                          ? 'text-neutral-300'
                          : 'text-orange-400'
                      }`}
                    >
                      {scoreToPar > 0 ? `+${scoreToPar}` : scoreToPar === 0 ? 'E' : scoreToPar}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] text-neutral-300 border-t border-white/10">
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-amber-400 inline-block" /> Ace
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-blue-500 inline-block" /> Birdie
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-neutral-700 inline-block" /> Par
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-orange-600 inline-block" /> Bogey
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-rose-700 inline-block" /> Double+
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-2xl bg-[#193840] hover:bg-[#1f434c] text-white font-bold text-sm shadow-md transition-colors"
        >
          Close Matrix
        </button>
      </div>
    </div>
  );
};
