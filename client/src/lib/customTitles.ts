import { TitleType } from "./types";

export interface CustomTitle {
  id: string;
  name: string;
  type: TitleType;
  description: string;
  color: string;
  glow: string | null; // CSS class for glow effect
  unlocked?: boolean;
  owned?: boolean;
}

// Custom titles that can be configured in code
export const CUSTOM_TITLES: CustomTitle[] = [
  {
    id: "rccs_s1_contender",
    name: "RCCS S1 CONTENDER",
    type: "Custom",
    description: "Participated in RCCS Season 1",
    color: "text-cyan-400",
    glow: "title-glow-aqua",
    unlocked: true,
    owned: false
  },
  {
    id: "rccs_s1_regional_finalist",
    name: "RCCS S1 REGIONAL FINALIST",
    type: "Custom",
    description: "Finish top 6 in a RCCS Regional",
    color: "text-cyan-400",
    glow: "title-glow-aqua",
    unlocked: true,
    owned: false
  },
  {
    id: "rccs_s1_regional_champion",
    name: "RCCS S1 REGIONAL CHAMPION",
    type: "Custom",
    description: "Finish top 1 in a RCCS Regional",
    color: "text-cyan-400",
    glow: "title-glow-aqua",
    unlocked: true,
    owned: false
  },
  {
    id: "rccs_s1_regional_finalist",
    name: "RCCS S1 REGIONAL FINALIST",
    type: "Custom",
    description: "Finish top 6 in a RCCS Regional",
    color: "text-cyan-400",
    glow: "title-glow-aqua",
    unlocked: true,
    owned: false
  },
  {
    id: "rccs_s1_champion",
    name: "RCCS S1 CHAMPION",
    type: "Custom", 
    description: "Won RCCS Season 1",
    color: "text-yellow-400",
    glow: "title-glow-golden",
    unlocked: false,
    owned: false
  },
  {
    id: "beta_tester",
    name: "BETA TESTER",
    type: "Custom",
    description: "Participated in the beta",
    color: "text-purple-400",
    glow: null,
    unlocked: true,
    owned: false
  },
  {
    id: "developer",
    name: "DEVELOPER",
    type: "Custom",
    description: "Game developer",
    color: "text-red-400",
    glow: "title-glow-custom",
    unlocked: false,
    owned: false
  }
];

// Function to get leaderboard position titles
export const getLeaderboardPositionTitle = (position: number, gameMode: string): CustomTitle | null => {
  if (position > 30) return null;
  
  return {
    id: `ranked_${position}_${gameMode}`,
    name: `RANKED #${position} (${gameMode.toUpperCase()})`,
    type: "Leaderboard",
    description: `Top ${position} in ${gameMode} leaderboard`,
    color: "text-white",
    glow: "title-glow-rainbow",
    unlocked: true,
    owned: true
  };
};

// Function to apply custom glow style
export const getCustomGlowStyle = (glowClass: string | null, customColor?: string): React.CSSProperties => {
  if (!glowClass) return {};
  
  if (glowClass === "title-glow-custom" && customColor) {
    return {
      color: customColor,
      textShadow: `0 0 8px ${customColor}80, 0 0 16px ${customColor}60`,
      fontWeight: 'bold'
    };
  }
  
  return {};
};