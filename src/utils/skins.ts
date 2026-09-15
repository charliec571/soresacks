import { Round, SkinResult } from '../types';
import { courseData } from '../data/courseData';

export interface PlayerSkinsSummary {
  playerId: string;
  playerName: string;
  playerColor: string;
  skinsWon: number;
  holesWon: number[];
  payoutText: string;
}

export interface SkinsCalculation {
  results: SkinResult[];
  playerSummaries: PlayerSkinsSummary[];
  currentPot: number;
  totalSkinsAvailable: number;
  totalSkinsClaimed: number;
}

export function calculateSkins(round: Round): SkinsCalculation {
  const config = round.skinsConfig || {
    enabled: true,
    stakeType: 'cash',
    stakeAmount: 1,
    carryovers: true
  };

  const results: SkinResult[] = [];
  const playerWins: Record<string, { count: number; holes: number[] }> = {};

  round.players.forEach((p) => {
    playerWins[p.id] = { count: 0, holes: [] };
  });

  let accumulatedPot = 1;

  courseData.holes.forEach((hole) => {
    const holeNum = hole.number;

    // Check if any player has scored this hole
    const playerScores: { playerId: string; name: string; score: number }[] = [];

    round.players.forEach((p) => {
      if (p.scores[holeNum] !== undefined) {
        playerScores.push({
          playerId: p.id,
          name: p.name,
          score: p.scores[holeNum]
        });
      }
    });

    // If not all players scored yet or no scores, treat as pending
    if (playerScores.length < Math.min(round.players.length, 2)) {
      results.push({
        holeNumber: holeNum,
        winnerPlayerId: null,
        winnerName: null,
        tiedPlayerIds: [],
        skinsValue: accumulatedPot,
        isCarryover: false
      });
      return;
    }

    // Find minimum score
    const minScore = Math.min(...playerScores.map((s) => s.score));
    const lowestPlayers = playerScores.filter((s) => s.score === minScore);

    if (lowestPlayers.length === 1) {
      // Outright winner!
      const winner = lowestPlayers[0];
      const skinsWon = accumulatedPot;

      playerWins[winner.playerId].count += skinsWon;
      playerWins[winner.playerId].holes.push(holeNum);

      results.push({
        holeNumber: holeNum,
        winnerPlayerId: winner.playerId,
        winnerName: winner.name,
        tiedPlayerIds: [],
        skinsValue: skinsWon,
        isCarryover: false
      });

      // Reset pot for next hole
      accumulatedPot = 1;
    } else {
      // Tie -> Carryover!
      const tiedIds = lowestPlayers.map((p) => p.playerId);

      if (config.carryovers) {
        results.push({
          holeNumber: holeNum,
          winnerPlayerId: null,
          winnerName: null,
          tiedPlayerIds: tiedIds,
          skinsValue: accumulatedPot,
          isCarryover: true
        });
        accumulatedPot += 1;
      } else {
        results.push({
          holeNumber: holeNum,
          winnerPlayerId: null,
          winnerName: null,
          tiedPlayerIds: tiedIds,
          skinsValue: accumulatedPot,
          isCarryover: false
        });
        accumulatedPot = 1;
      }
    }
  });

  // Calculate summaries and payouts
  const playerSummaries: PlayerSkinsSummary[] = round.players.map((p) => {
    const winData = playerWins[p.id] || { count: 0, holes: [] };
    const skinsWon = winData.count;

    let payoutText = '';
    if (config.stakeType === 'cash') {
      const amount = skinsWon * config.stakeAmount;
      payoutText = `$${amount}`;
    } else if (config.stakeType === 'beer') {
      const amount = skinsWon * config.stakeAmount;
      payoutText = `${amount} Beer${amount === 1 ? '' : 's'}`;
    } else {
      payoutText = `${skinsWon} Skin${skinsWon === 1 ? '' : 's'}`;
    }

    return {
      playerId: p.id,
      playerName: p.name,
      playerColor: p.color,
      skinsWon,
      holesWon: winData.holes,
      payoutText
    };
  });

  // Sort by skins won descending
  playerSummaries.sort((a, b) => b.skinsWon - a.skinsWon);

  const totalSkinsClaimed = playerSummaries.reduce((sum, p) => sum + p.skinsWon, 0);

  return {
    results,
    playerSummaries,
    currentPot: accumulatedPot,
    totalSkinsAvailable: courseData.holeCount,
    totalSkinsClaimed
  };
}
