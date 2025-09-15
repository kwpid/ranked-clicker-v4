import { Rank, Division, GameMode } from "./types";
import { RANK_MMR_THRESHOLDS, DIVISION_POINTS_PER_RANK, RANKS } from "./constants";

export const getRankFromMMR = (mmr: number): { rank: Rank; division: Division | null } => {
  // Find the rank
  let rank: Rank = "Bronze";
  for (const [rankName, threshold] of Object.entries(RANK_MMR_THRESHOLDS)) {
    if (mmr >= threshold.min && mmr <= threshold.max) {
      rank = rankName as Rank;
      break;
    }
  }
  
  // Grand Champion has no divisions
  if (rank === "Grand Champion") {
    return { rank, division: null };
  }
  
  // Calculate division within the rank
  const rankThreshold = RANK_MMR_THRESHOLDS[rank];
  const mmrInRank = mmr - rankThreshold.min;
  const divisionIndex = Math.floor(mmrInRank / DIVISION_POINTS_PER_RANK);
  
  const divisions: Division[] = ["I", "II", "III", "IV", "V"];
  const division = divisions[Math.min(divisionIndex, 4)]; // Cap at division V
  
  return { rank, division };
};

export const formatRank = (rank: Rank, division: Division | null): string => {
  if (division === null) return rank;
  return `${rank} ${division}`;
};

export const getNextRank = (currentRank: Rank): Rank | null => {
  const currentIndex = RANKS.indexOf(currentRank);
  if (currentIndex === -1 || currentIndex === RANKS.length - 1) return null;
  return RANKS[currentIndex + 1];
};

export const getPreviousRank = (currentRank: Rank): Rank | null => {
  const currentIndex = RANKS.indexOf(currentRank);
  if (currentIndex <= 0) return null;
  return RANKS[currentIndex - 1];
};

export const getSeasonRewardProgress = (
  seasonWins: number,
  currentRank: Rank
): { current: Rank; progress: number; total: number } => {
  const ranksToProgress = RANKS.slice(0, RANKS.indexOf(currentRank) + 1);
  const currentRewardIndex = Math.floor(seasonWins / 10);
  const current = ranksToProgress[Math.min(currentRewardIndex, ranksToProgress.length - 1)];
  const progress = seasonWins % 10;
  
  return {
    current,
    progress,
    total: 10
  };
};

export const getRankColor = (rank: Rank): string => {
  switch (rank) {
    case "Bronze": return "text-amber-600";
    case "Silver": return "text-gray-400";
    case "Gold": return "text-yellow-400";
    case "Platinum": return "text-cyan-400";
    case "Diamond": return "text-blue-400";
    case "Champion": return "text-purple-400";
    case "Grand Champion": return "text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]";
    default: return "text-gray-400";
  }
};
