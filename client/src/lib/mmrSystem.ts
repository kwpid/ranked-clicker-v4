import { GameMode, PlayerData, AIPlayer } from "./types";

export const calculateEloChange = (
  playerMMR: number,
  opponentMMRs: number[],
  won: boolean,
  kFactor: number = 32
): number => {
  // Calculate average opponent MMR
  const avgOpponentMMR = opponentMMRs.reduce((sum, mmr) => sum + mmr, 0) / opponentMMRs.length;
  
  // Expected score (probability of winning)
  const expectedScore = 1 / (1 + Math.pow(10, (avgOpponentMMR - playerMMR) / 400));
  
  // Actual score (1 for win, 0 for loss)
  const actualScore = won ? 1 : 0;
  
  // Calculate change
  const change = Math.round(kFactor * (actualScore - expectedScore));
  
  return change;
};

export const generateAIMMR = (baseMMR: number, variance: number = 100): number => {
  const min = Math.max(0, baseMMR - variance);
  const max = baseMMR + variance;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const calculateAverageMMR = (players: AIPlayer[]): number => {
  if (players.length === 0) return 600;
  return Math.round(players.reduce((sum, player) => sum + player.mmr, 0) / players.length);
};

export const getKFactor = (playerMMR: number, gamesPlayed: number): number => {
  // Higher K-factor for new players and lower MMR players
  if (gamesPlayed < 10) return 40;
  if (playerMMR < 1000) return 35;
  if (playerMMR < 1400) return 30;
  return 25;
};
