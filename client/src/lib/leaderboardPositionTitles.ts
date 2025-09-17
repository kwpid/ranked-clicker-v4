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
  
  // Only high-ranked players (1500+ MMR) can face leaderboard AI
  if (playerMMR < 1500) return false;
  
  // 20% chance to face leaderboard AI
  return Math.random() < 0.2;
};

// Get a random leaderboard player as AI opponent
export const getLeaderboardAIOpponent = (gameMode: GameMode, playerMMR: number) => {
  const leaderboard = getLeaderboard(gameMode);
  
  // Filter to players close to player's MMR (+/- 200)
  const suitableOpponents = leaderboard.filter(player => {
    const mmrDiff = Math.abs(player.mmr[gameMode] - playerMMR);
    return mmrDiff <= 200;
  });
  
  if (suitableOpponents.length === 0) {
    return leaderboard[Math.floor(Math.random() * Math.min(10, leaderboard.length))];
  }
  
  return suitableOpponents[Math.floor(Math.random() * suitableOpponents.length)];
};