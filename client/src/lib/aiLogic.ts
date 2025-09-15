import { AIPlayer, Team, GameMode } from "./types";
import { AI_USERNAMES } from "./aiNames";
import { generateAIMMR } from "./mmrSystem";
import { getRankFromMMR, formatRank } from "./rankingSystem";
import { CURRENT_SEASON } from "./constants";

export const generateAIPlayers = (
  count: number, 
  playerMMR: number, 
  gameMode: GameMode,
  playerTeam: Team
): AIPlayer[] => {
  const players: AIPlayer[] = [];
  const usedNames = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    // Assign teams alternately, avoiding player's team for opponents
    let team: Team;
    if (gameMode === "1v1") {
      team = playerTeam === "red" ? "blue" : "red";
    } else {
      const teamsNeeded = gameMode === "2v2" ? 1 : 2; // teammates needed for player's team
      const playerTeamCount = players.filter(p => p.team === playerTeam).length;
      
      if (playerTeamCount < teamsNeeded) {
        team = playerTeam;
      } else {
        team = playerTeam === "red" ? "blue" : "red";
      }
    }
    
    // Generate unique username
    let username: string;
    do {
      username = AI_USERNAMES[Math.floor(Math.random() * AI_USERNAMES.length)];
    } while (usedNames.has(username));
    usedNames.add(username);
    
    // Generate MMR close to player's MMR
    const mmr = generateAIMMR(playerMMR, 150);
    const rank = getRankFromMMR(mmr);
    
    // Generate clicking stats based on MMR
    const clicksPerSecond = getClickingStatsFromMMR(mmr);
    
    // Sometimes give AI a title
    let title: string | undefined;
    if (Math.random() < 0.3) {
      title = generateAITitle(rank.rank, mmr);
    }
    
    players.push({
      id: `ai_${i}`,
      username,
      mmr,
      rank,
      title,
      team,
      clicksPerSecond,
      variance: 0.3 // 30% variance in clicking speed
    });
  }
  
  return players;
};

const getClickingStatsFromMMR = (mmr: number): number => {
  // Base clicking speed increases with MMR
  const baseSpeed = Math.max(1, mmr / 200); // 1 CPS at 200 MMR, 3 CPS at 600 MMR, etc.
  
  // Add some randomness
  const variance = 0.5;
  const randomFactor = 1 + (Math.random() - 0.5) * variance;
  
  return Math.max(0.5, baseSpeed * randomFactor);
};

const generateAITitle = (rank: string, mmr: number): string => {
  const titles = [
    "CLICKER",
    "SPEED DEMON", 
    "RAPID FIRE",
    "CLICK MASTER",
    "FINGER FURY"
  ];
  
  // Higher MMR players more likely to have ranked titles
  if (mmr > 1000 && Math.random() < 0.6) {
    const season = Math.floor(Math.random() * CURRENT_SEASON) + 1;
    return `S${season} ${rank.toUpperCase()}`;
  }
  
  return titles[Math.floor(Math.random() * titles.length)];
};

export const simulateAIClicking = (ai: AIPlayer, deltaTime: number): number => {
  // Calculate clicks based on CPS and time
  const baseClicks = ai.clicksPerSecond * (deltaTime / 1000);
  
  // Add variance to make it feel more human
  const variance = 1 + (Math.random() - 0.5) * ai.variance;
  const actualClicks = baseClicks * variance;
  
  // Return rounded clicks
  return Math.floor(actualClicks + Math.random()); // Random chance for extra click
};
