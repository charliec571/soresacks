import React, { useState } from 'react';
import { Round } from '../types';
import { courseData } from '../data/courseData';
import { TrophyIcon, ShareIcon, CheckIcon, BeerIcon } from './Icons';

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

  // Compute final player rankings
  const rankedPlayers = round.players
    .map((p) => {
      let total = 0;
      let birdies = 0;
      let pars = 0;
      let bogeys = 0;
      let aces = 0;

      courseData.holes.forEach((h) => {
        const s = p.scores[h.number] ?? h.par;
        total += s;
        if (s === 1) aces++;
        else if (s < h.par) birdies++;
        else if (s === h.par) pars++;
        else if (s > h.par) bogeys++;
      });

      const scoreToPar = total - courseData.totalPar;
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

  const winner = rankedPlayers[0];

  const handleCopySummary = () => {
    let text = `🍻 Sore Sacks & Six Packs - Round Complete!\n`;
    text += `📅 ${round.date} • Par ${courseData.totalPar}\n\n`;

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

    text += `\nPrivate 9-hole layout • 3 Axiom Baskets • Fort Wayne, IN`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="flex flex-col gap-5 max-w-md mx-auto pb-24 animate-fade-in">
      {/* Celebration Card */}
      <div className="bg-gradient-to-b from-[#193840] to-[#132d34] border border-[#f4b340]/40 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-300 mb-3 shadow-lg shadow-amber-400/20">
          <TrophyIcon size={32} />
        </div>

        <span className="px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/30">
          Round Champion
        </span>

        <h1 className="text-3xl font-black text-[#f6eedb] mt-2">{winner.player.name}</h1>

        <div className="flex items-center justify-center gap-3 mt-2 text-base font-extrabold">
          <span className="text-white text-2xl">{winner.total} Strokes</span>
          <span className="text-neutral-500">•</span>
          <span
            className={`text-2xl font-black ${
              winner.scoreToPar < 0
                ? 'text-blue-400'
                : winner.scoreToPar === 0
                ? 'text-neutral-300'
                : 'text-orange-400'
            }`}
          >
            {winner.scoreToPar > 0
              ? `+${winner.scoreToPar}`
              : winner.scoreToPar === 0
              ? 'E'
              : winner.scoreToPar}
          </span>
        </div>

        <p className="text-xs text-[#d1dfdb]/70 mt-2">
          {winner.birdies} Birdie{winner.birdies !== 1 ? 's' : ''} • {winner.pars} Par
          {winner.pars !== 1 ? 's' : ''}
          {winner.aces > 0 && ` • 🎯 ${winner.aces} ACE!`}
        </p>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-amber-300 font-bold">
          <BeerIcon size={16} />
          <span>Winner drinks for free at Sore Sacks!</span>
        </div>
      </div>

      {/* Full Card Standings */}
      <div className="bg-[#132d34] border border-[#f6eedb]/15 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
        <h2 className="text-base font-extrabold text-[#f6eedb]">Final Standings</h2>

        <div className="flex flex-col gap-2">
          {rankedPlayers.map((item, idx) => {
            const isFirst = idx === 0;
            return (
              <div
                key={item.player.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isFirst
                    ? 'bg-amber-400/10 border-amber-400/30'
                    : 'bg-[#0c1f24] border-white/5'
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
                    <p className="font-extrabold text-sm text-[#f6eedb]">{item.player.name}</p>
                    <p className="text-[11px] text-[#d1dfdb]/60">
                      {item.birdies}B • {item.pars}P • {item.bogeys}Bog
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-base text-white">{item.total}</span>
                  <span
                    className={`ml-2 text-xs font-bold ${
                      item.scoreToPar < 0
                        ? 'text-blue-400'
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
          className="mt-2 w-full py-3 rounded-2xl bg-[#193840] hover:bg-[#1f434c] text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition-colors"
        >
          {copied ? <CheckIcon size={16} className="text-emerald-400" /> : <ShareIcon size={16} />}
          <span>{copied ? 'Scorecard Copied to Clipboard!' : 'Copy Summary for Group Chat'}</span>
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={onViewLeaderboard}
          className="w-full py-3.5 rounded-2xl bg-[#ea5826] hover:bg-[#f36c3a] text-white font-black text-sm shadow-lg shadow-[#ea5826]/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <TrophyIcon size={18} />
          <span>View All-Time Course Records</span>
        </button>

        <button
          onClick={onNewRound}
          className="w-full py-3.5 rounded-2xl bg-[#132d34] hover:bg-[#193840] border border-white/15 text-[#f6eedb] font-bold text-sm transition-colors"
        >
          Play Another Round
        </button>
      </div>
    </div>
  );
};
