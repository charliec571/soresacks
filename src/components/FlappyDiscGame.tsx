import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CloseIcon, VolumeIcon, VolumeMuteIcon, TrophyIcon } from './Icons';
import { flappyAudio } from '../utils/flappyAudio';

interface FlappyDiscGameProps {
  onClose: () => void;
}

interface TreeObstacle {
  x: number;
  topHeight: number;
  bottomY: number;
  width: number;
  passed: boolean;
}

interface Confetti {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotSpeed: number;
  alpha: number;
}

const BEST_DISTANCE_KEY = 'ss6p_flappy_best_dist';
const TOTAL_ACES_KEY = 'ss6p_flappy_aces';
const COURSE_DISTANCE = 350; // Total distance in feet

export const FlappyDiscGame: React.FC<FlappyDiscGameProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game UI state
  const [distanceRemaining, setDistanceRemaining] = useState<number>(COURSE_DISTANCE);
  const [bestDistance, setBestDistance] = useState<number>(0);
  const [totalAces, setTotalAces] = useState<number>(0);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover' | 'ace'>('ready');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Physics & Game state refs (for smooth 60fps loop)
  const gameRef = useRef<{
    discX: number;
    discY: number;
    vy: number;
    angle: number;
    spin: number;
    distanceRemaining: number;
    speed: number;
    trees: TreeObstacle[];
    basket: { active: boolean; x: number; y: number; caught: boolean } | null;
    particles: Confetti[];
    trail: { x: number; y: number; alpha: number }[];
    groundOffset: number;
    cloudOffset: number;
    screenShake: number;
  }>({
    discX: 90,
    discY: 250,
    vy: 0,
    angle: 0,
    spin: 0,
    distanceRemaining: COURSE_DISTANCE,
    speed: 3.2,
    trees: [],
    basket: null,
    particles: [],
    trail: [],
    groundOffset: 0,
    cloudOffset: 0,
    screenShake: 0
  });

  const animationFrameRef = useRef<number>(0);

  // Load records
  useEffect(() => {
    try {
      const savedDist = localStorage.getItem(BEST_DISTANCE_KEY);
      if (savedDist) setBestDistance(parseInt(savedDist, 10));
      const savedAces = localStorage.getItem(TOTAL_ACES_KEY);
      if (savedAces) setTotalAces(parseInt(savedAces, 10));
    } catch {
      // safe fallback
    }
  }, []);

  // Reset / Start Game
  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    gameRef.current = {
      discX: canvas.width * 0.25,
      discY: canvas.height * 0.45,
      vy: -3.5,
      angle: 0,
      spin: 0,
      distanceRemaining: COURSE_DISTANCE,
      speed: 3.4,
      trees: [],
      basket: null,
      particles: [],
      trail: [],
      groundOffset: 0,
      cloudOffset: 0,
      screenShake: 0
    };

    setDistanceRemaining(COURSE_DISTANCE);
    setGameState('playing');
    flappyAudio.playFlap();
  }, []);

  // Flap / Boost
  const handleFlap = useCallback(() => {
    if (gameState === 'ready') {
      startGame();
      return;
    }
    if (gameState === 'playing') {
      gameRef.current.vy = -6.8;
      flappyAudio.playFlap();
    }
  }, [gameState, startGame]);

  // Handle keyboard (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlap]);

  // Spawn confetti particles on Ace
  const spawnAceConfetti = (x: number, y: number) => {
    const colors = ['#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6', '#ffffff'];
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      gameRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 4,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        alpha: 1
      });
    }
  };

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive canvas setup
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      if (gameState === 'ready') {
        gameRef.current.discX = canvas.width * 0.25;
        gameRef.current.discY = canvas.height * 0.45;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    let lastTime = performance.now();
    let treeSpawnTimer = 0;

    const loop = (time: number) => {
      const dt = Math.min(0.04, (time - lastTime) / 1000);
      lastTime = time;

      const width = canvas.width;
      const height = canvas.height;
      const game = gameRef.current;

      ctx.save();

      // Screen Shake on collision
      if (game.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * game.screenShake * 12;
        const shakeY = (Math.random() - 0.5) * game.screenShake * 12;
        ctx.translate(shakeX, shakeY);
        game.screenShake = Math.max(0, game.screenShake - dt * 4);
      }

      // 1. Parallax Sky & Sunset Background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(0.4, '#1e293b');
      skyGrad.addColorStop(0.75, '#334155');
      skyGrad.addColorStop(1, '#064e3b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Clouds (slow parallax)
      game.cloudOffset = (game.cloudOffset + game.speed * 0.25) % (width + 200);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let c = -100; c < width + 200; c += 220) {
        const cx = (c - game.cloudOffset + width + 200) % (width + 200);
        ctx.beginPath();
        ctx.arc(cx, height * 0.2, 45, 0, Math.PI * 2);
        ctx.arc(cx + 35, height * 0.18, 55, 0, Math.PI * 2);
        ctx.arc(cx + 70, height * 0.2, 40, 0, Math.PI * 2);
        ctx.fill();
      }

      // Distant tree treeline silhouettes (medium parallax)
      ctx.fillStyle = '#061720';
      const groundY = height - 55;
      for (let tx = 0; tx < width + 60; tx += 45) {
        ctx.beginPath();
        ctx.arc(tx, groundY - 50, 35, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ground Fairway Lawn
      const grassGrad = ctx.createLinearGradient(0, groundY, 0, height);
      grassGrad.addColorStop(0, '#047857');
      grassGrad.addColorStop(1, '#064e3b');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, groundY, width, height - groundY);

      // Grass fence line (fast parallax)
      game.groundOffset = (game.groundOffset + game.speed) % 30;
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      for (let fx = -game.groundOffset; fx < width; fx += 24) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(fx, groundY - 14, 6, 14);
      }

      // 2. Game Logic & Tree Spawning
      if (gameState === 'playing') {
        // Update flight distance remaining
        game.distanceRemaining = Math.max(0, game.distanceRemaining - game.speed * dt * 5.2);
        setDistanceRemaining(Math.round(game.distanceRemaining));

        // Spawn trees while distance > 35 FT
        if (game.distanceRemaining > 35) {
          treeSpawnTimer += dt;
          if (treeSpawnTimer > 1.6) {
            treeSpawnTimer = 0;
            const gap = 165; // vertical flight window
            const minHeight = 60;
            const maxHeight = groundY - gap - minHeight;
            const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
            const bottomY = topHeight + gap;

            game.trees.push({
              x: width + 20,
              topHeight,
              bottomY,
              width: 58,
              passed: false
            });
          }
        } else if (!game.basket && game.distanceRemaining <= 30) {
          // Trees done! Spawn Axiom basket in clearing!
          game.basket = {
            active: true,
            x: width + 60,
            y: groundY - 85,
            caught: false
          };
        }

        // Disc Physics (Gravity & Tilt)
        game.vy += 0.38; // gravity
        game.discY += game.vy;
        game.spin += 0.35;
        // Tilt nose up when climbing, nose down when diving
        game.angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, game.vy * 0.08));

        // Vapor trail
        game.trail.unshift({ x: game.discX - 18, y: game.discY, alpha: 0.7 });
        if (game.trail.length > 8) game.trail.pop();

        // Floor / Ceiling bounds collision
        if (game.discY >= groundY - 10) {
          game.discY = groundY - 10;
          flappyAudio.playWoodHit();
          game.screenShake = 1;
          setGameState('gameover');
          const distFlown = COURSE_DISTANCE - Math.round(game.distanceRemaining);
          if (distFlown > bestDistance) {
            setBestDistance(distFlown);
            try { localStorage.setItem(BEST_DISTANCE_KEY, distFlown.toString()); } catch {}
          }
        }
        if (game.discY <= 15) {
          game.discY = 15;
          game.vy = 0;
        }
      }

      // 3. Move & Draw Trees
      const discR = 20; // collision radius
      for (let i = game.trees.length - 1; i >= 0; i--) {
        const tree = game.trees[i];
        if (gameState === 'playing') {
          tree.x -= game.speed;
        }

        // Draw Top Branch (hanging from top)
        ctx.fillStyle = '#1e1b18'; // Wood branch
        ctx.fillRect(tree.x + 8, 0, tree.width - 16, tree.topHeight);
        // Leafy canopy cluster
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(tree.x + tree.width / 2, tree.topHeight, 34, 0, Math.PI * 2);
        ctx.arc(tree.x + 12, tree.topHeight - 12, 26, 0, Math.PI * 2);
        ctx.arc(tree.x + tree.width - 12, tree.topHeight - 12, 26, 0, Math.PI * 2);
        ctx.fill();

        // Draw Bottom Trunk (rising from ground)
        ctx.fillStyle = '#292524'; // Bark trunk
        ctx.fillRect(tree.x + 8, tree.bottomY, tree.width - 16, groundY - tree.bottomY);
        // Leafy bush around gap entrance
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(tree.x + tree.width / 2, tree.bottomY, 32, 0, Math.PI * 2);
        ctx.fill();

        // Tree wood detail lines
        ctx.strokeStyle = '#44403c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tree.x + 20, tree.bottomY + 15);
        ctx.lineTo(tree.x + 20, groundY);
        ctx.stroke();

        // Collision Check with Disc
        if (gameState === 'playing') {
          const inTreeX = game.discX + discR > tree.x && game.discX - discR < tree.x + tree.width;
          const hitTop = game.discY - discR < tree.topHeight;
          const hitBottom = game.discY + discR > tree.bottomY;

          if (inTreeX && (hitTop || hitBottom)) {
            flappyAudio.playWoodHit();
            game.screenShake = 1.2;
            setGameState('gameover');
            const distFlown = COURSE_DISTANCE - Math.round(game.distanceRemaining);
            if (distFlown > bestDistance) {
              setBestDistance(distFlown);
              try { localStorage.setItem(BEST_DISTANCE_KEY, distFlown.toString()); } catch {}
            }
          }
        }

        // Remove offscreen trees
        if (tree.x + tree.width < -40) {
          game.trees.splice(i, 1);
        }
      }

      // 4. Move & Draw Axiom Basket at Finish Line
      if (game.basket) {
        if (gameState === 'playing' && !game.basket.caught) {
          game.basket.x -= game.speed;
        }

        const bx = game.basket.x;
        const by = game.basket.y;

        // Pole
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(bx - 3, by, 6, 85);

        // Yellow / Amber Band
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(bx - 32, by, 64, 16);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx - 32, by, 64, 16);

        // Metal Chains
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        for (let c = -24; c <= 24; c += 8) {
          ctx.beginPath();
          ctx.moveTo(bx + c, by + 16);
          ctx.lineTo(bx + c * 0.4, by + 52);
          ctx.stroke();
        }

        // Lower Basket Cage
        ctx.fillStyle = '#334155';
        ctx.fillRect(bx - 35, by + 52, 70, 26);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx - 35, by + 52, 70, 2);

        // Check if Disc enters the chains!
        if (gameState === 'playing' && !game.basket.caught) {
          const dx = Math.abs(game.discX - bx);
          const dy = game.discY - (by + 34);

          if (dx < 30 && Math.abs(dy) < 32) {
            game.basket.caught = true;
            game.vy = 0;
            game.discX = bx;
            game.discY = by + 48; // drop into tray
            flappyAudio.playChains();
            flappyAudio.playVictory();
            spawnAceConfetti(bx, by + 30);
            setGameState('ace');

            const nextAces = totalAces + 1;
            setTotalAces(nextAces);
            try { localStorage.setItem(TOTAL_ACES_KEY, nextAces.toString()); } catch {}
          }
        }
      }

      // 5. Draw Vapor Trail
      game.trail.forEach((t) => {
        ctx.fillStyle = `rgba(6, 182, 212, ${t.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 10 * t.alpha, 0, Math.PI * 2);
        ctx.fill();
        t.alpha -= 0.05;
      });

      // 6. Draw Spinning Disc (Side Profile View)
      ctx.save();
      ctx.translate(game.discX, game.discY);
      ctx.rotate(game.angle);

      // Disc Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 18, 22, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer Axiom Gyro Rim (Bright Orange)
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner Flight Plate (Vivid Cyan)
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Center hot stamp foil
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 7. Update & Draw Confetti Particles
      game.particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.rotation += p.rotSpeed;
        p.alpha -= 0.015;

        if (p.alpha <= 0) {
          game.particles.splice(idx, 1);
          return;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameState, bestDistance, totalAces]);

  return (
    <div className="fixed inset-0 z-[2600] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center select-none overflow-hidden animate-fade-in">
      {/* Top HUD Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3.5 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-neutral-950 flex items-center justify-center font-black shadow-lg">
            🌲
          </div>
          <div>
            <h2 className="text-sm font-black text-white leading-none">Wood Flight</h2>
            <p className="text-[10px] text-emerald-400 font-extrabold mt-0.5">
              Hole 1 • Par 3 • 350 FT
            </p>
          </div>
        </div>

        {/* Distance Remaining & Progress Gauge */}
        <div className="flex flex-col items-center min-w-[120px]">
          <span className="text-sm font-black text-white tracking-tight">
            {distanceRemaining} FT TO PIN
          </span>
          <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-150"
              style={{
                width: `${Math.max(0, Math.min(100, ((COURSE_DISTANCE - distanceRemaining) / COURSE_DISTANCE) * 100))}%`
              }}
            />
          </div>
        </div>

        {/* Action Controls: Sound & Exit */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const next = !isMuted;
              setIsMuted(next);
              flappyAudio.isMuted = next;
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

      {/* Main Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleFlap}
        onTouchStart={(e) => {
          e.preventDefault();
          handleFlap();
        }}
        className="w-full h-full cursor-pointer touch-none"
      />

      {/* "Ready / Tap to Start" Overlay */}
      {gameState === 'ready' && (
        <div
          onClick={startGame}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-[2px] cursor-pointer"
        >
          <div className="bg-[#111827]/95 border border-white/15 rounded-3xl p-6 text-center max-w-xs shadow-2xl flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-neutral-950 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/30">
              🥏
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Flappy Disc</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Tap the screen to keep your disc flying between trees. Guide it into the basket for an Ace!
              </p>
            </div>
            <button
              onClick={startGame}
              className="w-full py-3.5 mt-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black text-sm shadow-xl shadow-emerald-950/40 border border-emerald-300 transition-transform active:scale-95"
            >
              Tap to Tee Off
            </button>
          </div>
        </div>
      )}

      {/* "Lumber / Tree Crash" Game Over Modal */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#111827] border border-white/15 rounded-3xl p-6 max-w-xs w-full text-center flex flex-col gap-3.5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-2xl mx-auto shadow">
              🪵
            </div>

            <div>
              <h3 className="text-lg font-black text-white">LUMBER!</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Kicked by a tree! (+1 Beer Penalty 🍻)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-[#090d16] p-2.5 rounded-2xl border border-white/5">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-neutral-500">Distance</span>
                <p className="text-xl font-black text-amber-400">
                  {COURSE_DISTANCE - distanceRemaining} FT
                </p>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-neutral-500">Best</span>
                <p className="text-xl font-black text-emerald-400">{bestDistance} FT</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={startGame}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-sm shadow-xl shadow-emerald-950/40 border border-emerald-300 transition-transform active:scale-95"
              >
                Try Again
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

      {/* "ACE!" Victory Modal */}
      {gameState === 'ace' && (
        <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#111827] border border-amber-400/40 rounded-3xl p-6 max-w-xs w-full text-center flex flex-col gap-3.5 shadow-2xl shadow-amber-500/20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-neutral-950 flex items-center justify-center text-3xl font-black mx-auto shadow-xl shadow-amber-500/30 animate-bounce">
              🎯
            </div>

            <div>
              <h3 className="text-2xl font-black text-amber-300 tracking-tight">
                CHAINS! ACE!
              </h3>
              <p className="text-xs text-emerald-400 font-extrabold mt-0.5">
                Flown 350 FT straight into the basket!
              </p>
            </div>

            <div className="bg-[#090d16] p-3 rounded-2xl border border-white/5 flex items-center justify-around">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-neutral-500">Result</span>
                <p className="text-lg font-black text-white">Hole in One</p>
              </div>
              <div className="border-l border-white/10 pl-4">
                <span className="text-[10px] font-extrabold uppercase text-neutral-500">Total Aces</span>
                <p className="text-lg font-black text-amber-400">{totalAces}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={startGame}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-neutral-950 font-black text-sm shadow-xl shadow-amber-500/30 border border-amber-300 transition-transform active:scale-95"
              >
                Play Again!
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
