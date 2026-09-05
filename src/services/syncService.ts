import { Round, Player, LeaderboardEntry } from '../types';
import { courseData } from '../data/courseData';

const ACTIVE_ROUND_KEY = 'sore_sacks_active_round';
const COMPLETED_ROUNDS_KEY = 'sore_sacks_completed_rounds';
const LEADERBOARD_KEY = 'sore_sacks_leaderboard';

const PLAYER_COLORS = [
  '#10b981', // Emerald Fairway Green
  '#3b82f6', // Electric Blue
  '#f97316', // Blaze Orange
  '#f59e0b', // Gold
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#14b8a6'  // Teal
];

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// In-memory local listeners for reactive state inside the same tab
type Listener = (round: Round | null) => void;
const localListeners = new Set<Listener>();

function notifyLocal(round: Round | null) {
  localListeners.forEach((cb) => {
    try {
      cb(round);
    } catch (e) {
      console.error('Error in local round listener:', e);
    }
  });
}

// Broadcast channel for cross-tab / multi-device sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('sore_sacks_round_channel');
  }
} catch {
  console.warn('BroadcastChannel not supported in this environment');
}

export const syncService = {
  getStoredRound(): Round | null {
    try {
      const data = localStorage.getItem(ACTIVE_ROUND_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveRound(round: Round): void {
    try {
      round.updatedAt = Date.now();
      localStorage.setItem(ACTIVE_ROUND_KEY, JSON.stringify(round));
      // Notify current tab listeners immediately!
      notifyLocal(round);
      // Notify other tabs/windows
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'ROUND_UPDATED', round });
      }
    } catch (e) {
      console.error('Failed to save round to localStorage', e);
    }
  },

  createRound(playerNames: string[]): Round {
    const code = generateRoomCode();
    const players: Player[] = playerNames.map((name, idx) => {
      const initialScores: Record<number, number> = {};
      courseData.holes.forEach((h) => {
        initialScores[h.number] = h.par; // default to par
      });
      return {
        id: 'p_' + Math.random().toString(36).substring(2, 9),
        name: name.trim() || `Player ${idx + 1}`,
        color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
        scores: initialScores,
        putts: {},
        penalties: {}
      };
    });

    const newRound: Round = {
      id: 'round_' + Date.now(),
      roomCode: code,
      courseName: courseData.name,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      startedAt: Date.now(),
      players,
      currentHole: 1,
      status: 'in_progress',
      updatedAt: Date.now()
    };

    this.saveRound(newRound);
    return newRound;
  },

  updateScore(playerId: string, holeNumber: number, strokes: number): Round | null {
    const round = this.getStoredRound();
    if (!round) return null;

    const player = round.players.find((p) => p.id === playerId);
    if (player) {
      player.scores[holeNumber] = Math.max(1, Math.min(15, strokes));
      this.saveRound(round);
    }
    return round;
  },

  setCurrentHole(holeNumber: number): Round | null {
    const round = this.getStoredRound();
    if (!round) return null;
    round.currentHole = Math.max(1, Math.min(courseData.holeCount, holeNumber));
    this.saveRound(round);
    return round;
  },

  finishRound(): Round | null {
    const round = this.getStoredRound();
    if (!round) return null;

    round.status = 'completed';
    round.completedAt = Date.now();
    this.saveRound(round);

    // Save to completed rounds history
    try {
      const historyRaw = localStorage.getItem(COMPLETED_ROUNDS_KEY);
      const history: Round[] = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift(round);
      localStorage.setItem(COMPLETED_ROUNDS_KEY, JSON.stringify(history.slice(0, 50)));

      // Record to leaderboard
      const leaderboard = this.getLeaderboard();
      round.players.forEach((p) => {
        let total = 0;
        let birdies = 0;
        let pars = 0;
        let bogeys = 0;
        let aces = 0;
        const holeScoresList: number[] = [];

        courseData.holes.forEach((h) => {
          const s = p.scores[h.number] ?? h.par;
          total += s;
          holeScoresList.push(s);
          if (s === 1) aces++;
          else if (s < h.par) birdies++;
          else if (s === h.par) pars++;
          else if (s > h.par) bogeys++;
        });

        const scoreToPar = total - courseData.totalPar;

        leaderboard.push({
          id: 'lb_' + Math.random().toString(36).substring(2, 9),
          roundId: round.id,
          date: round.date,
          playerName: p.name,
          totalScore: total,
          scoreToPar,
          birdies,
          pars,
          bogeys,
          aces,
          holeScores: holeScoresList
        });
      });

      leaderboard.sort((a, b) => a.scoreToPar - b.scoreToPar || a.totalScore - b.totalScore);
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard.slice(0, 100)));
    } catch (e) {
      console.error('Failed to update leaderboard', e);
    }

    return round;
  },

  clearActiveRound(): void {
    localStorage.removeItem(ACTIVE_ROUND_KEY);
    notifyLocal(null);
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'ROUND_CLEARED' });
    }
  },

  getLeaderboard(): LeaderboardEntry[] {
    try {
      const raw = localStorage.getItem(LEADERBOARD_KEY);
      if (raw) return JSON.parse(raw);

      const initialLeaderboard: LeaderboardEntry[] = [
        {
          id: 'lb_record_1',
          roundId: 'init_1',
          date: 'Aug 2026',
          playerName: 'Chris Wilson (Basket Donator)',
          totalScore: 24,
          scoreToPar: -4,
          birdies: 4,
          pars: 5,
          bogeys: 0,
          aces: 0,
          holeScores: [2, 3, 2, 3, 2, 3, 2, 3, 4]
        },
        {
          id: 'lb_record_2',
          roundId: 'init_2',
          date: 'Sep 2026',
          playerName: 'Course Champ',
          totalScore: 26,
          scoreToPar: -2,
          birdies: 3,
          pars: 5,
          bogeys: 1,
          aces: 0,
          holeScores: [3, 2, 2, 3, 3, 3, 2, 4, 4]
        },
        {
          id: 'lb_record_3',
          roundId: 'init_3',
          date: 'Sep 2026',
          playerName: 'Charlie C.',
          totalScore: 27,
          scoreToPar: -1,
          birdies: 2,
          pars: 6,
          bogeys: 1,
          aces: 0,
          holeScores: [3, 3, 2, 3, 3, 3, 3, 3, 4]
        }
      ];
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(initialLeaderboard));
      return initialLeaderboard;
    } catch {
      return [];
    }
  },

  getCompletedRounds(): Round[] {
    try {
      const raw = localStorage.getItem(COMPLETED_ROUNDS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  subscribe(callback: (round: Round | null) => void): () => void {
    // Add to local listeners
    localListeners.add(callback);

    // Also listen to broadcastChannel for other tabs/devices
    let bcListener: ((event: MessageEvent) => void) | null = null;
    if (broadcastChannel) {
      bcListener = (event: MessageEvent) => {
        if (event.data?.type === 'ROUND_UPDATED') {
          callback(event.data.round);
        } else if (event.data?.type === 'ROUND_CLEARED') {
          callback(null);
        }
      };
      broadcastChannel.addEventListener('message', bcListener);
    }

    return () => {
      localListeners.delete(callback);
      if (broadcastChannel && bcListener) {
        broadcastChannel.removeEventListener('message', bcListener);
      }
    };
  }
};
