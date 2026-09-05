import React from 'react';
import { Round } from '../types';
import { courseData } from '../data/courseData';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  MapPinIcon,
  TrophyIcon,
  CheckIcon
} from './Icons';

interface ScorecardProps {
  round: Round;
  onUpdateScore: (playerId: string, holeNumber: number, strokes: number) => void;
  onSelectHole: (holeNumber: number) => void;
  onOpenMap: () => void;
  onOpenFullScorecard: () => void;
  onFinishRound: () => void;
}

export const Scorecard: React.FC<ScorecardProps> = ({
  round,
  onUpdateScore,
  onSelectHole,
  onOpenMap,
  onOpenFullScorecard,
  onFinishRound
}) => {
  const currentHole =
    courseData.holes.find((h) => h.number === round.currentHole) || courseData.holes[0];

  const handlePrevHole = () => {
    if (round.currentHole > 1) {
      onSelectHole(round.currentHole - 1);
    }
  };

  const handleNextHole = () => {
    if (round.currentHole < courseData.holeCount) {
      onSelectHole(round.currentHole + 1);
    } else {
      onFinishRound();
    }
  };

  const handleScoreChange = (playerId: string, delta: number) => {
    const player = round.players.find((p) => p.id === playerId);
    if (!player) return;
    const currentScore = player.scores[currentHole.number] ?? currentHole.par;
    const newScore = Math.max(1, Math.min(15, currentScore + delta));
    onUpdateScore(playerId, currentHole.number, newScore);
  };

  const handleSetExactScore = (playerId: string, strokes: number) => {
    onUpdateScore(playerId, currentHole.number, Math.max(1, Math.min(15, strokes)));
  };

  // Calculate cumulative stats for each player
  const playerStats = round.players.map((p) => {
    let totalScore = 0;
    courseData.holes.forEach((h) => {
      const s = p.scores[h.number] ?? h.par;
      totalScore += s;
    });

    const scoreToPar = totalScore - courseData.totalPar;
    return {
      player: p,
      totalScore,
      scoreToPar
    };
  });

  // Find lowest score
  const lowestScore = Math.min(...playerStats.map((s) => s.totalScore));

  const getScoreBadge = (strokes: number, par: number) => {
    const diff = strokes - par;
    if (strokes === 1) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider shadow">
          ★ Ace (1)
        </span>
      );
    }
    if (diff <= -2) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-blue-500 text-white text-xs font-black shadow">
          Eagle ({strokes})
        </span>
      );
    }
    if (diff === -1) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-neutral-950 text-xs font-black shadow">
          Birdie ({strokes})
        </span>
      );
    }
    if (diff === 0) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-neutral-700/80 text-neutral-200 text-xs font-bold border border-neutral-600">
          Par ({strokes})
        </span>
      );
    }
    if (diff === 1) {
      return (
        <span className="px-2.5 py-1 rounded-sm bg-orange-600 text-white text-xs font-black shadow">
          Bogey ({strokes})
        </span>
      );
    }
    if (diff === 2) {
      return (
        <span className="px-2.5 py-1 rounded-none bg-rose-600 text-white text-xs font-black shadow">
          Double ({strokes})
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-rose-900 border border-rose-600 text-rose-200 text-xs font-black">
        +{diff} ({strokes})
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-4 pb-32 animate-fade-in">
      {/* 1. Hole Quick-Select Pill Carousel (H1 to H9) */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-2 shadow-lg">
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {courseData.holes.map((h) => {
            const isCurrent = h.number === round.currentHole;
            // Check if all players have scored this hole
            const allScored = round.players.every((p) => p.scores[h.number] !== undefined);

            return (
              <button
                key={h.number}
                onClick={() => onSelectHole(h.number)}
                className={`flex-1 min-w-[50px] py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-tr from-[#10b981] to-[#059669] text-white font-black shadow-md scale-105 ring-2 ring-emerald-400/50'
                    : 'bg-[#090d16] hover:bg-neutral-800 text-neutral-300 border border-white/5'
                }`}
              >
                <div className="flex items-center gap-0.5">
                  <span className="text-xs font-extrabold leading-none">{h.number}</span>
                  {allScored && !isCurrent && (
                    <CheckIcon size={10} className="text-emerald-400" />
                  )}
                </div>
                <span className="text-[9px] opacity-75 mt-0.5 leading-none">
                  P{h.par}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Hole Banner Card */}
      <div className="bg-[#111827] border border-white/10 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevHole}
            disabled={round.currentHole === 1}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
              round.currentHole === 1
                ? 'opacity-25 border-white/5 text-neutral-600 cursor-not-allowed'
                : 'bg-[#1f2937] hover:bg-[#374151] border-white/10 text-white active:scale-90'
            }`}
            title="Previous Hole"
          >
            <ChevronLeftIcon size={24} />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-white tracking-tight">
                Hole {currentHole.number}
              </span>
              {currentHole.isSafari && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/25 border border-purple-400 text-purple-300 text-[10px] font-black uppercase">
                  Safari
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm font-extrabold text-neutral-300">
              <span className="text-emerald-400">Par {currentHole.par}</span>
              <span className="text-neutral-600">•</span>
              <span className="text-[#f97316]">{currentHole.distanceFt} ft</span>
              <span className="text-neutral-600">•</span>
              <span className="text-amber-400">Basket {currentHole.basket.basketNumber}</span>
            </div>
          </div>

          <button
            onClick={handleNextHole}
            className="w-12 h-12 rounded-2xl bg-[#1f2937] hover:bg-[#374151] border border-white/10 text-white flex items-center justify-center active:scale-90 transition-all"
            title="Next Hole"
          >
            <ChevronRightIcon size={24} />
          </button>
        </div>

        {/* Caddie Tip & Quick Map Launch */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <p className="text-neutral-300/80 truncate pr-2">
            💡 {currentHole.notes || 'Navigate to basket with care.'}
          </p>
          <button
            onClick={onOpenMap}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <MapPinIcon size={14} />
            <span>GPS Map</span>
          </button>
        </div>
      </div>

      {/* 3. Players Scoring Cards */}
      <div className="flex flex-col gap-3">
        {playerStats.map(({ player, totalScore, scoreToPar }) => {
          const strokes = player.scores[currentHole.number] ?? currentHole.par;
          const isLeader = round.players.length > 1 && totalScore === lowestScore;

          return (
            <div
              key={player.id}
              className="bg-[#111827] border border-white/10 rounded-3xl p-4 shadow-lg flex flex-col gap-3 transition-all"
            >
              {/* Player Info Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-white">
                        {player.name}
                      </span>
                      {isLeader && (
                        <span className="text-amber-400" title="Current Round Leader">
                          <TrophyIcon size={16} />
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span>Total: <strong className="text-white">{totalScore}</strong></span>
                      <span>•</span>
                      <span
                        className={`font-black ${
                          scoreToPar < 0
                            ? 'text-emerald-400'
                            : scoreToPar === 0
                            ? 'text-neutral-300'
                            : 'text-orange-400'
                        }`}
                      >
                        {scoreToPar > 0 ? `+${scoreToPar}` : scoreToPar === 0 ? 'E' : scoreToPar}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Status Badge */}
                <div>{getScoreBadge(strokes, currentHole.par)}</div>
              </div>

              {/* Large Touch Stroke Incrementor */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <button
                  onClick={() => handleScoreChange(player.id, -1)}
                  disabled={strokes <= 1}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold transition-all shadow-md active:scale-90 ${
                    strokes <= 1
                      ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed border border-neutral-700'
                      : 'bg-[#1f2937] hover:bg-[#374151] border border-white/15'
                  }`}
                >
                  <MinusIcon size={26} />
                </button>

                <div className="flex-1 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white tracking-tight">
                    {strokes}
                  </span>
                  <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest mt-0.5">
                    Strokes
                  </span>
                </div>

                <button
                  onClick={() => handleScoreChange(player.id, 1)}
                  disabled={strokes >= 15}
                  className="w-14 h-14 rounded-2xl bg-[#10b981] hover:bg-[#059669] active:scale-90 text-neutral-950 text-2xl font-black flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20 border border-emerald-400"
                >
                  <PlusIcon size={26} />
                </button>
              </div>

              {/* One-Tap Presets */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <button
                  onClick={() => handleSetExactScore(player.id, 1)}
                  className={`py-2 rounded-xl text-xs font-black transition-all border ${
                    strokes === 1
                      ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow'
                      : 'bg-[#090d16] hover:bg-[#1f2937] text-amber-300 border-white/5'
                  }`}
                >
                  Ace (1)
                </button>
                <button
                  onClick={() => handleSetExactScore(player.id, currentHole.par - 1)}
                  className={`py-2 rounded-xl text-xs font-black transition-all border ${
                    strokes === currentHole.par - 1
                      ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow'
                      : 'bg-[#090d16] hover:bg-[#1f2937] text-emerald-400 border-white/5'
                  }`}
                >
                  Birdie ({currentHole.par - 1})
                </button>
                <button
                  onClick={() => handleSetExactScore(player.id, currentHole.par)}
                  className={`py-2 rounded-xl text-xs font-black transition-all border ${
                    strokes === currentHole.par
                      ? 'bg-neutral-600 text-white border-neutral-500 shadow'
                      : 'bg-[#090d16] hover:bg-[#1f2937] text-neutral-300 border-white/5'
                  }`}
                >
                  Par ({currentHole.par})
                </button>
                <button
                  onClick={() => handleSetExactScore(player.id, currentHole.par + 1)}
                  className={`py-2 rounded-xl text-xs font-black transition-all border ${
                    strokes === currentHole.par + 1
                      ? 'bg-orange-600 text-white border-orange-500 shadow'
                      : 'bg-[#090d16] hover:bg-[#1f2937] text-orange-300 border-white/5'
                  }`}
                >
                  Bogey ({currentHole.par + 1})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Prominent NEXT HOLE Action Bar */}
      <div className="flex flex-col gap-2 pt-2">
        {round.currentHole < courseData.holeCount ? (
          <button
            onClick={handleNextHole}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-neutral-950 font-black text-base shadow-xl shadow-emerald-900/30 border border-emerald-400 flex items-center justify-center gap-2 transition-transform active:scale-98"
          >
            <span>Confirm &amp; Go to Hole {round.currentHole + 1}</span>
            <ChevronRightIcon size={20} />
          </button>
        ) : (
          <button
            onClick={onFinishRound}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-[#f97316] hover:from-amber-300 hover:to-[#ea580c] text-neutral-950 font-black text-base shadow-xl shadow-amber-900/40 border border-amber-300 flex items-center justify-center gap-2 transition-transform active:scale-98 animate-pulse"
          >
            <TrophyIcon size={20} />
            <span>Finish 9-Hole Round &amp; View Summary</span>
          </button>
        )}

        <button
          onClick={onOpenFullScorecard}
          className="w-full py-3 rounded-2xl bg-[#111827] hover:bg-[#1f2937] border border-white/10 text-neutral-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <span>View Full Scorecard Matrix</span>
        </button>
      </div>
    </div>
  );
};
