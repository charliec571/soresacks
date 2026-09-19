import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CloseIcon, VolumeIcon, VolumeMuteIcon, TrophyIcon } from './Icons';
import { gameAudio } from '../utils/miniGameAudio';

interface DiscGolfMiniGameProps {
  onClose: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

interface ChainLink {
  baseX: number;
  topY: number;
  bottomY: number;
  offsetX: number;
  vx: number;
}

type GameMode = 'putting' | 'acerun';

const HIGH_SCORE_KEY = 'ss6p_minigame_high_streak';
const ACE_RECORD_KEY = 'ss6p_minigame_aces';

export const DiscGolfMiniGame: React.FC<DiscGolfMiniGameProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game state
  const [mode, setMode] = useState<GameMode>('putting');
  const [distanceFt, setDistanceFt] = useState<number>(15);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highStreak, setHighStreak] = useState<number>(0);
  const [acesCount, setAcesCount] = useState<number>(0);
  const [strikesLeft, setStrikesLeft] = useState<number>(3);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('Swipe up to flick into the chains!');
  const [messageColor, setMessageColor] = useState<string>('text-emerald-400');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [windMph, setWindMph] = useState<number>(0); // negative = left, positive = right

  // Input tracking
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const dragCurrentRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Physics state
  const discStateRef = useRef<{
    active: boolean;
    x: number;
    y: number;
    z: number; // 0 = at hand, 1 = at basket
    vx: number;
    vy: number;
    vz: number;
    rotation: number;
    scale: number;
    fadeAcc: number;
    result: 'pending' | 'make' | 'band' | 'cage' | 'miss' | 'dropped';
  }>({
    active: false,
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    rotation: 0,
    scale: 1,
    fadeAcc: 0,
    result: 'pending'
  });

  const particlesRef = useRef<Particle[]>([]);
  const chainsRef = useRef<ChainLink[]>([]);
  const animationFrameRef = useRef<number>(0);

  // Initialize high scores from storage
  useEffect(() => {
    try {
      const savedHigh = localStorage.getItem(HIGH_SCORE_KEY);
      if (savedHigh) setHighStreak(parseInt(savedHigh, 10));
      const savedAces = localStorage.getItem(ACE_RECORD_KEY);
      if (savedAces) setAcesCount(parseInt(savedAces, 10));
    } catch {
      // safe fallback
    }
  }, []);

  // Generate wind based on distance
  const rollWind = useCallback((dist: number) => {
    if (dist <= 15) {
      setWindMph(0);
    } else if (dist <= 30) {
      const w = Math.round((Math.random() * 4 - 2) * 10) / 10;
      setWindMph(w);
    } else {
      const w = Math.round((Math.random() * 10 - 5) * 10) / 10;
      setWindMph(w);
    }
  }, []);

  // Setup chains geometry
  const initChains = useCallback((basketX: number, topY: number, bottomY: number, count: number) => {
    const chains: ChainLink[] = [];
    const width = 54;
    for (let i = 0; i < count; i++) {
      const ratio = (i - (count - 1) / 2) / ((count - 1) / 2);
      chains.push({
        baseX: basketX + ratio * (width / 2),
        topY,
        bottomY,
        offsetX: 0,
        vx: 0
      });
    }
    chainsRef.current = chains;
  }, []);

  // Spawn confetti / spark particles
  const spawnParticles = (x: number, y: number, color: string, count: number = 24) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color,
        size: Math.random() * 5 + 3,
        alpha: 1,
        life: 1
      });
    }
  };

  // Reset for next throw
  const resetDisc = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    discStateRef.current = {
      active: false,
      x: canvas.width / 2,
      y: canvas.height - 85,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      rotation: 0,
      scale: 1,
      fadeAcc: 0,
      result: 'pending'
    };
  }, []);

  // Start / restart game
  const handleStartGame = useCallback((chosenMode: GameMode = mode) => {
    setMode(chosenMode);
    setScore(0);
    setStreak(0);
    setStrikesLeft(3);
    setIsGameOver(false);
    const initialDist = chosenMode === 'acerun' ? 165 : 15;
    setDistanceFt(initialDist);
    rollWind(initialDist);
    setMessage(chosenMode === 'acerun' ? '165 FT ACE RUN: Account for wind and fade!' : 'Swipe up to flick into the chains!');
    setMessageColor('text-emerald-400');
    resetDisc();
  }, [mode, rollWind, resetDisc]);

  // Main Canvas Setup & Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      resetDisc();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resetDisc]);

  // Handle successful putt
  const handleMake = useCallback(() => {
    gameAudio.playChainRattle();
    const newStreak = streak + 1;
    setStreak(newStreak);
    setScore((s) => s + (mode === 'acerun' ? 500 : 100 * (1 + Math.floor(newStreak / 3))));

    if (newStreak > highStreak) {
      setHighStreak(newStreak);
      try {
        localStorage.setItem(HIGH_SCORE_KEY, newStreak.toString());
      } catch {
        // safe
      }
    }

    if (mode === 'acerun') {
      const newAces = acesCount + 1;
      setAcesCount(newAces);
      try {
        localStorage.setItem(ACE_RECORD_KEY, newAces.toString());
      } catch {
        // safe
      }
      setMessage('🔥 HOLE IN ONE! ACE CRUSHED! 🔥');
      setMessageColor('text-amber-300 font-black');
      gameAudio.playCheerChime();
    } else {
      if (newStreak >= 3) {
        setMessage(`🔥 CHAINS! ${newStreak} IN A ROW! 🔥`);
        setMessageColor('text-amber-400 font-black');
        gameAudio.playCheerChime();
      } else {
        setMessage('🎯 CHAINS! Sunk it!');
        setMessageColor('text-emerald-400 font-black');
      }

      // Step back distance on makes
      const nextDist = newStreak === 1 ? 25 : newStreak === 2 ? 35 : newStreak === 3 ? 45 : 60;
      setDistanceFt(nextDist);
      rollWind(nextDist);
    }

    setTimeout(() => {
      resetDisc();
    }, 1200);
  }, [streak, highStreak, mode, acesCount, rollWind, resetDisc]);

  // Handle missed putt
  const handleMiss = useCallback((reason: string) => {
    gameAudio.playMiss();
    setStreak(0);
    const nextStrikes = strikesLeft - 1;
    setStrikesLeft(nextStrikes);

    setMessage(reason);
    setMessageColor('text-rose-400 font-black');

    if (nextStrikes <= 0) {
      setIsGameOver(true);
      setMessage(`Game Over! Final Streak: ${streak}`);
    } else {
      setTimeout(() => {
        resetDisc();
      }, 1200);
    }
  }, [strikesLeft, streak, resetDisc]);

  // Input events: Touch & Mouse
  const handlePointerDown = (clientX: number, clientY: number) => {
    if (discStateRef.current.active || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = (clientX - rect.left) * dpr;
    const y = (clientY - rect.top) * dpr;

    // Check if touch is in the bottom throw area
    if (y > canvas.height * 0.65) {
      isDraggingRef.current = true;
      dragStartRef.current = { x, y, time: performance.now() };
      dragCurrentRef.current = { x, y };
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    dragCurrentRef.current = {
      x: (clientX - rect.left) * dpr,
      y: (clientY - rect.top) * dpr
    };
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current || !dragStartRef.current || !dragCurrentRef.current) {
      isDraggingRef.current = false;
      return;
    }
    isDraggingRef.current = false;

    const start = dragStartRef.current;
    const end = dragCurrentRef.current;
    const timeDelta = Math.max(30, performance.now() - start.time);

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // Must swipe upward
    if (dy >= -20) {
      return;
    }

    const flickSpeed = Math.sqrt(dx * dx + dy * dy) / timeDelta;
    if (flickSpeed < 0.25) return; // ignore tiny taps

    gameAudio.playWhoosh();

    // Calculate throw physics
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Trajectory calculations
    const horizontalAngle = dx / 140; // horizontal deviation
    const throwPower = Math.min(1.7, Math.max(0.65, flickSpeed * 0.95));

    // Target z velocity
    const targetVz = 0.024 * throwPower * (15 / distanceFt);

    discStateRef.current = {
      active: true,
      x: canvas.width / 2,
      y: canvas.height - 85,
      z: 0,
      vx: horizontalAngle * 3.5,
      vy: (dy / timeDelta) * 4.5,
      vz: targetVz,
      rotation: 0,
      scale: 1,
      fadeAcc: mode === 'acerun' ? 0.08 : 0.015,
      result: 'pending'
    };
  };

  // Game Loop: Render & Physics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Backyard Environment Background
      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.65);
      skyGrad.addColorStop(0, '#0c1b29');
      skyGrad.addColorStop(0.6, '#1e3a47');
      skyGrad.addColorStop(1, '#f97316');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height * 0.65);

      // Sunset / Sun glow behind trees
      const sunGrad = ctx.createRadialGradient(width * 0.5, height * 0.45, 10, width * 0.5, height * 0.45, 180);
      sunGrad.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
      sunGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.2)');
      sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, width, height * 0.65);

      // Tree silhouettes in background
      ctx.fillStyle = '#061019';
      for (let i = 0; i < width + 80; i += 60) {
        ctx.beginPath();
        const treeH = height * 0.25 + Math.sin(i * 0.05) * 35;
        ctx.arc(i, height * 0.56 - treeH * 0.5, treeH * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wooden backyard fence line
      ctx.fillStyle = '#1c1512';
      ctx.fillRect(0, height * 0.53, width, 18);
      ctx.strokeStyle = '#2d221c';
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x += 22) {
        ctx.strokeRect(x, height * 0.51, 20, 26);
      }

      // Backyard Grass Fairway
      const grassGrad = ctx.createLinearGradient(0, height * 0.54, 0, height);
      grassGrad.addColorStop(0, '#064e3b');
      grassGrad.addColorStop(0.4, '#047857');
      grassGrad.addColorStop(1, '#065f46');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, height * 0.54, width, height * 0.46);

      // Distance markers on the lawn
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      const markerY = height * 0.72;
      ctx.fillText(`— TEE PAD (${distanceFt} FT) —`, width / 2, markerY);

      // Backyard picnic cooler with beer can to the side
      const coolerX = width * 0.15;
      const coolerY = height * 0.76;
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(coolerX, coolerY, 44, 28);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(coolerX - 2, coolerY - 4, 48, 6);
      // Beer can
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(coolerX + 16, coolerY - 18, 12, 16);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(coolerX + 16, coolerY - 20, 12, 3);

      // 2. Basket Sizing & Positioning based on distanceFt
      // Perspective scale factor
      const distRatio = Math.max(0.22, 15 / distanceFt);
      const basketScale = distRatio * (mode === 'acerun' ? 0.35 : 1);
      const basketX = width / 2;
      const basketY = height * 0.54 - (1 - basketScale) * 30;

      const basketBandWidth = 72 * basketScale;
      const basketBandHeight = 16 * basketScale;
      const chainTopY = basketY - 70 * basketScale;
      const chainBottomY = basketY - 14 * basketScale;
      const cageWidth = 78 * basketScale;
      const cageHeight = 32 * basketScale;

      // Update chain links geometry if needed
      if (chainsRef.current.length === 0 || Math.abs(chainsRef.current[0].baseX - (basketX - basketBandWidth / 2)) > 5) {
        initChains(basketX, chainTopY, chainBottomY, 14);
      }

      // Draw Basket Pole & Base
      ctx.fillStyle = '#64748b';
      ctx.fillRect(basketX - 3 * basketScale, chainTopY, 6 * basketScale, 110 * basketScale);
      // Base stand
      ctx.beginPath();
      ctx.ellipse(basketX, chainTopY + 108 * basketScale, 28 * basketScale, 6 * basketScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw Yellow / Amber Axiom Basket Band
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(basketX - basketBandWidth / 2, chainTopY - basketBandHeight, basketBandWidth, basketBandHeight);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(basketX - basketBandWidth / 2, chainTopY - basketBandHeight, basketBandWidth, basketBandHeight);

      // Band highlight & text
      ctx.fillStyle = '#ffffff';
      ctx.font = `black ${Math.max(7, Math.round(9 * basketScale))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('AXIOM', basketX, chainTopY - 4 * basketScale);

      // Draw Metal Chains (Animated with sway & physics)
      chainsRef.current.forEach((chain) => {
        // Apply spring damping
        chain.vx += -chain.offsetX * 18 * dt;
        chain.vx *= Math.pow(0.92, dt * 60);
        chain.offsetX += chain.vx * dt;

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = Math.max(1.5, 2.5 * basketScale);
        ctx.beginPath();
        ctx.moveTo(chain.baseX, chain.topY);
        // Hanging curve toward center
        const midY = (chain.topY + chain.bottomY) / 2;
        const midX = (chain.baseX + basketX) / 2 + chain.offsetX;
        ctx.quadraticCurveTo(midX, midY, basketX + chain.offsetX * 0.4, chain.bottomY);
        ctx.stroke();
      });

      // Draw Lower Basket Cage
      ctx.fillStyle = '#334155';
      ctx.fillRect(basketX - cageWidth / 2, chainBottomY, cageWidth, cageHeight);
      // Cage vertical metal ribs
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = Math.max(1, 1.8 * basketScale);
      for (let rx = -cageWidth / 2 + 6 * basketScale; rx <= cageWidth / 2 - 6 * basketScale; rx += 10 * basketScale) {
        ctx.beginPath();
        ctx.moveTo(basketX + rx, chainBottomY);
        ctx.lineTo(basketX + rx, chainBottomY + cageHeight);
        ctx.stroke();
      }
      // Cage top rim ring
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = Math.max(2, 3 * basketScale);
      ctx.strokeRect(basketX - cageWidth / 2, chainBottomY, cageWidth, 2);

      // 3. Update & Draw Particles (Sparks / Confetti)
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.alpha -= 0.02;
        if (p.alpha <= 0) {
          particlesRef.current.splice(idx, 1);
          return;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // 4. Update Disc Flight Physics
      const disc = discStateRef.current;
      if (disc.active) {
        disc.z += disc.vz * dt * 60;
        disc.rotation += 0.25;

        // Apply wind drift
        disc.x += windMph * 1.8 * dt * 60;

        // Apply late low-speed fade (hyzer curve)
        if (disc.z > 0.4) {
          disc.x -= disc.fadeAcc * (disc.z - 0.4) * 8;
        }

        // Scale perspective
        disc.scale = Math.max(0.18, 1 - disc.z * 0.78);
        disc.y += disc.vy * dt * 60;
        disc.vy += 0.18 * dt * 60; // gravity

        // Target reached (Z >= 1.0) -> Evaluate Collision
        if (disc.z >= 0.95 && disc.result === 'pending') {
          const dx = disc.x - basketX;
          const dy = disc.y - (chainTopY + (chainBottomY - chainTopY) / 2);

          // 1. Center chains strike!
          if (Math.abs(dx) <= (basketBandWidth / 2) * 0.85 && disc.y >= chainTopY && disc.y <= chainBottomY + 8) {
            disc.result = 'make';
            disc.vx = 0;
            disc.vy = 2; // drop into basket
            // Excite chains
            chainsRef.current.forEach((c) => {
              c.vx = (Math.random() - 0.5) * 120;
            });
            spawnParticles(basketX, (chainTopY + chainBottomY) / 2, '#fbbf24', 30);
            handleMake();
          }
          // 2. High Band Hit
          else if (Math.abs(dx) <= basketBandWidth / 2 + 4 && disc.y < chainTopY && disc.y >= chainTopY - basketBandHeight - 8) {
            disc.result = 'band';
            disc.vy = -3;
            disc.vx = dx > 0 ? 3 : -3;
            gameAudio.playCageClink();
            spawnParticles(disc.x, disc.y, '#f59e0b', 12);
            handleMiss('⚠️ Clank! Hit high off the band!');
          }
          // 3. Lower Cage Clank
          else if (Math.abs(dx) <= cageWidth / 2 + 4 && disc.y > chainBottomY && disc.y <= chainBottomY + cageHeight + 10) {
            disc.result = 'cage';
            disc.vy = -1.5;
            disc.vx = dx > 0 ? 2 : -2;
            gameAudio.playCageClink();
            spawnParticles(disc.x, disc.y, '#94a3b8', 12);
            handleMiss('⚠️ Clang! Off the front cage rim!');
          }
          // 4. Clean Miss
          else {
            disc.result = 'miss';
            const missReason = dx < 0 ? '💨 Blown wide left!' : dx > 0 ? '💨 Missed right!' : '💨 Over the top!';
            handleMiss(missReason);
          }
        }

        // Keep dropping into tray if made
        if (disc.result === 'make' && disc.y < chainBottomY + 12) {
          disc.y += 2.5;
        }

        // End flight if fallen off screen
        if (disc.y > height + 80 || disc.x < -80 || disc.x > width + 80) {
          disc.active = false;
        }
      }

      // 5. Draw Disc (MVP/Axiom 2-Tone Gyro Disc)
      const currentDiscX = disc.active ? disc.x : width / 2;
      const currentDiscY = disc.active ? disc.y : height - 85;
      const currentScale = disc.active ? disc.scale : 1;

      ctx.save();
      ctx.translate(currentDiscX, currentDiscY);
      ctx.rotate(disc.rotation);

      const discRadius = 36 * currentScale;

      // Disc Shadow on lawn
      ctx.save();
      ctx.scale(1, 0.4);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.arc(0, (height - currentDiscY) * 0.35 + 20, discRadius * 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Outer Overmold Rim (Axiom Bright Orange)
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(0, 0, discRadius, 0, Math.PI * 2);
      ctx.fill();

      // Inner Flight Plate (Vivid Cyan/Teal)
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(0, 0, discRadius * 0.78, 0, Math.PI * 2);
      ctx.fill();

      // Hot Stamp Foil
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, discRadius * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = `black ${Math.max(6, Math.round(9 * currentScale))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(mode === 'acerun' ? 'CRAVE' : 'ENVY', 0, 0);

      ctx.restore();

      // 6. Draw Aim / Flick Drag Arrow Preview
      if (isDraggingRef.current && dragStartRef.current && dragCurrentRef.current) {
        const start = dragStartRef.current;
        const curr = dragCurrentRef.current;
        const dx = curr.x - start.x;
        const dy = curr.y - start.y;

        // Inverted pull arrow or direct swipe arrow
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(width / 2, height - 85);
        ctx.lineTo(width / 2 + dx * 0.8, height - 85 + dy * 0.8);
        ctx.stroke();

        // Arrow head
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(width / 2 + dx * 0.8, height - 85 + dy * 0.8, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [distanceFt, mode, windMph, handleMake, handleMiss, initChains]);

  return (
    <div className="fixed inset-0 z-[2500] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center select-none animate-fade-in overflow-hidden">
      {/* Top HUD Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3.5 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black shadow-lg">
            ⛳️
          </div>
          <div>
            <h2 className="text-sm font-black text-white leading-none">
              Backyard Chains
            </h2>
            <p className="text-[10px] text-amber-300 font-extrabold mt-0.5">
              {mode === 'putting' ? `Putting Challenge • ${distanceFt} FT` : '165 FT Ace Run'}
            </p>
          </div>
        </div>

        {/* Action Controls: Sound Mute & Close */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = !isMuted;
              setIsMuted(next);
              gameAudio.isMuted = next;
            }}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 flex items-center justify-center transition-colors shadow"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeMuteIcon size={18} /> : <VolumeIcon size={18} />}
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shadow"
            title="Exit Mini-Game"
          >
            <CloseIcon size={20} />
          </button>
        </div>
      </div>

      {/* Status Badges Overlay (Streak, Wind, Lives) */}
      <div className="absolute top-16 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Streak & High Score */}
        <div className="flex flex-col gap-1">
          <div className="px-3 py-1.5 rounded-2xl bg-[#111827]/90 border border-white/15 backdrop-blur-md shadow-lg flex items-center gap-2">
            <span className="text-base font-black text-amber-400">🔥 {streak}</span>
            <span className="text-[10px] uppercase font-black text-neutral-300">Streak</span>
            {highStreak > 0 && (
              <span className="text-[9px] font-bold text-neutral-400 pl-1 border-l border-white/10">
                Best: <strong className="text-white">{highStreak}</strong>
              </span>
            )}
          </div>

          {mode === 'acerun' && acesCount > 0 && (
            <div className="px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[10px] font-black">
              🏆 Total Aces: {acesCount}
            </div>
          )}
        </div>

        {/* Center: Live Feedback Message */}
        <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-black shadow-md text-center max-w-[200px] truncate">
          <span className={messageColor}>{message}</span>
        </div>

        {/* Right: Wind & Strikes */}
        <div className="flex flex-col items-end gap-1">
          {/* Strikes / Lives remaining */}
          <div className="flex items-center gap-1 bg-[#111827]/90 border border-white/15 px-2.5 py-1.5 rounded-2xl backdrop-blur-md shadow-lg">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`text-xs transition-opacity ${
                  i <= strikesLeft ? 'opacity-100' : 'opacity-20 grayscale'
                }`}
              >
                🥏
              </span>
            ))}
          </div>

          {/* Wind indicator */}
          <div className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-[10px] font-extrabold text-teal-300 backdrop-blur-md flex items-center gap-1">
            <span>💨</span>
            <span>
              {windMph === 0
                ? 'Calm'
                : windMph < 0
                ? `${Math.abs(windMph)} mph ⬅`
                : `${windMph} mph ➡`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
        onTouchStart={(e) => {
          if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Bottom Mode Switcher Bar */}
      <div className="absolute bottom-4 z-20 flex items-center gap-2 bg-[#111827]/95 border border-white/15 rounded-2xl p-1.5 shadow-2xl backdrop-blur-lg">
        <button
          onClick={() => handleStartGame('putting')}
          className={`py-2 px-3.5 rounded-xl text-xs font-black transition-all ${
            mode === 'putting'
              ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/25'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Putting Challenge
        </button>
        <button
          onClick={() => handleStartGame('acerun')}
          className={`py-2 px-3.5 rounded-xl text-xs font-black transition-all ${
            mode === 'acerun'
              ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/25'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          165ft Ace Run
        </button>
      </div>

      {/* Game Over Modal Screen */}
      {isGameOver && (
        <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#111827] border border-white/15 rounded-3xl p-6 max-w-xs w-full text-center flex flex-col gap-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center text-2xl font-black mx-auto shadow-xl shadow-amber-400/20">
              <TrophyIcon size={28} />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">Round Complete!</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Sore Sacks Backyard Challenge</p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-[#090d16] p-3 rounded-2xl border border-white/5">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-neutral-500">Streak</span>
                <p className="text-2xl font-black text-amber-400">{streak}</p>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-neutral-500">Best</span>
                <p className="text-2xl font-black text-emerald-400">{highStreak}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => handleStartGame(mode)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-sm shadow-xl shadow-emerald-950/40 border border-emerald-400 transition-transform active:scale-95"
              >
                Play Again
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold text-xs transition-colors"
              >
                Exit to Scorecard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
