import { GameMode, Rank, Division } from "./types";
import { AI_USERNAMES } from "./aiNames";
import { getRankFromMMR } from "./rankingSystem";
import { CURRENT_SEASON } from "./constants";

export interface LeaderboardPlayer {
  id: string;
  username: string;
  mmr: {
    "1v1": number;
    "2v2": number;
    "3v3": number;
  };
  rank: {
    "1v1": { rank: Rank; division: Division | null };
    "2v2": { rank: Rank; division: Division | null };
    "3v3": { rank: Rank; division: Division | null };
  };
  title?: string;
  lastUpdate: number;
  specialization?: GameMode; // Some players focus on one mode
}

export interface LeaderboardData {
  players: LeaderboardPlayer[];
  lastUpdate: number;
  season: number;
}

const STORAGE_KEY = "ranked-clicker-leaderboard";
const GRAND_CHAMPION_MIN_MMR = 1600;
const LEADERBOARD_SIZE = 30;

// Generate high-level AI players for the leaderboard
export const generateLeaderboardPlayers = (): LeaderboardPlayer[] => {
  const players: LeaderboardPlayer[] = [];
  const usedNames = new Set<string>();

  // Create top-tier players with varying specializations
  const playerConfigs = [
    // Pure specialists (focus on one mode)
    ...Array.from({ length: 15 }, (_, i) => ({
      type: 'specialist',
      specialization: (['1v1', '2v2', '3v3'] as GameMode[])[i % 3],
      baseMMR: GRAND_CHAMPION_MIN_MMR + Math.random() * 800 + 200 // 1800-2600
    })),
    // Versatile players (good at multiple modes)
    ...Array.from({ length: 10 }, () => ({
      type: 'versatile',
      baseMMR: GRAND_CHAMPION_MIN_MMR + Math.random() * 600 + 100 // 1700-2300
    })),
    // Elite players (very high in all modes)
    ...Array.from({ length: 5 }, () => ({
      type: 'elite',
      baseMMR: GRAND_CHAMPION_MIN_MMR + Math.random() * 400 + 600 // 2200-3000
    }))
  ];

  playerConfigs.forEach((config, index) => {
    // Generate unique username
    let username: string;
    do {
      username = AI_USERNAMES[Math.floor(Math.random() * AI_USERNAMES.length)];
    } while (usedNames.has(username));
    usedNames.add(username);

    // Generate MMRs based on player type
    let mmrs: { "1v1": number; "2v2": number; "3v3": number };
    
    if (config.type === 'specialist' && 'specialization' in config) {
      const mainMode = config.specialization;
      const mainMMR = config.baseMMR;
      const otherMMR = Math.max(1400, mainMMR - Math.random() * 400 - 200);
      
      mmrs = {
        "1v1": mainMode === "1v1" ? mainMMR : otherMMR,
        "2v2": mainMode === "2v2" ? mainMMR : otherMMR,
        "3v3": mainMode === "3v3" ? mainMMR : otherMMR
      };
    } else if (config.type === 'versatile') {
      const baseMMR = config.baseMMR;
      const variance = 150;
      mmrs = {
        "1v1": Math.max(1600, baseMMR + (Math.random() - 0.5) * variance),
        "2v2": Math.max(1600, baseMMR + (Math.random() - 0.5) * variance),
        "3v3": Math.max(1600, baseMMR + (Math.random() - 0.5) * variance)
      };
    } else { // elite
      const baseMMR = config.baseMMR;
      const variance = 100;
      mmrs = {
        "1v1": Math.max(1800, baseMMR + (Math.random() - 0.5) * variance),
        "2v2": Math.max(1800, baseMMR + (Math.random() - 0.5) * variance),
        "3v3": Math.max(1800, baseMMR + (Math.random() - 0.5) * variance)
      };
    }

    // Round MMRs
    Object.keys(mmrs).forEach(mode => {
      mmrs[mode as GameMode] = Math.round(mmrs[mode as GameMode]);
    });

    // Generate ranks
    const ranks = {
      "1v1": getRankFromMMR(mmrs["1v1"]),
      "2v2": getRankFromMMR(mmrs["2v2"]),
      "3v3": getRankFromMMR(mmrs["3v3"])
    };

    // Generate title (higher chance for elite players)
    let title: string | undefined;
    const titleChance = config.type === 'elite' ? 0.8 : config.type === 'versatile' ? 0.5 : 0.3;
    
    if (Math.random() < titleChance) {
      // Find their highest rank for title generation
      const highestMMR = Math.max(mmrs["1v1"], mmrs["2v2"], mmrs["3v3"]);
      const highestRank = getRankFromMMR(highestMMR);
      
      if (Math.random() < 0.7) {
        // Season title
        const season = Math.max(1, CURRENT_SEASON - Math.floor(Math.random() * 3));
        title = `S${season} ${highestRank.rank.toUpperCase()}`;
      } else {
        // Custom title
        const customTitles = ["LEGEND", "ELITE", "MASTER", "CHAMPION", "ACE", "PRO"];
        title = customTitles[Math.floor(Math.random() * customTitles.length)];
      }
    }

    players.push({
      id: `leaderboard_${index}`,
      username,
      mmr: mmrs,
      rank: ranks,
      title,
      lastUpdate: Date.now(),
      specialization: config.type === 'specialist' && 'specialization' in config ? config.specialization as GameMode : undefined
    });
  });

  return players.sort((a, b) => Math.max(b.mmr["1v1"], b.mmr["2v2"], b.mmr["3v3"]) - Math.max(a.mmr["1v1"], a.mmr["2v2"], a.mmr["3v3"]));
};

