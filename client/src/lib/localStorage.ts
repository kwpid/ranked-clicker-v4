import { PlayerData, GameMode } from "./types";
import { CURRENT_SEASON } from "./constants";

const STORAGE_KEY = "ranked-clicker-data";

export const getDefaultPlayerData = (): PlayerData => ({
  username: "Player",
  level: 1,
  xp: 0,
  casualMMR: 600,
  rankedMMR: {
    "1v1": 600,
    "2v2": 600,
    "3v3": 600
  },
  peakMMR: {
    casual: 600,
    ranked: {
      "1v1": 600,
      "2v2": 600,
      "3v3": 600
    }
  },
  rank: {
    "1v1": { rank: "Bronze", division: "I" },
    "2v2": { rank: "Bronze", division: "I" },
    "3v3": { rank: "Bronze", division: "I" }
  },
  seasonWins: {
    "1v1": 0,
    "2v2": 0,
    "3v3": 0
  },
  seasonRewardProgress: {
    "1v1": "Bronze",
    "2v2": "Bronze",
    "3v3": "Bronze"
  },
  titles: [`SINCE S${CURRENT_SEASON}`],
  equippedTitle: null,
  totalGames: 0,
  totalWins: 0,
  placementMatches: {
    "1v1": 0,
    "2v2": 0,
    "3v3": 0
  },
  isPlacementComplete: {
    "1v1": false,
    "2v2": false,
    "3v3": false
  }
});

export const loadPlayerData = (): PlayerData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultPlayerData();
    
    const data = JSON.parse(stored);
    
    // Ensure all required fields exist (for backwards compatibility)
    const defaultData = getDefaultPlayerData();
    return { ...defaultData, ...data };
  } catch (error) {
    console.error("Failed to load player data:", error);
    return getDefaultPlayerData();
  }
};

export const savePlayerData = (data: PlayerData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save player data:", error);
  }
};

export const updatePlayerMMR = (
  data: PlayerData, 
  gameMode: GameMode, 
  queueType: "casual" | "ranked", 
  newMMR: number
): PlayerData => {
  const updated = { ...data };
  
  if (queueType === "casual") {
    updated.casualMMR = newMMR;
    updated.peakMMR.casual = Math.max(updated.peakMMR.casual, newMMR);
  } else {
    updated.rankedMMR[gameMode] = newMMR;
    updated.peakMMR.ranked[gameMode] = Math.max(updated.peakMMR.ranked[gameMode], newMMR);
  }
  
  return updated;
};

export const addXP = (data: PlayerData, xp: number): PlayerData => {
  const updated = { ...data };
  updated.xp += xp;
  
  // Check for level up
  while (updated.xp >= updated.level * 100) {
    updated.xp -= updated.level * 100;
    updated.level += 1;
  }
  
  return updated;
};
