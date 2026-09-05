import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { syncService } from '../services/syncService';
import { courseData } from '../data/courseData';
import { TrophyIcon, DiscIcon } from './Icons';

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'records' | 'holeStats'>('records');

  useEffect(() => {
    setEntries(syncService.getLeaderboard());
  }, []);

  // Compute hole averages across all logged leaderboard entries
  const holeStats = courseData.holes.map((h, hIdx) => {
    let sum = 0;
    let count = 0;
    entries.forEach((e) => {
      if (e.holeScores && e.holeScores[hIdx] !== undefined) {
        sum += e.holeScores[hIdx];
        count++;
      }
    });

    const avg = count > 0 ? sum / count : h.par;
    const diffFromPar = avg - h.par;

    return {
      hole: h,
      avg: avg.toFixed(2),
      diffFromPar,
      isHardest: false,
      isEasiest: false
    };
  });

  // Identify hardest and easiest holes
  if (holeStats.length > 0) {
    let maxDiff = -999;
    let minDiff = 999;
    let maxIdx = 0;
    let minIdx = 0;

    holeStats.forEach((stat, idx) => {
      if (stat.diffFromPar > maxDiff) {
        maxDiff = stat.diffFromPar;
        maxIdx = idx;
      }
      if (stat.diffFromPar < minDiff) {
        minDiff = stat.diffFromPar;
        minIdx = idx;
      }
    });

    holeStats[maxIdx].isHardest = true;
    holeStats[minIdx].isEasiest = true;
  }

  return (
    <div className="flex flex-col gap-5 max-w-md mx-auto pb-28 animate-fade-in">
      {/* Title Header */}
      <div className="bg-[#132d34] border border-[#f6eedb]/15 rounded-3xl p-5 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrophyIcon size={20} className="text-[#f4b340]" />
            <h1 className="text-xl font-black text-[#f6eedb] tracking-tight">Course Records</h1>
          </div>
          <p className="text-xs text-[#d1dfdb]/70 mt-0.5">
            {courseData.name} • Par {courseData.totalPar}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-extrabold uppercase text-neutral-400">Course Record</span>
          <p className="text-xl font-black text-emerald-400">
            {entries[0] ? `${entries[0].scoreToPar} (${entries[0].totalScore})` : '-'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-[#132d34] rounded-2xl border border-white/10">
        <button
          onClick={() => setActiveTab('records')}
          className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
            activeTab === 'records'
              ? 'bg-gradient-to-tr from-[#ea5826] to-[#f4b340] text-white shadow-md'
              : 'text-[#d1dfdb]/70 hover:text-white'
          }`}
        >
          All-Time Low Rounds
        </button>
        <button
          onClick={() => setActiveTab('holeStats')}
          className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
            activeTab === 'holeStats'
              ? 'bg-gradient-to-tr from-[#ea5826] to-[#f4b340] text-white shadow-md'
              : 'text-[#d1dfdb]/70 hover:text-white'
          }`}
        >
          Hole Difficulty Stats
        </button>
      </div>

      {activeTab === 'records' ? (
        <div className="flex flex-col gap-2.5">
          {entries.length === 0 ? (
            <div className="p-8 text-center bg-[#132d34] rounded-3xl border border-white/10">
              <p className="text-sm font-bold text-neutral-400">No rounds recorded yet.</p>
              <p className="text-xs text-neutral-500 mt-1">
                Tee off and finish a 9-hole round to claim the top spot!
              </p>
            </div>
          ) : (
            entries.map((item, idx) => {
              const isTopThree = idx < 3;
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    idx === 0
                      ? 'bg-gradient-to-r from-amber-400/15 via-[#132d34] to-[#132d34] border-amber-400/40 shadow-lg'
                      : 'bg-[#132d34] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black min-w-[28px] text-center">{medal}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-[#f6eedb]">
                          {item.playerName}
                        </span>
                        {item.aces > 0 && (
                          <span className="text-amber-300 text-xs" title="Hole in One!">
                            🎯
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        {item.date} • {item.birdies} Birdie{item.birdies !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-lg text-white">{item.totalScore}</span>
                    <span
                      className={`ml-2 text-xs font-black px-2 py-0.5 rounded-full ${
                        item.scoreToPar < 0
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                          : item.scoreToPar === 0
                          ? 'bg-neutral-700/40 text-neutral-300'
                          : 'bg-orange-500/20 text-orange-300'
                      }`}
                    >
                      {item.scoreToPar > 0 ? `+${item.scoreToPar}` : item.scoreToPar === 0 ? 'E' : item.scoreToPar}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-[#132d34] border border-[#f6eedb]/15 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
          <div>
            <h2 className="text-base font-extrabold text-[#f6eedb]">Hole-by-Hole Averages</h2>
            <p className="text-xs text-[#d1dfdb]/70">
              Shows how the course plays across recorded rounds.
            </p>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            {holeStats.map((stat) => (
              <div
                key={stat.hole.number}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#0c1f24] border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#193840] flex items-center justify-center text-xs font-black text-white">
                    H{stat.hole.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#f6eedb]">
                        Par {stat.hole.par} • {stat.hole.distanceFt} ft
                      </span>
                      {stat.isHardest && (
                        <span className="px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold uppercase">
                          Hardest
                        </span>
                      )}
                      {stat.isEasiest && (
                        <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold uppercase">
                          Best Birdie
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      Basket {stat.hole.basket.basketNumber} ({stat.hole.basket.name})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-sm text-[#f6eedb]">{stat.avg} avg</span>
                  <p
                    className={`text-[11px] font-bold ${
                      stat.diffFromPar > 0
                        ? 'text-orange-400'
                        : stat.diffFromPar < 0
                        ? 'text-blue-400'
                        : 'text-neutral-400'
                    }`}
                  >
                    {stat.diffFromPar > 0
                      ? `+${stat.diffFromPar.toFixed(2)}`
                      : stat.diffFromPar === 0
                      ? 'Even Par'
                      : stat.diffFromPar.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
