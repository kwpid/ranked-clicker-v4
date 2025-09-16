import { Rank, Division } from "./types";

export const RANKS: Rank[] = [
  "Bronze",
  "Silver", 
  "Gold",
  "Platinum",
  "Diamond",
  "Champion",
  "Grand Champion"
];

export const DIVISIONS: Division[] = ["I", "II", "III", "IV", "V"];

export const RANK_MMR_THRESHOLDS = {
  "Bronze": { min: 0, max: 599 },
  "Silver": { min: 600, max: 799 },
  "Gold": { min: 800, max: 999 },
  "Platinum": { min: 1000, max: 1199 },
  "Diamond": { min: 1200, max: 1399 },
  "Champion": { min: 1400, max: 1599 },
  "Grand Champion": { min: 1600, max: Infinity }
};

export const DIVISION_POINTS_PER_RANK = 40; // Each rank has 200 MMR, 5 divisions = 40 per division

export const XP_PER_LEVEL = 100;

export const PLACEMENT_MATCHES_REQUIRED = 5;

export const SEASON_REWARD_WINS_REQUIRED = 10;

export const POPULATION_TIMES = {
  // Hours 0-23
  0: "poor", 1: "poor", 2: "poor", 3: "poor", 4: "poor", 5: "poor",
  6: "bad", 7: "bad", 8: "mid", 9: "mid", 10: "mid", 11: "good",
  12: "good", 13: "good", 14: "great", 15: "great", 16: "great",
  17: "great", 18: "great", 19: "great", 20: "good", 21: "good",
  22: "mid", 23: "bad"
};

export const GAME_SETTINGS = {
  MATCH_TIME: 60, // seconds
  MAX_POINTS: null,
  BEST_OF: 1,
  COUNTDOWN_TIME: 3
};

export const CURRENT_SEASON = 1;

export const RCCS_SEASON = 1;
