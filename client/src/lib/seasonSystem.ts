import { PlayerData, GameMode, Rank } from "./types";
import { CURRENT_SEASON, SEASON_REWARD_WINS_REQUIRED, PLACEMENT_MATCHES_REQUIRED } from "./constants";
import { getRankFromMMR } from "./rankingSystem";

export const resetSeason = (playerData: PlayerData): PlayerData => {
  const updated = { ...playerData };
  
  // Soft reset MMR (like Rocket League)
  const softResetFactor = 0.7;
  updated.rankedMMR["1v1"] = Math.round(600 + (updated.rankedMMR["1v1"] - 600) * softResetFactor);
  updated.rankedMMR["2v2"] = Math.round(600 + (updated.rankedMMR["2v2"] - 600) * softResetFactor);
  updated.rankedMMR["3v3"] = Math.round(600 + (updated.rankedMMR["3v3"] - 600) * softResetFactor);
  
  // Reset placement matches
  updated.placementMatches = { "1v1": 0, "2v2": 0, "3v3": 0 };
  updated.isPlacementComplete = { "1v1": false, "2v2": false, "3v3": false };
  
  // Reset season wins and rewards
  updated.seasonWins = { "1v1": 0, "2v2": 0, "3v3": 0 };
  updated.seasonRewardProgress = { "1v1": "Bronze", "2v2": "Bronze", "3v3": "Bronze" };
  
  // Update ranks based on new MMR
  updated.rank["1v1"] = getRankFromMMR(updated.rankedMMR["1v1"]);
  updated.rank["2v2"] = getRankFromMMR(updated.rankedMMR["2v2"]);
  updated.rank["3v3"] = getRankFromMMR(updated.rankedMMR["3v3"]);
  
  return updated;
};

export const completeMatch = (
  playerData: PlayerData, 
  gameMode: GameMode, 
  won: boolean,
  newMMR: number
): PlayerData => {
  const updated = { ...playerData };
  
  // Update placement matches if not complete
  if (!updated.isPlacementComplete[gameMode]) {
    updated.placementMatches[gameMode] += 1;
    if (updated.placementMatches[gameMode] >= PLACEMENT_MATCHES_REQUIRED) {
      updated.isPlacementComplete[gameMode] = true;
    }
  }
  
  // Update season wins if won
  if (won) {
    updated.seasonWins[gameMode] += 1;
    updated.totalWins += 1;
    
    // Update season reward progress if placement is complete
    if (updated.isPlacementComplete[gameMode]) {
      updateSeasonRewards(updated, gameMode);
    }
  }
  
  updated.totalGames += 1;
  
  // Update rank based on new MMR
  updated.rank[gameMode] = getRankFromMMR(newMMR);
  
  return updated;
};

const updateSeasonRewards = (playerData: PlayerData, gameMode: GameMode): void => {
  const currentRank = playerData.rank[gameMode].rank;
  const seasonWins = playerData.seasonWins[gameMode];
  const currentRewardRankIndex = Math.floor(seasonWins / SEASON_REWARD_WINS_REQUIRED);
  
  const ranks: Rank[] = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Champion", "Grand Champion"];
  const currentPlayerRankIndex = ranks.indexOf(currentRank);
  
  // Can only get rewards up to current rank
  const maxRewardIndex = Math.min(currentRewardRankIndex, currentPlayerRankIndex);
  
  if (maxRewardIndex >= 0 && maxRewardIndex < ranks.length) {
    playerData.seasonRewardProgress[gameMode] = ranks[maxRewardIndex];
    
    // Award title if not already owned
    const titleName = `S${CURRENT_SEASON} ${ranks[maxRewardIndex].toUpperCase()}`;
    if (!playerData.titles.includes(titleName)) {
      playerData.titles.push(titleName);
    }
  }
};
