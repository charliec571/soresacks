import React, { useState } from 'react';
import { courseData } from '../data/courseData';
import { PlusIcon, CloseIcon, BeerIcon } from './Icons';

interface RoundSetupProps {
  onStartRound: (playerNames: string[]) => void;
  onJoinRoom: (roomCode: string) => void;
}

export const RoundSetup: React.FC<RoundSetupProps> = ({ onStartRound, onJoinRoom }) => {
  const [players, setPlayers] = useState<string[]>(['Charlie C.', 'Player 2']);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

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
      onStartRound(players);
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
    <div className="flex flex-col gap-5 max-w-md mx-auto pb-24 animate-fade-in">
      {/* Course Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#132d34] via-[#193840] to-[#0c1f24] border border-[#ea5826]/30 rounded-3xl p-5 shadow-2xl">
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ea5826] text-white text-[10px] font-black uppercase tracking-wider">
              Private Course
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              Fort Wayne, IN
            </span>
          </div>

          <h1 className="text-3xl font-black text-[#f6eedb] tracking-tight leading-tight">
            Sore Sacks &amp; Six Packs
          </h1>

          <div className="flex items-center gap-4 text-xs font-bold text-[#d1dfdb]/80 mt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[#ea5826] font-black">9</span> Holes
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-black">3</span> Axiom Baskets
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              Par <span className="text-[#f4b340] font-black">28</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-black">2,145</span> ft
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-[#d1dfdb]/90">
            <BeerIcon size={16} className="text-[#f4b340] flex-shrink-0" />
            <span className="italic">"Don't Be a Loser, DRINK BEER!"</span>
          </div>
        </div>
      </div>

      {/* Mode Tabs: Create Round vs Join Live Room */}
      <div className="flex p-1 bg-[#132d34] rounded-2xl border border-white/10">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
            activeTab === 'create'
              ? 'bg-gradient-to-tr from-[#ea5826] to-[#f4b340] text-white shadow-md'
              : 'text-[#d1dfdb]/70 hover:text-white'
          }`}
        >
          Start New Round
        </button>
        <button
          onClick={() => setActiveTab('join')}
          className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
            activeTab === 'join'
              ? 'bg-gradient-to-tr from-[#ea5826] to-[#f4b340] text-white shadow-md'
              : 'text-[#d1dfdb]/70 hover:text-white'
          }`}
        >
          Join Live Card
        </button>
      </div>

      {activeTab === 'create' ? (
        <div className="bg-[#132d34] border border-[#f6eedb]/15 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
          <div>
            <h2 className="text-base font-extrabold text-[#f6eedb]">Who's on the Card?</h2>
            <p className="text-xs text-[#d1dfdb]/70">Add players to track scores together live.</p>
          </div>

          {/* Current Players List */}
          <div className="flex flex-col gap-2">
            {players.map((name, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#0c1f24] border border-white/5 shadow-inner"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-300 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-sm text-[#f6eedb]">{name}</span>
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
                className="flex-1 bg-[#0c1f24] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ea5826]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-[#193840] hover:bg-[#1f434c] border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
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
                    : 'bg-[#193840]/60 hover:bg-[#193840] border-white/10 text-[#d1dfdb]'
                }`}
              >
                + {friend}
              </button>
            ))}
          </div>

          {/* Start Round Button */}
          <button
            onClick={handleStart}
            className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-tr from-[#ea5826] to-[#f4b340] hover:from-[#f36c3a] hover:to-[#f59e0b] active:scale-98 text-white font-black text-base shadow-xl shadow-[#ea5826]/30 border border-[#ea5826]/50 transition-all flex items-center justify-center gap-2"
          >
            <span>Tee Off ({players.length} Player{players.length > 1 ? 's' : ''})</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#132d34] border border-[#f6eedb]/15 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
          <div>
            <h2 className="text-base font-extrabold text-[#f6eedb]">Join Friend's Card</h2>
            <p className="text-xs text-[#d1dfdb]/70">
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
              className="bg-[#0c1f24] border border-white/15 rounded-2xl px-4 py-3.5 text-center text-2xl font-black text-[#f4b340] tracking-widest placeholder-neutral-600 focus:outline-none focus:border-[#ea5826]"
            />
            <button
              type="submit"
              disabled={roomCodeInput.trim().length < 3}
              className="w-full py-3.5 rounded-2xl bg-[#ea5826] hover:bg-[#f36c3a] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm shadow-lg shadow-[#ea5826]/20 transition-all"
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
