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
    
    // AI uses titles more frequently
    let title: string | undefined;
    if (Math.random() < 0.75) { // Increased from 0.3 to 0.75
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
  // Improved CPS scaling for higher MMR players (1200+)
  let baseSpeed;
  if (mmr >= 1200) {
    // High MMR players: 6+ CPS
    baseSpeed = 6 + (mmr - 1200) / 100; // 6 CPS at 1200 MMR, increases by 1 every 100 MMR
  } else {
    // Lower MMR players: gradual increase
    baseSpeed = Math.max(1, mmr / 200); // 1 CPS at 200 MMR, 6 CPS at 1200 MMR
  }
  
  // Add some randomness
  const variance = 0.3;
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

export const simulateAIClicking = (ai: AIPlayer, deltaTime: number, stopClickingActive: boolean = false, playerCurrentCPS: number = 0): number => {
  // Adapt AI CPS based on player pace (if player is actively clicking)
  let adaptedCPS = ai.clicksPerSecond;
  if (playerCurrentCPS > 0) {
    // AI tries to match or be slightly slower/faster than player
    const paceVariation = 0.8 + Math.random() * 0.4; // 80% to 120% of player pace
    const targetCPS = playerCurrentCPS * paceVariation;
    
    // Blend with AI's natural CPS based on MMR (higher MMR = better adaptation)
    const adaptationStrength = Math.min(0.8, ai.mmr / 1500); // Up to 80% adaptation for 1500+ MMR
    adaptedCPS = ai.clicksPerSecond * (1 - adaptationStrength) + targetCPS * adaptationStrength;
  }
  
  // Calculate clicks based on adapted CPS and time
  const baseClicks = adaptedCPS * (deltaTime / 1000);
  
  // Add variance to make it feel more human
  const variance = 1 + (Math.random() - 0.5) * ai.variance;
  const actualClicks = baseClicks * variance;
  
  const clicks = Math.floor(actualClicks + Math.random()); // Random chance for extra click
  
  // If stop clicking is active, AI might accidentally click (lower MMR AI more likely)
  if (stopClickingActive && clicks > 0) {
    const mistakeChance = Math.max(0.05, (1200 - ai.mmr) / 2000); // Higher MMR = lower mistake chance
    if (Math.random() < mistakeChance) {
      return -3; // Penalty for clicking during stop period
    }
    return 0; // AI successfully stopped clicking
  }
  
  return clicks;
};