export const loadLeaderboardData = (): LeaderboardData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // First time - generate leaderboard
      const players = generateLeaderboardPlayers();
      const data: LeaderboardData = {
        players,
        lastUpdate: Date.now(),
        season: CURRENT_SEASON
      };
      saveLeaderboardData(data);
      return data;
    }
    
    const data = JSON.parse(stored);
    
    // Check if we need to regenerate for new season
    if (data.season !== CURRENT_SEASON) {
      const players = generateLeaderboardPlayers();
      const newData: LeaderboardData = {
        players,
        lastUpdate: Date.now(),
        season: CURRENT_SEASON
      };
      saveLeaderboardData(newData);
      return newData;
    }
    
    return data;
  } catch (error) {
    console.error("Failed to load leaderboard data:", error);
    // Fallback to generating new data
    const players = generateLeaderboardPlayers();
    const data: LeaderboardData = {
      players,
      lastUpdate: Date.now(),
      season: CURRENT_SEASON
    };
    saveLeaderboardData(data);
    return data;
  }
};

export const saveLeaderboardData = (data: LeaderboardData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save leaderboard data:", error);
  }
};

export const getLeaderboard = (gameMode: GameMode): LeaderboardPlayer[] => {
  const data = loadLeaderboardData();
  return data.players
    .sort((a, b) => b.mmr[gameMode] - a.mmr[gameMode])
    .slice(0, LEADERBOARD_SIZE);
};

export const simulateMMRChanges = (): void => {
  const data = loadLeaderboardData();
  const now = Date.now();
  const timeSinceLastUpdate = now - data.lastUpdate;
  
  // Only simulate changes if enough time has passed (every hour)
  if (timeSinceLastUpdate < 60 * 60 * 1000) return;
  
  data.players.forEach(player => {
    // Each player has a chance to "play matches" and gain/lose MMR
    const gamesPlayed = Math.floor(Math.random() * 5); // 0-4 games per hour
    
    for (let i = 0; i < gamesPlayed; i++) {
      const mode = ['1v1', '2v2', '3v3'][Math.floor(Math.random() * 3)] as GameMode;
      const won = Math.random() < 0.5;
      const mmrChange = won ? Math.floor(Math.random() * 25) + 5 : -(Math.floor(Math.random() * 25) + 5);
      
      // Apply MMR change with bounds
      player.mmr[mode] = Math.max(1400, Math.min(3200, player.mmr[mode] + mmrChange));
      
      // Update rank
      player.rank[mode] = getRankFromMMR(player.mmr[mode]);
    }
    
    player.lastUpdate = now;
  });
  
  data.lastUpdate = now;
  saveLeaderboardData(data);
};

export const getPlayerLeaderboardPosition = (
  gameMode: GameMode, 
  playerMMR: number
): number | null => {
  const leaderboard = getLeaderboard(gameMode);
  
  // Check if player would be on leaderboard
  const position = leaderboard.findIndex(player => playerMMR > player.mmr[gameMode]);
  
  if (position === -1) {
    // Player would be after all current players
    if (playerMMR >= GRAND_CHAMPION_MIN_MMR && leaderboard.length < LEADERBOARD_SIZE) {
      return leaderboard.length + 1;
    }
    return null; // Not high enough
  }
  
  return position + 1;
};

export const shouldShowPlayerOnLeaderboard = (
  gameMode: GameMode,
  playerMMR: number
): boolean => {
  return playerMMR >= GRAND_CHAMPION_MIN_MMR;
};