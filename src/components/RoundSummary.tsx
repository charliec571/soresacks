import React, { useState } from 'react';
import { Round } from '../types';
import { courseData, getLayout } from '../data/courseData';
import { calculateSkins } from '../utils/skins';
import { TrophyIcon, ShareIcon, CheckIcon, BeerIcon, DiscIcon } from './Icons';

interface RoundSummaryProps {
  round: Round;
  onNewRound: () => void;
  onViewLeaderboard: () => void;
}

export const RoundSummary: React.FC<RoundSummaryProps> = ({
  round,
  onNewRound,
  onViewLeaderboard
}) => {
  const [copied, setCopied] = useState(false);
  const layout = getLayout(round.layoutId);

  // Compute final player stroke rankings
  const rankedPlayers = round.players
    .map((p) => {
      let total = 0;
      let birdies = 0;
      let pars = 0;
      let bogeys = 0;
      let aces = 0;

      layout.holes.forEach((h) => {
        const s = p.scores[h.number] ?? h.par;
        total += s;
        if (s === 1) aces++;
        else if (s < h.par) birdies++;
        else if (s === h.par) pars++;
        else if (s > h.par) bogeys++;
      });

      const scoreToPar = total - layout.totalPar;
      return {
        player: p,
        total,
        scoreToPar,
        birdies,
        pars,
        bogeys,
        aces
      };
    })
    .sort((a, b) => a.total - b.total);

  const strokeWinner = rankedPlayers[0];

  // Calculate Skins Game
  const skinsData = calculateSkins(round);
  const skinsLeader = skinsData.playerSummaries[0];

  // Calculate CTP Winners
  const ctpList = Object.values(round.ctpWinners || {});

  // Find longest drive
  const allThrows = round.measuredThrows || [];
  const longestDrive =
    allThrows.length > 0
      ? [...allThrows].sort((a, b) => b.distanceFt - a.distanceFt)[0]
      : null;

  const handleCopySummary = () => {
    let text = `🍻 Sore Sacks & Six Packs - Round Recap!\n`;
    text += `📅 ${round.date} • ${layout.holeCount} Holes (${layout.name}) • Par ${layout.totalPar}\n\n`;
    text += `🏆 STROKE PLAY STANDINGS:\n`;

    const medals = ['🥇', '🥈', '🥉', '4th', '5th', '6th', '7th', '8th'];
    rankedPlayers.forEach((item, idx) => {
      const parStr =
        item.scoreToPar > 0
          ? `+${item.scoreToPar}`
          : item.scoreToPar === 0
          ? 'E'
          : `${item.scoreToPar}`;
      text += `${medals[idx] || '•'} ${item.player.name}: ${item.total} (${parStr})`;
      if (item.aces > 0) text += ` 🎯 ${item.aces} ACE!`;
      text += `\n`;
    });

    if (skinsLeader && skinsLeader.skinsWon > 0) {
      text += `\n💰 SKINS CHAMPION:\n`;
      text += `👑 ${skinsLeader.playerName}: ${skinsLeader.skinsWon} Skins (${skinsLeader.payoutText})\n`;
    }

    if (ctpList.length > 0) {
      text += `\n🎯 CTP HONORS:\n`;
      ctpList.forEach((c) => {
        text += `• Hole ${c.holeNumber}: ${c.playerName}\n`;
      });
    }

    if (longestDrive) {
      text += `\n🚀 LONGEST DRIVE:\n`;
      text += `• ${longestDrive.playerName}: ${longestDrive.distanceFt} ft (Hole ${longestDrive.holeNumber}${longestDrive.discName ? ` w/ ${longestDrive.discName}` : ''})\n`;
    }

    text += `\nPrivate ${layout.holeCount}-hole layout • 3 Axiom Baskets • Fort Wayne, IN`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto pb-28 pt-1 animate-fade-in">
      {/* Champion Celebration Card */}
      <div className="bg-gradient-to-b from-[#111827] via-[#0f172a] to-[#090d16] border border-amber-400/40 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-300 mb-2.5 shadow-lg shadow-amber-400/20">
          <TrophyIcon size={32} />
        </div>

        <span className="px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/30">
          Round Champion
        </span>

        <h1 className="text-3xl font-black text-white mt-2">{strokeWinner.player.name}</h1>

        <div className="flex items-center justify-center gap-3 mt-1.5 text-base font-extrabold">
          <span className="text-white text-2xl">{strokeWinner.total} Strokes</span>
          <span className="text-neutral-500">•</span>
          <span
            className={`text-2xl font-black ${
              strokeWinner.scoreToPar < 0
                ? 'text-emerald-400'
                : strokeWinner.scoreToPar === 0
                ? 'text-neutral-300'
                : 'text-orange-400'
            }`}
          >
            {strokeWinner.scoreToPar > 0
              ? `+${strokeWinner.scoreToPar}`
              : strokeWinner.scoreToPar === 0
              ? 'E'
              : strokeWinner.scoreToPar}
          </span>
        </div>

        <p className="text-xs text-neutral-400 mt-2">
          {strokeWinner.birdies} Birdie{strokeWinner.birdies !== 1 ? 's' : ''} • {strokeWinner.pars} Par
          {strokeWinner.pars !== 1 ? 's' : ''}
          {strokeWinner.aces > 0 && ` • 🎯 ${strokeWinner.aces} ACE!`}
        </p>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-amber-300 font-bold">
          <BeerIcon size={16} />
          <span>Champion drinks for free at Sore Sacks!</span>
        </div>
      </div>

      {/* Side Game Honors Grid (Skins, CTP, Long Drive) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Skins Winner */}
        {skinsLeader && skinsLeader.skinsWon > 0 && (
          <div className="p-3.5 rounded-2xl bg-[#111827] border border-amber-500/30 flex flex-col gap-1 shadow">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black">
              <span>💰</span>
              <span>Skins Champion</span>
            </div>
            <span className="text-sm font-black text-white truncate">{skinsLeader.playerName}</span>
            <p className="text-xs font-extrabold text-emerald-400">
              {skinsLeader.skinsWon} Skins ({skinsLeader.payoutText})
            </p>
          </div>
        )}

        {/* Longest Drive */}
        {longestDrive && (
          <div className="p-3.5 rounded-2xl bg-[#111827] border border-emerald-500/30 flex flex-col gap-1 shadow">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black">
              <DiscIcon size={14} />
              <span>Longest Drive</span>
            </div>
            <span className="text-sm font-black text-white truncate">{longestDrive.playerName}</span>
            <p className="text-xs font-extrabold text-emerald-400">
              {longestDrive.distanceFt} ft (H{longestDrive.holeNumber})
            </p>
          </div>
        )}

        {/* CTP Highlights */}
        {ctpList.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-[#111827] border border-purple-500/30 flex flex-col gap-1 col-span-2 shadow">
            <div className="flex items-center gap-1.5 text-purple-300 text-xs font-black">
              <span>🎯</span>
              <span>Closest to Pin (CTP) Awards</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {ctpList.map((c) => (
                <span
                  key={c.holeNumber}
                  className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-xs text-neutral-300 font-bold"
                >
                  Hole {c.holeNumber}: <strong className="text-white">{c.playerName}</strong>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full Card Standings */}
      <div className="bg-[#111827] border border-white/10 rounded-3xl p-4 shadow-xl flex flex-col gap-3">
        <h2 className="text-base font-extrabold text-white">Final Standings</h2>

        <div className="flex flex-col gap-2">
          {rankedPlayers.map((item, idx) => {
            const isFirst = idx === 0;
            return (
              <div
                key={item.player.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isFirst
                    ? 'bg-amber-400/10 border-amber-400/30'
                    : 'bg-[#090d16] border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                      idx === 0
                        ? 'bg-amber-400 text-neutral-900'
                        : idx === 1
                        ? 'bg-neutral-300 text-neutral-900'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-extrabold text-sm text-white">{item.player.name}</p>
                    <p className="text-[11px] text-neutral-400">
                      {item.birdies}B • {item.pars}P • {item.bogeys}Bog
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-base text-white">{item.total}</span>
                  <span
                    className={`ml-2 text-xs font-bold ${
                      item.scoreToPar < 0
                        ? 'text-emerald-400'
                        : item.scoreToPar === 0
                        ? 'text-neutral-400'
                        : 'text-orange-400'
                    }`}
                  >
                    ({item.scoreToPar > 0 ? `+${item.scoreToPar}` : item.scoreToPar === 0 ? 'E' : item.scoreToPar})
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Share Button for Group Chat */}
        <button
          onClick={handleCopySummary}
          className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98"
        >
          {copied ? (
            <>
              <CheckIcon size={18} />
              <span>Copied Recap to Clipboard!</span>
            </>
          ) : (
            <>
              <ShareIcon size={18} />
              <span>Copy Full Recap for Group Chat</span>
            </>
          )}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onViewLeaderboard}
          className="w-full py-3.5 rounded-2xl bg-[#111827] hover:bg-[#1f2937] border border-white/10 text-white font-bold text-sm shadow transition-colors"
        >
          View All-Time Course Records
        </button>

        <button
          onClick={onNewRound}
          className="w-full py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white font-bold text-sm transition-colors"
        >
          Start Another Round
        </button>
      </div>
    </div>
  );
};
