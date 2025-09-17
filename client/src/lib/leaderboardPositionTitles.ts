import { GameMode, PlayerData } from "./types";
import { getLeaderboard, shouldShowPlayerOnLeaderboard, getPlayerLeaderboardPosition } from "./leaderboardSystem";
import { getLeaderboardPositionTitle } from "./customTitles";

// Check and update leaderboard position titles for a player
export const updateLeaderboardPositionTitles = (playerData: PlayerData): PlayerData => {
  const updatedPlayerData = { ...playerData };
  const gameModes: GameMode[] = ["1v1", "2v2", "3v3"];
  
  // Remove all existing leaderboard position titles
  updatedPlayerData.titles = updatedPlayerData.titles.filter(title => 
    !title.startsWith("RANKED #")
  );
  
  // Check each game mode for leaderboard position
  gameModes.forEach(gameMode => {
    const playerMMR = updatedPlayerData.rankedMMR[gameMode];
    
    if (shouldShowPlayerOnLeaderboard(gameMode, playerMMR)) {
      const position = getPlayerLeaderboardPosition(gameMode, playerMMR);
      
      if (position && position <= 30) {
        const positionTitle = getLeaderboardPositionTitle(position, gameMode);
        if (positionTitle) {
          updatedPlayerData.titles.push(positionTitle.name);
        }
      }
    }
  });
  
  return updatedPlayerData;
};

// Check if player should get a leaderboard AI opponent
export const shouldGetLeaderboardAI = (playerData: PlayerData, gameMode: GameMode): boolean => {
  const playerMMR = playerData.rankedMMR[gameMode];
  
  // For 1700+ MMR players, much higher chance of facing leaderboard AI
  if (playerMMR >= 1700) {
    return Math.random() < 0.7; // 70% chance for high MMR players
  }
  
  // For 1500-1700 MMR players, moderate chance
  if (playerMMR >= 1500) {
    return Math.random() < 0.3; // 30% chance for mid-high MMR players
  }
  
  return false;
};

// Get a random leaderboard player as AI opponent
export const getLeaderboardAIOpponent = (gameMode: GameMode, playerMMR: number) => {
  const leaderboard = getLeaderboard(gameMode);
  
  // For very high MMR players (1700+), allow wider MMR range or similar skilled opponents
  const mmrRange = playerMMR >= 1700 ? 300 : 200;
  
  // Filter to players within MMR range
  const suitableOpponents = leaderboard.filter(player => {
    const opponentMMR = player.mmr[gameMode];
    const mmrDiff = Math.abs(opponentMMR - playerMMR);
    
    // For high MMR players, also allow opponents in the 1600-1850 range (below leaderboard)
    if (playerMMR >= 1700) {
      return mmrDiff <= mmrRange || (opponentMMR >= 1600 && opponentMMR < 1850);
    }
    
    return mmrDiff <= mmrRange;
  });
  
  if (suitableOpponents.length === 0) {
    return leaderboard[Math.floor(Math.random() * Math.min(10, leaderboard.length))];
  }
  
  return suitableOpponents[Math.floor(Math.random() * suitableOpponents.length)];
};