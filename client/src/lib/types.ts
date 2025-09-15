export type GameScreen = 
  | "main-menu" 
  | "queue-selection" 
  | "queue-screen" 
  | "game" 
  | "end-screen" 
  | "settings" 
  | "titles" 
  | "stats";

export type QueueType = "casual" | "ranked";

export type GameMode = "1v1" | "2v2" | "3v3";

export type Team = "red" | "blue";

export type Rank = 
  | "Bronze" 
  | "Silver" 
  | "Gold" 
  | "Platinum" 
  | "Diamond" 
  | "Champion" 
  | "Grand Champion";

export type Division = "I" | "II" | "III" | "IV" | "V";

export type TitleType = "XP" | "Ranked" | "Competitive";

export interface PlayerData {
  username: string;
  level: number;
  xp: number;
  casualMMR: number;
  rankedMMR: {
    "1v1": number;
    "2v2": number;
    "3v3": number;
  };
  peakMMR: {
    casual: number;
    ranked: {
      "1v1": number;
      "2v2": number;
      "3v3": number;
    };
  };
  rank: {
    "1v1": { rank: Rank; division: Division | null };
    "2v2": { rank: Rank; division: Division | null };
    "3v3": { rank: Rank; division: Division | null };
  };
  seasonWins: {
    "1v1": number;
    "2v2": number;
    "3v3": number;
  };
  seasonRewardProgress: {
    "1v1": Rank;
    "2v2": Rank;
    "3v3": Rank;
  };
  titles: string[];
  equippedTitle: string | null;
  totalGames: number;
  totalWins: number;
  placementMatches: {
    "1v1": number;
    "2v2": number;
    "3v3": number;
  };
  isPlacementComplete: {
    "1v1": boolean;
    "2v2": boolean;
    "3v3": boolean;
  };
}

export interface AIPlayer {
  id: string;
  username: string;
  mmr: number;
  rank?: { rank: Rank; division: Division | null };
  title?: string;
  team: Team;
  clicksPerSecond: number;
  variance: number;
}

export interface GameState {
  gameMode: GameMode;
  queueType: QueueType;
  players: AIPlayer[];
  playerTeam: Team;
  gamePhase: "waiting" | "countdown" | "playing" | "ended";
  countdown: number;
  timeRemaining: number;
  redScore: number;
  blueScore: number;
  playerClicks: number;
  matchStarted: boolean;
}

export interface MatchResult {
  won: boolean;
  mmrChange: number;
  newMMR: number;
  newRank?: { rank: Rank; division: Division | null };
  opponentMMRs: Array<{ username: string; mmr: number }>;
}

export interface QueueState {
  isQueuing: boolean;
  queueTime: number;
  estimatedWaitTime: number;
  populationText: string;
}

export interface Title {
  id: string;
  name: string;
  type: TitleType;
  description: string;
  unlocked: boolean;
  color: string;
  glow?: boolean;
  season?: number;
}
