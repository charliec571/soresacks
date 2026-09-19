import React, { useState } from 'react';
import { Round } from '../types';
import { courseData, getLayout } from '../data/courseData';
import { calculateSkins } from '../utils/skins';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  MapPinIcon,
  TrophyIcon,
  CheckIcon,
  DiscIcon,
  CloseIcon
} from './Icons';

interface ScorecardProps {
  round: Round;
  onUpdateScore: (playerId: string, holeNumber: number, strokes: number) => void;
  onSelectHole: (holeNumber: number) => void;
  onOpenMap: () => void;
  onOpenFullScorecard: () => void;
  onFinishRound: () => void;
  onOpenSkinsModal?: () => void;
  onOpenThrowTracker?: () => void;
  onMarkCtp?: (holeNumber: number, playerId: string) => void;
}

export const Scorecard: React.FC<ScorecardProps> = ({
  round,
  onUpdateScore,
  onSelectHole,
  onOpenMap,
  onOpenFullScorecard,
  onFinishRound,
  onOpenSkinsModal,
  onOpenThrowTracker,
  onMarkCtp
}) => {
  const layout = getLayout(round.layoutId);
  const currentHole =
    layout.holes.find((h) => h.number === round.currentHole) || layout.holes[0];

  const [showCtpPicker, setShowCtpPicker] = useState<boolean>(false);

  const skinsData = calculateSkins(round);
  const currentCtp = round.ctpWinners?.[currentHole.number];

  const handlePrevHole = () => {
    if (round.currentHole > 1) {
      onSelectHole(round.currentHole - 1);
    }
  };

  const handleNextHole = () => {
    if (round.currentHole < layout.holeCount) {
      onSelectHole(round.currentHole + 1);
    } else {
      onFinishRound();
    }
  };

  const handleScoreChange = (playerId: string, delta: number) => {
    const player = round.players.find((p) => p.id === playerId);
    if (!player) return;
    const currentScore = player.scores[currentHole.number];
    // If not entered yet, start from par
    const baseScore = currentScore ?? currentHole.par;
    const newScore = Math.max(1, Math.min(15, baseScore + delta));
    onUpdateScore(playerId, currentHole.number, newScore);
  };

  const handleSetExactScore = (playerId: string, strokes: number) => {
    onUpdateScore(playerId, currentHole.number, Math.max(1, Math.min(15, strokes)));
  };

  // Calculate cumulative stats for each player (only count holes that have entered scores)
  const playerStats = round.players.map((p) => {
    let totalScore = 0;
    let parForScoredHoles = 0;
    let scoredHolesCount = 0;
    layout.holes.forEach((h) => {
      const s = p.scores[h.number];
      if (s !== undefined) {
        totalScore += s;
        parForScoredHoles += h.par;
        scoredHolesCount++;
      }
    });

    const scoreToPar = totalScore - parForScoredHoles;
    return {
      player: p,
      totalScore,
      scoreToPar,
      scoredHolesCount
    };
  });

  // Find lowest score among players who have scored holes
  const lowestScore = playerStats.some((s) => s.scoredHolesCount > 0)
    ? Math.min(...playerStats.filter((s) => s.scoredHolesCount > 0).map((s) => s.totalScore))
    : null;

  const getScoreBadge = (strokes: number | undefined, par: number) => {
    if (strokes === undefined) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-neutral-800/80 text-neutral-400 text-[11px] font-bold border border-white/5">
          Not Scored
        </span>
      );
    }
    const diff = strokes - par;
    if (strokes === 1) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[11px] font-black uppercase tracking-wider shadow">
          ★ Ace (1)
        </span>
      );
    }
    if (diff <= -2) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[11px] font-black shadow">
          Eagle ({strokes})
        </span>
      );
    }
    if (diff === -1) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-neutral-950 text-[11px] font-black shadow">
          Birdie ({strokes})
        </span>
      );
    }
    if (diff === 0) {
      return (
        <span className="px-2 py-0.5 rounded-md bg-neutral-700/80 text-neutral-200 text-[11px] font-bold border border-neutral-600">
          Par ({strokes})
        </span>
      );
    }
    if (diff === 1) {
      return (
        <span className="px-2 py-0.5 rounded-sm bg-orange-600 text-white text-[11px] font-black shadow">
          Bogey ({strokes})
        </span>
      );
    }
    if (diff === 2) {
      return (
        <span className="px-2 py-0.5 rounded-none bg-rose-600 text-white text-[11px] font-black shadow">
          Double ({strokes})
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-rose-900 border border-rose-600 text-rose-200 text-[11px] font-black">
        +{diff} ({strokes})
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-2.5 pb-28 animate-fade-in">
      {/* 1. Hole Quick-Select Pill Carousel */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-1.5 shadow-md">
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {layout.holes.map((h) => {
            const isCurrent = h.number === round.currentHole;
            const allScored = round.players.every((p) => p.scores[h.number] !== undefined);
            const holeHasCtp = round.ctpWinners?.[h.number];

            return (
              <button
                key={h.number}
                onClick={() => onSelectHole(h.number)}
                className={`flex-1 min-w-[46px] py-1 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-tr from-[#10b981] to-[#059669] text-white font-black shadow-md scale-105 ring-2 ring-emerald-400/50'
                    : 'bg-[#090d16] hover:bg-neutral-800 text-neutral-300 border border-white/5'
                }`}
              >
                <div className="flex items-center gap-0.5">
                  <span className="text-xs font-extrabold leading-none">{h.number}</span>
                  {holeHasCtp && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="CTP Claimed" />
                  )}
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

      {/* 2. Main Hole Banner Card (Compact) */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-2.5 shadow-lg flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevHole}
            disabled={round.currentHole === 1}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
              round.currentHole === 1
                ? 'opacity-25 border-white/5 text-neutral-600 cursor-not-allowed'
                : 'bg-[#1f2937] hover:bg-[#374151] border-white/10 text-white active:scale-90'
            }`}
            title="Previous Hole"
          >
            <ChevronLeftIcon size={18} />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-white tracking-tight">
                Hole {currentHole.number}
              </span>
              {currentHole.isSafari && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-500/25 border border-purple-400 text-purple-300 text-[9px] font-black uppercase">
                  Safari
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-neutral-300">
              <span className="text-emerald-400">Par {currentHole.par}</span>
              <span className="text-neutral-600">•</span>
              <span className="text-[#f97316]">{currentHole.distanceFt} ft</span>
              <span className="text-neutral-600">•</span>
              <span className="text-amber-400">Basket {currentHole.basket.basketNumber}</span>
            </div>
          </div>

          <button
            onClick={handleNextHole}
            className="w-9 h-9 rounded-xl bg-[#1f2937] hover:bg-[#374151] border border-white/10 text-white flex items-center justify-center active:scale-90 transition-all"
            title="Next Hole"
          >
            <ChevronRightIcon size={18} />
          </button>
        </div>

        {/* Action Toolbar: Skins, CTP, Measure Drive, GPS Map */}
        <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-white/10">
          {onOpenSkinsModal && (
            <button
              onClick={onOpenSkinsModal}
              className="py-1 px-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-extrabold text-[10px] flex items-center justify-center gap-1 transition-colors shadow-sm"
              title="Open Skins Game"
            >
              <span>💰 Skins</span>
              {skinsData.currentPot > 1 && (
                <span className="px-1 py-0.1 rounded-full bg-amber-400 text-neutral-950 text-[8px] font-black">
                  +{skinsData.currentPot}
                </span>
              )}
            </button>
          )}

          {/* CTP Button */}
          <div className="relative">
            <button
              onClick={() => setShowCtpPicker(!showCtpPicker)}
              className={`w-full py-1 px-1.5 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 border transition-colors shadow-sm ${
                currentCtp
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-black'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300 border-white/10'
              }`}
              title="Tag Closest to Pin"
            >
              <span>🎯 CTP</span>
              {currentCtp && (
                <span className="truncate max-w-[36px] text-[9px]">
                  {currentCtp.playerName.split(' ')[0]}
                </span>
              )}
            </button>

            {/* Quick CTP Player Picker Popover */}
            {showCtpPicker && onMarkCtp && (
              <div className="absolute left-0 top-full mt-1.5 w-44 bg-[#111827] border border-white/15 rounded-2xl p-2 shadow-2xl z-30 flex flex-col gap-1">
                <span className="text-[10px] font-black text-neutral-400 uppercase px-2 py-0.5">
                  Who Won CTP?
                </span>
                {round.players.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onMarkCtp(currentHole.number, p.id);
                      setShowCtpPicker(false);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-left transition-colors ${
                      currentCtp?.playerId === p.id
                        ? 'bg-emerald-500/20 text-emerald-300 font-black'
                        : 'hover:bg-white/10 text-neutral-200'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Measure Drive Button */}
          {onOpenThrowTracker && (
            <button
              onClick={onOpenThrowTracker}
              className="py-1 px-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 font-extrabold text-[10px] flex items-center justify-center gap-1 transition-colors shadow-sm"
              title="Measure Drive Distance with GPS"
            >
              <DiscIcon size={11} className="text-emerald-400" />
              <span>Drive</span>
            </button>
          )}

          {/* GPS Map Button */}
          <button
            onClick={onOpenMap}
            className="py-1 px-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] flex items-center justify-center gap-1 transition-colors shadow-sm"
          >
            <MapPinIcon size={11} />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* 3. Players Scoring Cards (Shortened vertically to easily view 3+ players) */}
      <div className="flex flex-col gap-2">
        {playerStats.map(({ player, totalScore, scoreToPar, scoredHolesCount }) => {
          const strokes = player.scores[currentHole.number];
          const hasScore = strokes !== undefined;
          const isLeader = lowestScore !== null && round.players.length > 1 && totalScore === lowestScore;
          const isCtpWinner = currentCtp?.playerId === player.id;

          return (
            <div
              key={player.id}
              className={`bg-[#111827] border rounded-2xl p-2.5 shadow-md flex flex-col gap-2 transition-all ${
                hasScore ? 'border-white/15' : 'border-dashed border-white/10'
              }`}
            >
              {/* Player Info Header & Touch Controls Row */}
              <div className="flex items-center justify-between gap-2">
                {/* Left: Player Avatar & Details */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shadow flex-shrink-0"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-extrabold text-sm text-white truncate">
                        {player.name}
                      </span>
                      {isLeader && (
                        <span className="text-amber-400 flex-shrink-0" title="Current Round Leader">
                          <TrophyIcon size={13} />
                        </span>
                      )}
                      {isCtpWinner && (
                        <span className="px-1 py-0.2 rounded-full bg-amber-400 text-neutral-950 text-[8px] font-black flex-shrink-0">
                          🎯 CTP
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 leading-none">
                      <span>Tot: <strong className="text-white">{scoredHolesCount > 0 ? totalScore : '-'}</strong></span>
                      <span>•</span>
                      <span
                        className={`font-black ${
                          scoredHolesCount === 0
                            ? 'text-neutral-500'
                            : scoreToPar < 0
                            ? 'text-emerald-400'
                            : scoreToPar === 0
                            ? 'text-neutral-300'
                            : 'text-orange-400'
                        }`}
                      >
                        {scoredHolesCount === 0 ? '-' : scoreToPar > 0 ? `+${scoreToPar}` : scoreToPar === 0 ? 'E' : scoreToPar}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center/Right: Score Badge & Increment Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleScoreChange(player.id, -1)}
                    disabled={hasScore && strokes <= 1}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg font-bold transition-all shadow-sm active:scale-90 ${
                      hasScore && strokes <= 1
                        ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed border border-neutral-700'
                        : 'bg-[#1f2937] hover:bg-[#374151] border border-white/15'
                    }`}
                    title="Decrease strokes"
                  >
                    <MinusIcon size={16} />
                  </button>

                  <div className="w-11 text-center flex flex-col items-center justify-center">
                    <span
                      className={`text-2xl font-black tracking-tight leading-none ${
                        hasScore ? 'text-white' : 'text-neutral-500'
                      }`}
                    >
                      {hasScore ? strokes : '-'}
                    </span>
                    <span className="text-[8px] font-extrabold text-neutral-500 uppercase tracking-wider mt-0.5">
                      {hasScore ? 'Strokes' : 'Enter'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleScoreChange(player.id, 1)}
                    disabled={hasScore && strokes >= 15}
                    className="w-9 h-9 rounded-xl bg-[#10b981] hover:bg-[#059669] active:scale-90 text-neutral-950 text-lg font-black flex items-center justify-center transition-all shadow-md shadow-emerald-500/20 border border-emerald-400"
                    title="Increase strokes"
                  >
                    <PlusIcon size={16} />
                  </button>
                </div>
              </div>

              {/* Compact One-Tap Presets Row */}
              <div className="grid grid-cols-4 gap-1 pt-1 border-t border-white/5">
                <button
                  onClick={() => handleSetExactScore(player.id, 1)}
                  className={`py-1 rounded-lg text-[10px] font-extrabold transition-all border ${
                    strokes === 1
                      ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow'
                      : 'bg-[#090d16] hover:bg-[#1f2937] text-amber-300 border-white/5'
                  }`}
                >
                  Ace (1)
                </button>
                <button
                  onClick={() => handleSetExactScore(player.id, currentHole.par - 1)}
                  className={`py-1 rounded-lg text-[10px] font-extrabold transition-all border ${
                    strokes === currentHole.par - 1
                      ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow'
                      : 'bg-[#090d16] hover:bg-[#1f2937] text-emerald-400 border-white/5'
                  }`}
                >
                  Birdie ({currentHole.par - 1})
                </button>
                <button
                  onClick={() => handleSetExactScore(player.id, currentHole.par)}
                  className={`py-1 rounded-lg text-[10px] font-extrabold transition-all border ${
                    strokes === currentHole.par
                      ? 'bg-neutral-600 text-white border-neutral-500 shadow'
                      : 'bg-[#090d16] hover:bg-[#1f2937] text-neutral-300 border-white/5'
                  }`}
                >
                  Par ({currentHole.par})
                </button>
                <button
                  onClick={() => handleSetExactScore(player.id, currentHole.par + 1)}
                  className={`py-1 rounded-lg text-[10px] font-extrabold transition-all border ${
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
        {round.currentHole < layout.holeCount ? (
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
            <span>Finish {layout.holeCount}-Hole Round &amp; View Summary</span>
          </button>
        )}

        <button
          onClick={onOpenFullScorecard}
          className="w-full py-3 rounded-2xl bg-[#111827] hover:bg-[#1f2937] border border-white/10 text-neutral-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <span>View Full Scorecard Matrix</span>
        </button>

        {/* Safe notice: Cancel is located on the Matrix page to prevent accidental cancellations */}
        <p className="text-center text-[10px] text-neutral-500 font-medium py-1">
          Need to cancel this round? Head to the <button onClick={onOpenFullScorecard} className="text-neutral-400 hover:text-emerald-400 underline font-semibold transition-colors">Matrix tab</button>.
        </p>
      </div>
    </div>
  );
};
