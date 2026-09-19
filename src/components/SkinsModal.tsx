import React, { useState } from 'react';
import { Round, SkinsConfig } from '../types';
import { courseData, getLayout } from '../data/courseData';
import { calculateSkins } from '../utils/skins';
import { CloseIcon, TrophyIcon, BeerIcon, CheckIcon } from './Icons';

interface SkinsModalProps {
  round: Round;
  onClose: () => void;
  onUpdateSkinsConfig: (config: SkinsConfig) => void;
  onMarkCtp: (holeNumber: number, playerId: string, distanceInches?: number) => void;
}

export const SkinsModal: React.FC<SkinsModalProps> = ({
  round,
  onClose,
  onUpdateSkinsConfig,
  onMarkCtp
}) => {
  const [activeTab, setActiveTab] = useState<'standings' | 'ctp' | 'settings'>('standings');
  const layout = getLayout(round.layoutId);
  const skinsData = calculateSkins(round);

  const config = round.skinsConfig || {
    enabled: true,
    stakeType: 'cash',
    stakeAmount: 1,
    carryovers: true
  };

  const [stakeType, setStakeType] = useState<'cash' | 'beer' | 'bragging'>(config.stakeType);
  const [stakeAmount, setStakeAmount] = useState<number>(config.stakeAmount);
  const [carryovers, setCarryovers] = useState<boolean>(config.carryovers);

  const handleSaveSettings = () => {
    onUpdateSkinsConfig({
      enabled: true,
      stakeType,
      stakeAmount,
      carryovers
    });
    setActiveTab('standings');
  };

  return (
    <div className="fixed inset-0 z-[2200] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-[#111827] border border-white/15 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-neutral-950 font-black shadow">
              <TrophyIcon size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">
                Skins Game &amp; CTP
              </h2>
              <p className="text-[11px] text-neutral-400 font-bold">
                {round.courseName} • {layout.holeCount} Holes ({layout.name}) • Live Match
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 flex items-center justify-center transition-colors"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#090d16]/60 p-1">
          <button
            onClick={() => setActiveTab('standings')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === 'standings'
                ? 'bg-emerald-500 text-neutral-950 shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Skins Standings
          </button>
          <button
            onClick={() => setActiveTab('ctp')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === 'ctp'
                ? 'bg-emerald-500 text-neutral-950 shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            CTP Awards
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === 'settings'
                ? 'bg-emerald-500 text-neutral-950 shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Stakes &amp; Rules
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4 no-scrollbar">
          {activeTab === 'standings' && (
            <>
              {/* Carryover Alert Banner */}
              {skinsData.currentPot > 1 && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <div>
                      <span className="text-xs font-black text-white">
                        Carryover Active!
                      </span>
                      <p className="text-[11px] text-orange-300 font-medium">
                        Next hole is worth{' '}
                        <strong className="text-white font-black">
                          {skinsData.currentPot} Skins
                        </strong>
                        !
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-orange-500 text-white text-xs font-black">
                    +{skinsData.currentPot}
                  </span>
                </div>
              )}

              {/* Player Standings Leaderboard */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-black text-neutral-300 uppercase tracking-wider">
                  Current Standings
                </span>
                {skinsData.playerSummaries.map((p, idx) => (
                  <div
                    key={p.playerId}
                    className="p-3 rounded-2xl bg-[#090d16] border border-white/5 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                        style={{ backgroundColor: p.playerColor }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-extrabold text-white">{p.playerName}</span>
                          {idx === 0 && p.skinsWon > 0 && (
                            <span className="text-amber-400" title="Leading Skins">
                              ★
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400">
                          {p.holesWon.length > 0
                            ? `Won Hole ${p.holesWon.join(', ')}`
                            : 'No skins yet'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-emerald-400">
                        {p.skinsWon} {p.skinsWon === 1 ? 'Skin' : 'Skins'}
                      </span>
                      <p className="text-xs font-bold text-amber-400">{p.payoutText}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hole by Hole Resolution Matrix */}
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-xs font-black text-neutral-300 uppercase tracking-wider">
                  Hole-by-Hole Skins Matrix
                </span>
                <div className="rounded-2xl border border-white/10 bg-[#090d16] overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-neutral-400 text-[10px] uppercase font-black bg-white/5">
                        <th className="p-2.5">Hole</th>
                        <th className="p-2.5">Winner</th>
                        <th className="p-2.5 text-right">Skins</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skinsData.results.map((r) => {
                        const hole = layout.holes.find((h) => h.number === r.holeNumber);
                        return (
                          <tr key={r.holeNumber} className="border-b border-white/5">
                            <td className="p-2.5 font-bold text-white">
                              H{r.holeNumber}{' '}
                              <span className="text-[10px] text-neutral-400 font-normal">
                                (P{hole?.par})
                              </span>
                            </td>
                            <td className="p-2.5">
                              {r.winnerName ? (
                                <span className="font-extrabold text-emerald-400">
                                  {r.winnerName}
                                </span>
                              ) : r.isCarryover ? (
                                <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-bold">
                                  Tied (Carried Over)
                                </span>
                              ) : (
                                <span className="text-neutral-500 italic">Pending</span>
                              )}
                            </td>
                            <td className="p-2.5 text-right font-black text-white">
                              {r.winnerName ? `+${r.skinsValue}` : `${r.skinsValue} pot`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'ctp' && (
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300">
                <p className="font-bold text-white mb-1">🎯 Closest to Pin (CTP)</p>
                <p className="text-[11px] text-neutral-400">
                  Mark which player parked their drive closest to the pin on each hole.
                  Special course favorite: <strong className="text-emerald-400">Hole 3 (161 ft)</strong>
                  {layout.holeCount >= 7 ? <span> and <strong className="text-emerald-400">Hole 7 (170 ft)</strong></span> : null}!
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {layout.holes.map((hole) => {
                  const currentCtp = round.ctpWinners?.[hole.number];
                  const isShortHole = hole.number === 3 || hole.number === 7;

                  return (
                    <div
                      key={hole.number}
                      className={`p-3 rounded-2xl border flex flex-col gap-2 transition-all ${
                        currentCtp
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : isShortHole
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : 'bg-[#090d16] border-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-sm">Hole {hole.number}</span>
                          <span className="text-xs text-neutral-400">
                            Par {hole.par} • {hole.distanceFt} ft
                          </span>
                          {isShortHole && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black border border-amber-400/30">
                              Prime CTP
                            </span>
                          )}
                        </div>

                        {currentCtp && (
                          <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                            <CheckIcon size={14} />
                            <span>{currentCtp.playerName}</span>
                          </span>
                        )}
                      </div>

                      {/* Select CTP Winner */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {round.players.map((p) => {
                          const isWinner = currentCtp?.playerId === p.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => onMarkCtp(hole.number, p.id)}
                              className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 border transition-all ${
                                isWinner
                                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow'
                                  : 'bg-white/5 text-neutral-400 border-white/5 hover:text-white'
                              }`}
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: p.color }}
                              />
                              <span>{p.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex flex-col gap-4">
              {/* Stake Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-neutral-300 uppercase">
                  Stake Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setStakeType('cash')}
                    className={`p-3 rounded-2xl border text-xs font-black flex flex-col items-center gap-1 transition-all ${
                      stakeType === 'cash'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow'
                        : 'bg-white/5 text-neutral-400 border-white/5'
                    }`}
                  >
                    <span className="text-lg">💵</span>
                    <span>Cash ($)</span>
                  </button>

                  <button
                    onClick={() => setStakeType('beer')}
                    className={`p-3 rounded-2xl border text-xs font-black flex flex-col items-center gap-1 transition-all ${
                      stakeType === 'beer'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow'
                        : 'bg-white/5 text-neutral-400 border-white/5'
                    }`}
                  >
                    <span className="text-lg">🍺</span>
                    <span>Beer (Six Packs)</span>
                  </button>

                  <button
                    onClick={() => setStakeType('bragging')}
                    className={`p-3 rounded-2xl border text-xs font-black flex flex-col items-center gap-1 transition-all ${
                      stakeType === 'bragging'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-400 shadow'
                        : 'bg-white/5 text-neutral-400 border-white/5'
                    }`}
                  >
                    <span className="text-lg">👑</span>
                    <span>Bragging Rights</span>
                  </button>
                </div>
              </div>

              {/* Stake Amount */}
              {stakeType !== 'bragging' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-neutral-300 uppercase">
                    Stake per Skin: {stakeType === 'cash' ? `$${stakeAmount}` : `${stakeAmount} Beer`}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 5, 10].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setStakeAmount(amt)}
                        className={`py-2 rounded-xl text-xs font-black border transition-all ${
                          stakeAmount === amt
                            ? 'bg-emerald-500 text-neutral-950 border-emerald-400'
                            : 'bg-white/5 text-neutral-300 border-white/5'
                        }`}
                      >
                        {stakeType === 'cash' ? `$${amt}` : `${amt} 🍺`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Carryovers Toggle */}
              <div className="p-3.5 rounded-2xl bg-[#090d16] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-white">Allow Carryovers</span>
                  <p className="text-[11px] text-neutral-400">
                    If players tie on a hole, the skin carries over to the next hole.
                  </p>
                </div>
                <button
                  onClick={() => setCarryovers(!carryovers)}
                  className={`w-12 h-7 rounded-full transition-colors relative flex items-center px-1 ${
                    carryovers ? 'bg-emerald-500' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      carryovers ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-neutral-950 font-black text-sm shadow-xl shadow-emerald-950/40 border border-emerald-400 transition-transform active:scale-98"
              >
                Save Stakes &amp; Return
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
