import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Round } from '../types';
import { CloseIcon, ShareIcon, CheckIcon, UsersIcon } from './Icons';

interface ShareRoomModalProps {
  round: Round;
  onClose: () => void;
}

export const ShareRoomModal: React.FC<ShareRoomModalProps> = ({ round, onClose }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?room=${round.roomCode}`
      : `https://sore-sacks.local?room=${round.roomCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#132d34] border border-[#f6eedb]/20 rounded-3xl w-full max-w-sm flex flex-col items-center p-6 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center hover:bg-neutral-700 transition-colors"
        >
          <CloseIcon size={16} />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#ea5826]/20 text-[#ea5826] border border-[#ea5826]/30 flex items-center justify-center mb-3">
          <ShareIcon size={24} />
        </div>

        <h2 className="text-xl font-black text-[#f6eedb]">Sync Card Across Phones</h2>
        <p className="text-xs text-[#d1dfdb]/70 mt-1">
          Have friends scan this QR code or enter the room code to keep scores in sync in real time.
        </p>

        {/* Big Room Code Display */}
        <div className="my-4 px-6 py-2.5 rounded-2xl bg-[#0c1f24] border border-white/10 flex flex-col items-center">
          <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">
            Card Room Code
          </span>
          <span className="text-3xl font-black tracking-widest text-[#f4b340]">
            {round.roomCode}
          </span>
        </div>

        {/* QR Code Container */}
        <div className="p-3 bg-white rounded-2xl shadow-xl my-1">
          <QRCodeSVG value={shareUrl} size={160} level="M" />
        </div>

        {/* Active Card Players */}
        <div className="flex items-center gap-1.5 text-xs text-[#d1dfdb]/80 mt-4 mb-2">
          <UsersIcon size={14} className="text-emerald-400" />
          <span>
            {round.players.length} Player{round.players.length > 1 ? 's' : ''} on this Card
          </span>
        </div>

        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          className="w-full mt-2 py-3 rounded-2xl bg-[#193840] hover:bg-[#1f434c] text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition-colors shadow-md"
        >
          {copied ? <CheckIcon size={16} className="text-emerald-400" /> : <ShareIcon size={16} />}
          <span>{copied ? 'Card Link Copied!' : 'Copy Invite Link'}</span>
        </button>
      </div>
    </div>
  );
};
