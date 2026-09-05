import React from 'react';
import { courseData } from '../data/courseData';
import { BeerIcon, MapPinIcon, TrophyIcon, UsersIcon, DiscIcon, ChevronRightIcon } from './Icons';

interface SplashScreenProps {
  onStartRound: () => void;
  onJoinRound: () => void;
  onOpenMap: () => void;
  onOpenLeaderboard: () => void;
  onOpenRules: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onStartRound,
  onJoinRound,
  onOpenMap,
  onOpenLeaderboard,
  onOpenRules
}) => {
  return (
    <div className="flex flex-col items-center max-w-md mx-auto pb-28 pt-2 px-2 animate-fade-in text-center">
      {/* 1. Official Course Crest Emblem */}
      <div className="relative group w-full max-w-[320px] mx-auto flex flex-col items-center">
        {/* Soft Ambient Glow Behind Logo */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl scale-95 pointer-events-none" />

        <div className="relative z-10 p-2 transition-transform duration-300 hover:scale-102">
          <img
            src="./course-logo.png"
            alt="Sore Sacks & Six Packs Disc Golf Course - Fort Wayne, Indiana"
            className="w-full h-auto max-h-[380px] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
            onError={(e) => {
              // Fallback to original image if needed
              (e.target as HTMLImageElement).src = './course-logo-original.jpg';
            }}
          />
        </div>
      </div>

      {/* 2. Course Lore & Tagline */}
      <div className="mt-3 flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black tracking-wide shadow-sm">
        <BeerIcon size={16} className="text-amber-400" />
        <span>"Don't Be a Loser, DRINK BEER!"</span>
      </div>

      {/* 3. Course Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-2 w-full mt-4 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col items-center">
          <span className="text-lg font-black text-white">9</span>
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Holes</span>
        </div>
        <div className="flex flex-col items-center border-l border-white/10">
          <span className="text-lg font-black text-emerald-400">3</span>
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Baskets</span>
        </div>
        <div className="flex flex-col items-center border-l border-white/10">
          <span className="text-lg font-black text-amber-400">28</span>
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Par</span>
        </div>
        <div className="flex flex-col items-center border-l border-white/10">
          <span className="text-lg font-black text-[#f97316]">2,145'</span>
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Total Ft</span>
        </div>
      </div>

      {/* 4. Primary Play Action Buttons */}
      <div className="flex flex-col gap-2.5 w-full mt-5">
        <button
          onClick={onStartRound}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-neutral-950 font-black text-base shadow-xl shadow-emerald-950/50 border border-emerald-300 flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <DiscIcon size={20} className="text-neutral-950" />
          <span>Start New Round</span>
          <ChevronRightIcon size={18} className="ml-1" />
        </button>

        <button
          onClick={onJoinRound}
          className="w-full py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/15 flex items-center justify-center gap-2 transition-all active:scale-98 backdrop-blur-sm"
        >
          <UsersIcon size={18} className="text-emerald-400" />
          <span>Join Live Card (Room Code / QR)</span>
        </button>
      </div>

      {/* 5. Quick Discovery Links */}
      <div className="grid grid-cols-3 gap-2 w-full mt-4">
        <button
          onClick={onOpenMap}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all active:scale-95 group shadow"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <MapPinIcon size={18} />
          </div>
          <span className="text-xs font-black">GPS Map</span>
          <span className="text-[9px] text-neutral-400">Satellite Caddie</span>
        </button>

        <button
          onClick={onOpenLeaderboard}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all active:scale-95 group shadow"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <TrophyIcon size={18} />
          </div>
          <span className="text-xs font-black">Records</span>
          <span className="text-[9px] text-neutral-400">Low Rounds</span>
        </button>

        <button
          onClick={onOpenRules}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all active:scale-95 group shadow"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <BeerIcon size={18} />
          </div>
          <span className="text-xs font-black">House Lore</span>
          <span className="text-[9px] text-neutral-400">Rules & Baskets</span>
        </button>
      </div>

      {/* Footer Course Info */}
      <div className="mt-6 text-neutral-400 text-[11px] flex flex-col items-center gap-1">
        <p>Private Course • Fort Wayne, Indiana • Est. 2026</p>
        <p className="text-neutral-500 text-[10px]">
          Baskets courtesy of The Honorable Chris Wilson
        </p>
      </div>
    </div>
  );
};
