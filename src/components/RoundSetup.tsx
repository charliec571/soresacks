import React, { useState } from 'react';
import { PlusIcon, CloseIcon, BeerIcon, ChevronLeftIcon, CheckIcon } from './Icons';
import { courseData } from '../data/courseData';

interface RoundSetupProps {
  onStartRound: (playerNames: string[], layoutId: string) => void;
  onJoinRoom: (roomCode: string) => void;
  initialTab?: 'create' | 'join';
  onBack?: () => void;
}

export const RoundSetup: React.FC<RoundSetupProps> = ({
  onStartRound,
  onJoinRoom,
  initialTab = 'create',
  onBack
}) => {
  const [players, setPlayers] = useState<string[]>(['Charlie C.', 'Player 2']);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>('9-hole');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'join'>(initialTab);

  const handleAddPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newPlayerName.trim();
    if (trimmed && !players.includes(trimmed) && players.length < 8) {
      setPlayers([...players, trimmed]);
      setNewPlayerName('');
    }
  };

  const handleAddQuickName = (name: string) => {
    if (!players.includes(name) && players.length < 8) {
      setPlayers([...players, name]);
    }
  };

  const handleRemovePlayer = (idx: number) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== idx));
    }
  };

  const handleStart = () => {
    if (players.length > 0) {
      onStartRound(players, selectedLayoutId);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCodeInput.trim().length >= 3) {
      onJoinRoom(roomCodeInput.trim().toUpperCase());
    }
  };

  const quickFriends = ['Chris Wilson', 'Kaleb', 'Chuck', 'Beer Buddy'];

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto pb-24 animate-fade-in">
      {/* Top Navigation Bar with Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-bold border border-white/10 transition-colors"
        >
          <ChevronLeftIcon size={16} />
          <span>Back to Splash</span>
        </button>
      )}

      {/* Course Mini Hero Banner with Crest */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#090d16] border border-white/10 rounded-3xl p-4 shadow-xl flex items-center gap-4">
        <img
          src="./course-logo.png"
          alt="Sore Sacks & Six Packs Emblem"
          className="w-20 h-20 object-contain drop-shadow-md flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = './course-logo-original.jpg';
          }}
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
              Private Course
            </span>
            <span className="text-[10px] text-neutral-400 font-bold">Fort Wayne, IN</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight leading-tight mt-1">
            Sore Sacks &amp; Six Packs
          </h1>
          <p className="text-[11px] text-neutral-400 font-semibold mt-0.5">
            9 Holes • 3 Axiom Baskets • Par 28
          </p>
        </div>
      </div>

      {/* Mode Tabs: Create Round vs Join Live Room */}
      <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
            activeTab === 'create'
              ? 'bg-emerald-500 text-neutral-950 font-black shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Start New Round
        </button>
        <button
          onClick={() => setActiveTab('join')}
          className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
            activeTab === 'join'
              ? 'bg-emerald-500 text-neutral-950 font-black shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Join Live Card
        </button>
      </div>

      {activeTab === 'create' ? (
        <div className="bg-[#111827] border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col gap-5">
          {/* Layout Selection */}
          <div className="flex flex-col gap-2.5">
            <div>
              <h2 className="text-base font-extrabold text-white">Choose Layout</h2>
              <p className="text-xs text-neutral-400">Select course configuration for this round.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* 9-Hole Layout */}
              <button
                type="button"
                onClick={() => setSelectedLayoutId('9-hole')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  selectedLayoutId === '9-hole'
                    ? 'bg-emerald-500/15 border-emerald-400 ring-2 ring-emerald-400/40 shadow-md'
                    : 'bg-[#090d16] hover:bg-white/5 border-white/10 text-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-sm text-white">9-Hole Loop</span>
                  {selectedLayoutId === '9-hole' && (
                    <span className="w-4 h-4 rounded-full bg-emerald-400 text-neutral-950 flex items-center justify-center text-[10px] font-black">
                      ✓
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-extrabold text-emerald-400">
                  Par 28 • 2,145 ft
                </div>
                <p className="text-[10px] text-neutral-400 font-medium mt-1 leading-snug">
                  Full 9 holes including 3 Safari holes (7, 8, 9)
                </p>
              </button>

              {/* 6-Hole Layout (UDisc) */}
              <button
                type="button"
                onClick={() => setSelectedLayoutId('6-hole')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  selectedLayoutId === '6-hole'
                    ? 'bg-emerald-500/15 border-emerald-400 ring-2 ring-emerald-400/40 shadow-md'
                    : 'bg-[#090d16] hover:bg-white/5 border-white/10 text-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-sm text-white">6-Hole Classic</span>
                  {selectedLayoutId === '6-hole' && (
                    <span className="w-4 h-4 rounded-full bg-emerald-400 text-neutral-950 flex items-center justify-center text-[10px] font-black">
                      ✓
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-teal-400">
                  <span>Par 18 • 1,460 ft</span>
                </div>
                <p className="text-[10px] text-neutral-400 font-medium mt-1 leading-snug">
                  Official UDisc layout (#163451) • 3 baskets × 2 approaches
                </p>
              </button>
            </div>
          </div>

          <div className="pt-1 border-t border-white/10">
            <h2 className="text-base font-extrabold text-white">Who's on the Card?</h2>
            <p className="text-xs text-neutral-400">Add players to track scores together live.</p>
          </div>

          {/* Current Players List */}
          <div className="flex flex-col gap-2">
            {players.map((name, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#090d16] border border-white/5 shadow-inner"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-300 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-sm text-white">{name}</span>
                </div>
                {players.length > 1 && (
                  <button
                    onClick={() => handleRemovePlayer(idx)}
                    className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                  >
                    <CloseIcon size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Player Input Form */}
          {players.length < 8 && (
            <form onSubmit={handleAddPlayer} className="flex gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Enter player name..."
                maxLength={20}
                className="flex-1 bg-[#090d16] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <PlusIcon size={16} />
                <span>Add</span>
              </button>
            </form>
          )}

          {/* Quick Add Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-neutral-400 mr-1">Quick Add:</span>
            {quickFriends.map((friend) => (
              <button
                key={friend}
                onClick={() => handleAddQuickName(friend)}
                disabled={players.includes(friend)}
                className={`text-xs py-1 px-2.5 rounded-xl border transition-all ${
                  players.includes(friend)
                    ? 'opacity-40 border-transparent text-neutral-600 bg-neutral-900 cursor-not-allowed'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300'
                }`}
              >
                + {friend}
              </button>
            ))}
          </div>

          {/* Start Round Button */}
          <button
            onClick={handleStart}
            className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-98 text-neutral-950 font-black text-base shadow-xl shadow-emerald-950/40 border border-emerald-400 transition-all flex items-center justify-center gap-2"
          >
            <span>
              Tee Off • {selectedLayoutId === '6-hole' ? '6 Holes' : '9 Holes'} ({players.length} Player{players.length > 1 ? 's' : ''})
            </span>
          </button>
        </div>
      ) : (
        <div className="bg-[#111827] border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
          <div>
            <h2 className="text-base font-extrabold text-white">Join Friend's Card</h2>
            <p className="text-xs text-neutral-400">
              Enter the 4-letter Room Code from your cardmate's phone.
            </p>
          </div>

          <form onSubmit={handleJoin} className="flex flex-col gap-3">
            <input
              type="text"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. S6P1"
              maxLength={6}
              className="bg-[#090d16] border border-white/15 rounded-2xl px-4 py-3.5 text-center text-2xl font-black text-emerald-400 tracking-widest placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={roomCodeInput.trim().length < 3}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all"
            >
              Sync &amp; Join Card
            </button>
          </form>

          <p className="text-[11px] text-center text-neutral-400 mt-2">
            Scores update in real time across all phones on the same card!
          </p>
        </div>
      )}
    </div>
  );
};
