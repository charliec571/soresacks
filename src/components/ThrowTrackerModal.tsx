import React, { useState, useEffect, useRef } from 'react';
import { Round, GPSCoord, MeasuredThrow } from '../types';
import { courseData } from '../data/courseData';
import { CloseIcon, NavigationIcon, CheckIcon, DiscIcon } from './Icons';

interface ThrowTrackerModalProps {
  round: Round;
  currentHoleNumber: number;
  onClose: () => void;
  onSaveThrow: (measuredThrow: MeasuredThrow) => void;
}

function calculateDistanceFt(c1: GPSCoord, c2: GPSCoord): number {
  const R = 6371e3;
  const phi1 = (c1.lat * Math.PI) / 180;
  const phi2 = (c2.lat * Math.PI) / 180;
  const deltaPhi = ((c2.lat - c1.lat) * Math.PI) / 180;
  const deltaLambda = ((c2.lng - c1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 3.28084);
}

const COMMON_DISCS = ['Crave', 'Buzzz', 'Destroyer', 'Envy', 'Zone', 'Firebird', 'Wraith', 'Hex'];

export const ThrowTrackerModal: React.FC<ThrowTrackerModalProps> = ({
  round,
  currentHoleNumber,
  onClose,
  onSaveThrow
}) => {
  const hole = courseData.holes.find((h) => h.number === currentHoleNumber) || courseData.holes[0];

  // Starting location defaults to the official hole tee coordinates
  const [startPoint, setStartPoint] = useState<GPSCoord>({
    lat: hole.tee.lat,
    lng: hole.tee.lng
  });
  const [startPointType, setStartPointType] = useState<'tee' | 'custom'>('tee');

  const [currentLocation, setCurrentLocation] = useState<GPSCoord | null>(null);
  const [currentDistanceFt, setCurrentDistanceFt] = useState<number>(0);
  const [gpsAccuracyFt, setGpsAccuracyFt] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Throw metadata
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    round.players[0]?.id || ''
  );
  const [selectedDisc, setSelectedDisc] = useState<string>('');
  const [customDisc, setCustomDisc] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const watchIdRef = useRef<number | null>(null);

  // Start GPS tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coord: GPSCoord = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setCurrentLocation(coord);
        setGpsAccuracyFt(Math.round(pos.coords.accuracy * 3.28084));

        const dist = calculateDistanceFt(startPoint, coord);
        setCurrentDistanceFt(dist);
      },
      (err) => {
        console.warn('GPS watch error:', err);
        setGpsError('Could not acquire GPS location. Ensure location permissions are allowed.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [startPoint]);

  const handleResetStartToHere = () => {
    if (currentLocation) {
      setStartPoint(currentLocation);
      setStartPointType('custom');
      setCurrentDistanceFt(0);
    }
  };

  const handleResetStartToTee = () => {
    setStartPoint({ lat: hole.tee.lat, lng: hole.tee.lng });
    setStartPointType('tee');
    if (currentLocation) {
      setCurrentDistanceFt(
        calculateDistanceFt({ lat: hole.tee.lat, lng: hole.tee.lng }, currentLocation)
      );
    }
  };

  const handleSave = () => {
    if (!currentLocation) return;

    const player = round.players.find((p) => p.id === selectedPlayerId) || round.players[0];
    const discName = customDisc.trim() || selectedDisc || undefined;

    const measured: MeasuredThrow = {
      id: 'throw_' + Date.now(),
      playerId: player.id,
      playerName: player.name,
      holeNumber: currentHoleNumber,
      distanceFt: currentDistanceFt,
      discName,
      startCoord: startPoint,
      endCoord: currentLocation,
      createdAt: Date.now()
    };

    onSaveThrow(measured);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[2200] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-[#111827] border border-white/15 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-black shadow">
              <DiscIcon size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">
                Measure Drive Distance
              </h2>
              <p className="text-[11px] text-neutral-400 font-bold">
                Hole {hole.number} • Par {hole.par} • {hole.distanceFt} ft
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

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* Main Giant Distance Display */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#090d16] via-[#111827] to-[#090d16] border border-emerald-500/30 p-6 flex flex-col items-center justify-center shadow-inner">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-emerald-400 tracking-tight drop-shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
                {currentDistanceFt}
              </span>
              <span className="text-2xl font-black text-neutral-300">ft</span>
            </div>

            <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5 font-bold">
              <NavigationIcon size={14} className="text-emerald-400 animate-pulse" />
              <span>
                From {startPointType === 'tee' ? `Tee ${hole.number}` : 'Custom Start'}
              </span>
            </p>

            {gpsAccuracyFt !== null && (
              <div className="mt-2 text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 text-neutral-400 border border-white/10">
                GPS Accuracy: ±{gpsAccuracyFt} ft
              </div>
            )}
          </div>

          {gpsError && (
            <div className="p-2.5 rounded-xl bg-rose-900/40 border border-rose-500/50 text-rose-200 text-xs font-semibold">
              {gpsError}
            </div>
          )}

          {/* Starting Position Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetStartToTee}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                startPointType === 'tee'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-white/5 text-neutral-400 border-white/5 hover:text-white'
              }`}
            >
              Start at Tee Pad
            </button>
            <button
              onClick={handleResetStartToHere}
              disabled={!currentLocation}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                startPointType === 'custom'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-white/5 text-neutral-400 border-white/5 hover:text-white'
              }`}
            >
              Set Start to Current Spot
            </button>
          </div>

          {/* Player Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold text-neutral-300">Who Threw?</label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {round.players.map((p) => {
                const isSelected = p.id === selectedPlayerId;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayerId(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all flex-shrink-0 ${
                      isSelected
                        ? 'bg-white/15 text-white border-white/30 shadow'
                        : 'bg-white/5 text-neutral-400 border-white/5 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Disc Selection / Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold text-neutral-300">
              Disc Thrown (Optional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_DISCS.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setSelectedDisc(selectedDisc === d ? '' : d);
                    setCustomDisc('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    selectedDisc === d
                      ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-black'
                      : 'bg-white/5 text-neutral-300 border-white/5 hover:bg-white/10'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Or type disc name (e.g. Leopard3)..."
              value={customDisc}
              onChange={(e) => {
                setCustomDisc(e.target.value);
                setSelectedDisc('');
              }}
              className="mt-1 bg-[#090d16] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={isSaved}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black text-sm shadow-xl shadow-emerald-950/40 border border-emerald-400 flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              {isSaved ? (
                <>
                  <CheckIcon size={18} />
                  <span>Throw Saved!</span>
                </>
              ) : (
                <span>Save Drive ({currentDistanceFt} ft)</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
