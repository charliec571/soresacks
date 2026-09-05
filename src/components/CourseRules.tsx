import React from 'react';
import { courseData } from '../data/courseData';
import { syncService } from '../services/syncService';
import { BeerIcon, BasketIcon, InfoIcon } from './Icons';

interface CourseRulesProps {
  onResetRound?: () => void;
}

export const CourseRules: React.FC<CourseRulesProps> = ({ onResetRound }) => {
  const handleClear = () => {
    if (confirm('Are you sure you want to discard the active round?')) {
      syncService.clearActiveRound();
      if (onResetRound) onResetRound();
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-md mx-auto pb-28 animate-fade-in">
      {/* Course Lore & Rules */}
      <div className="bg-[#132d34] border border-[#f6eedb]/15 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
            <BeerIcon size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#f6eedb] tracking-tight">
              Course Guide &amp; Lore
            </h1>
            <p className="text-xs text-[#d1dfdb]/70">Sore Sacks &amp; Six Packs • Private Course</p>
          </div>
        </div>

        {/* Caddie Commandments */}
        <div className="flex flex-col gap-2.5 pt-1">
          <h2 className="text-xs font-black uppercase text-[#ea5826] tracking-wider">
            Official House Rules
          </h2>

          <div className="p-3.5 rounded-2xl bg-[#0c1f24] border border-white/5 flex flex-col gap-2 text-xs">
            <div className="flex items-start gap-2 text-[#f6eedb]">
              <span className="text-amber-400 font-black">#1</span>
              <span><strong>Don't Be a Loser, DRINK BEER!!</strong> (BYOB encouraged, maintain good vibes at all times).</span>
            </div>
            <div className="flex items-start gap-2 text-[#f6eedb]">
              <span className="text-amber-400 font-black">#2</span>
              <span><strong>Swift Kick in the Ass</strong> to start the round!</span>
            </div>
            <div className="flex items-start gap-2 text-[#f6eedb]">
              <span className="text-amber-400 font-black">#3</span>
              <span><strong>SJBR per round!</strong> Keep the disc golf traditions alive.</span>
            </div>
            <div className="flex items-start gap-2 text-[#f6eedb]">
              <span className="text-amber-400 font-black">#4</span>
              <span><strong>Private Access:</strong> Strictly registered guests and authorized crew only. Respect property lines.</span>
            </div>
          </div>
        </div>

        {/* Dedication */}
        <div className="p-3.5 rounded-2xl bg-[#193840]/60 border border-white/10 text-xs text-[#d1dfdb]/90 flex items-start gap-2.5">
          <InfoIcon size={18} className="text-[#f4b340] flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-white">Basket Benefactor:</strong> "The Honorable Chris Wilson has been so kind as to contribute the baskets for this dream!"
          </p>
        </div>
      </div>

      {/* 3 Physical Baskets Architecture */}
      <div className="bg-[#132d34] border border-[#f6eedb]/15 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <BasketIcon size={18} className="text-emerald-400" />
          <h2 className="text-base font-extrabold text-[#f6eedb]">
            The 3 Baskets Layout Architecture
          </h2>
        </div>
        <p className="text-xs text-[#d1dfdb]/70">
          How 9 unique holes are played across 3 target baskets:
        </p>

        <div className="flex flex-col gap-2.5 mt-1">
          {courseData.baskets.map((b) => (
            <div
              key={b.basketNumber}
              className="p-3.5 rounded-2xl bg-[#0c1f24] border border-white/5 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: b.color }}
                  />
                  <span className="font-extrabold text-sm text-[#f6eedb]">{b.name}</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">{b.model}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-extrabold uppercase text-neutral-400">Holes</span>
                <p className="font-black text-sm text-emerald-400">
                  {b.servesHoles.map((h) => `#${h}`).join(' • ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Specs Overview */}
      <div className="bg-[#132d34] border border-[#f6eedb]/15 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
        <h2 className="text-base font-extrabold text-[#f6eedb]">Course Specs</h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-[#0c1f24] border border-white/5">
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Total Par</span>
            <span className="text-lg font-black text-white">{courseData.totalPar}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0c1f24] border border-white/5">
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Total Feet</span>
            <span className="text-lg font-black text-white">{courseData.totalDistanceFt} ft</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0c1f24] border border-white/5">
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Tee Pads</span>
            <span className="text-lg font-black text-white">Grass (Natural)</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0c1f24] border border-white/5">
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Targets</span>
            <span className="text-lg font-black text-emerald-400">Axiom Lite (Green)</span>
          </div>
        </div>
      </div>

      {/* Discard / Reset Round */}
      <div className="pt-2 text-center">
        <button
          onClick={handleClear}
          className="text-xs text-rose-400/80 hover:text-rose-300 underline font-medium p-2 transition-colors"
        >
          Discard Active Round &amp; Reset Card
        </button>
      </div>
    </div>
  );
};
