import { RCCSSeasonData, RCCSTournament, RCCSTournamentType, RCCSWeek, GameMode, PlayerData } from "./types";
import { CURRENT_SEASON } from "./constants";

export const RCCS_TITLES = {
  CONTENDER: (season: number, mode: GameMode) => `RCCS S${season} ${mode.toUpperCase()} CONTENDER`,
  REGIONAL_FINALIST: (season: number, mode: GameMode) => `RCCS S${season} ${mode.toUpperCase()} REGIONAL FINALIST`,
  REGIONAL_CHAMPION: (season: number, mode: GameMode) => `RCCS S${season} ${mode.toUpperCase()} REGIONAL CHAMPION`,
  MAJOR_FINALIST: (season: number, mode: GameMode) => `RCCS S${season} ${mode.toUpperCase()} MAJOR FINALIST`,
  MAJOR_CHAMPION: (season: number, mode: GameMode) => `RCCS S${season} ${mode.toUpperCase()} MAJOR CHAMPION`,
  WORLD_CONTENDER: (season: number, mode: GameMode) => `RCCS S${season} ${mode.toUpperCase()} WORLD CONTENDER`,
  WORLD_CHAMPION: (season: number, mode: GameMode) => `RCCS S${season} ${mode.toUpperCase()} WORLD CHAMPION`,
  ELITE: (season: number) => `RCCS S${season} ELITE`
};

export const getCurrentRCCSWeek = (): RCCSWeek => {
  // Calculate current week based on date (simplified - in reality would be based on season schedule)
  const now = new Date();
  const weekOfMonth = Math.ceil(now.getDate() / 7);
  return Math.min(4, Math.max(1, weekOfMonth)) as RCCSWeek;
};

export const getWeekDescription = (week: RCCSWeek): string => {
  switch (week) {
    case 1: return "Break Week - Ladder Reset";
    case 2: return "Regional Tournament 1";
    case 3: return "Regional Tournament 2";
    case 4: return "Major + Worlds";
    default: return "Unknown Week";
  }
};

export const createRCCSTournament = (
  type: RCCSTournamentType,
  week: RCCSWeek,
  mode: GameMode,
  season: number
): RCCSTournament => {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (type === "Worlds" ? 1 : 7));

  return {
    id: `${type}_${mode}_S${season}_W${week}`,
    name: `${type} ${mode.toUpperCase()}`,
    type,
    week,
    gameMode: mode,
    season,
    isActive: true,
    startDate,
    endDate,
    participants: [],
    brackets: []
  };
};

export const generateAITournamentResults = (
  tournament: RCCSTournament,
  playerMMR: number
): { placement: number; totalParticipants: number; earnedTitle?: string } => {
  // Simulate tournament results based on player MMR
  const baseParticipants = tournament.type === "Worlds" ? 4 : tournament.type === "Major" ? 16 : 32;
  const mmrVariance = 200; // ±200 MMR variance for AI opponents

  // Higher MMR = better placement chance
  const skillFactor = Math.min(1, Math.max(0, (playerMMR - 800) / 800)); // 0 to 1 based on 800-1600 MMR
  const randomFactor = Math.random();
  
  let placement: number;
  
  if (tournament.type === "Worlds") {
    // Top 4 tournament
    if (skillFactor > 0.8 && randomFactor > 0.3) placement = 1; // Champion
    else if (skillFactor > 0.6 && randomFactor > 0.5) placement = 2; // Runner-up
    else if (skillFactor > 0.4) placement = Math.random() < 0.5 ? 3 : 4; // Semifinalist
    else placement = Math.floor(Math.random() * 4) + 1;
  } else {
    // Calculate placement based on skill and luck
    const topPercentChance = skillFactor * 0.8 + randomFactor * 0.2;
    if (topPercentChance > 0.9) placement = 1; // Champion
    else if (topPercentChance > 0.8) placement = Math.floor(Math.random() * 3) + 2; // Top 4
    else if (topPercentChance > 0.6) placement = Math.floor(Math.random() * 6) + 5; // Top 10
    else if (topPercentChance > 0.4) placement = Math.floor(Math.random() * 16) + 9; // Top 25
    else placement = Math.floor(Math.random() * (baseParticipants - 24)) + 25; // Bottom
  }

  // Determine earned title
  let earnedTitle: string | undefined;
  const season = tournament.season;
  const mode = tournament.gameMode;

  if (placement <= 32) {
    earnedTitle = RCCS_TITLES.CONTENDER(season, mode);
  }
  if (placement <= 6) {
    earnedTitle = RCCS_TITLES.REGIONAL_FINALIST(season, mode);
  }
  if (placement === 1) {
    if (tournament.type === "Regional1" || tournament.type === "Regional2") {
      earnedTitle = RCCS_TITLES.REGIONAL_CHAMPION(season, mode);
    } else if (tournament.type === "Major") {
      earnedTitle = RCCS_TITLES.MAJOR_CHAMPION(season, mode);
    } else if (tournament.type === "Worlds") {
      earnedTitle = RCCS_TITLES.WORLD_CHAMPION(season, mode);
    }
  }
  if (placement <= 6 && tournament.type === "Major") {
    earnedTitle = RCCS_TITLES.MAJOR_FINALIST(season, mode);
  }
  if (placement <= 4 && tournament.type === "Worlds") {
    earnedTitle = RCCS_TITLES.WORLD_CONTENDER(season, mode);
  }

  return { placement, totalParticipants: baseParticipants, earnedTitle };
};

export const initializeRCCSSeasonData = (): RCCSSeasonData => {
  const currentWeek = getCurrentRCCSWeek();
  const weekStartDate = new Date();
  
  return {
    season: CURRENT_SEASON,
    currentWeek,
    weekStartDate,
    tournaments: [],
    playerStats: {
      points: 0,
      wins: 0,
      losses: 0,
      tournamentWins: 0,
      regionalsWon: 0,
      majorsWon: 0,
      worldsWon: 0
    },
    titles: []
  };
};

export const updatePlayerDataWithRCCSTitle = (playerData: PlayerData, title: string): PlayerData => {
  if (!playerData.titles.includes(title)) {
    return {
      ...playerData,
      titles: [...playerData.titles, title]
    };
  }
  return playerData;
};

export const checkEliteTitle = (playerData: PlayerData, season: number): string | null => {
  // Check if player has won multiple tournaments consistently
  const seasonTitles = playerData.titles.filter(title => 
    title.includes(`S${season}`) && 
    (title.includes('CHAMPION') || title.includes('FINALIST'))
  );
  
  if (seasonTitles.length >= 4) { // Won/placed top 6 in 4+ tournaments
    return RCCS_TITLES.ELITE(season);
  }
  
  return null;
};