import { GameState, GameMode, QueueType, Team, AIPlayer, MatchResult } from "./types";
import { generateAIPlayers, simulateAIClicking } from "./aiLogic";
import { calculateEloChange, getKFactor } from "./mmrSystem";
import { GAME_SETTINGS } from "./constants";

export const createGameState = (
  gameMode: GameMode,
  queueType: QueueType,
  playerMMR: number
): GameState => {
  const playerTeam: Team = Math.random() < 0.5 ? "red" : "blue";
  
  // Generate AI players based on game mode
  let aiCount: number;
  switch (gameMode) {
    case "1v1": aiCount = 1; break;
    case "2v2": aiCount = 3; break; // 1 teammate + 2 opponents
    case "3v3": aiCount = 5; break; // 2 teammates + 3 opponents
  }
  
  const aiPlayers = generateAIPlayers(aiCount, playerMMR, gameMode, playerTeam);
  
  return {
    gameMode,
    queueType,
    players: aiPlayers,
    playerTeam,
    gamePhase: "waiting",
    countdown: GAME_SETTINGS.COUNTDOWN_TIME,
    timeRemaining: GAME_SETTINGS.MATCH_TIME,
    redScore: 0,
    blueScore: 0,
    playerClicks: 0,
    matchStarted: false,
    stopClickingActive: false,
    stopClickingTimeRemaining: 0,
    nextStopClickingIn: Math.random() * 15 + 10, // First stop clicking event in 10-25 seconds
    playerClickTimes: [],
    playerCurrentCPS: 0
  };
};

export const updateGameState = (
  state: GameState, 
  deltaTime: number, 
  playerClicked: boolean = false
): GameState => {
  const newState = { ...state };
  
  if (state.gamePhase === "countdown") {
    newState.countdown -= deltaTime / 1000;
    if (newState.countdown <= 0) {
      newState.gamePhase = "playing";
      newState.matchStarted = true;
    }
  }
  
  if (state.gamePhase === "playing") {
    // Update timer
    newState.timeRemaining -= deltaTime / 1000;
    
    // Update stop clicking mechanics
    if (state.stopClickingActive) {
      newState.stopClickingTimeRemaining -= deltaTime / 1000;
      if (newState.stopClickingTimeRemaining <= 0) {
        newState.stopClickingActive = false;
        newState.nextStopClickingIn = Math.random() * 15 + 10; // Next event in 10-25 seconds
      }
    } else {
      newState.nextStopClickingIn -= deltaTime / 1000;
      if (newState.nextStopClickingIn <= 0) {
        newState.stopClickingActive = true;
        newState.stopClickingTimeRemaining = Math.random() * 3 + 1; // 1-4 seconds
      }
    }
    
    // Handle player clicking
    if (playerClicked) {
      const currentTime = Date.now() / 1000;
      
      if (state.stopClickingActive) {
        // Penalty: lose 3 points for clicking during stop period
        if (state.playerTeam === "red") {
          newState.redScore = Math.max(0, newState.redScore - 3);
        } else {
          newState.blueScore = Math.max(0, newState.blueScore - 3);
        }
      } else {
        // Normal clicking
        newState.playerClicks += 1;
        if (state.playerTeam === "red") {
          newState.redScore += 1;
        } else {
          newState.blueScore += 1;
        }
        
        // Track click times for CPS calculation
        newState.playerClickTimes = [...state.playerClickTimes, currentTime];
        // Keep only clicks from the last 5 seconds
        newState.playerClickTimes = newState.playerClickTimes.filter(time => currentTime - time <= 5);
        
        // Calculate current CPS
        if (newState.playerClickTimes.length >= 2) {
          const timeSpan = currentTime - newState.playerClickTimes[0];
          newState.playerCurrentCPS = timeSpan > 0 ? newState.playerClickTimes.length / timeSpan : 0;
        }
      }
    }
    
    // Simulate AI clicking with pace adaptation
    state.players.forEach(ai => {
      const clicks = simulateAIClicking(ai, deltaTime, newState.stopClickingActive, newState.playerCurrentCPS);
      if (clicks > 0) {
        if (ai.team === "red") {
          newState.redScore += clicks;
        } else {
          newState.blueScore += clicks;
        }
      } else if (clicks < 0) {
        // AI clicked during stop period - penalty
        if (ai.team === "red") {
          newState.redScore = Math.max(0, newState.redScore + clicks); // clicks is negative
        } else {
          newState.blueScore = Math.max(0, newState.blueScore + clicks); // clicks is negative
        }
      }
    });
    
    // Check for game end
    if (newState.timeRemaining <= 0) {
      newState.gamePhase = "ended";
    }
  }
  
  return newState;
};

export const calculateMatchResult = (
  gameState: GameState,
  playerMMR: number,
  totalGames: number
): MatchResult => {
  const playerWon = (gameState.playerTeam === "red" && gameState.redScore > gameState.blueScore) ||
                   (gameState.playerTeam === "blue" && gameState.blueScore > gameState.redScore);
  
  const opponentMMRs = gameState.players
    .filter(ai => ai.team !== gameState.playerTeam)
    .map(ai => ai.mmr);
  
  const kFactor = getKFactor(playerMMR, totalGames);
  const mmrChange = calculateEloChange(playerMMR, opponentMMRs, playerWon, kFactor);
  const newMMR = Math.max(0, playerMMR + mmrChange);
  
  return {
    won: playerWon,
    mmrChange,
    newMMR,
    opponentMMRs: gameState.players.map(ai => ({
      username: ai.username,
      mmr: ai.mmr
    }))
  };
};

export const getPlayerTeamScore = (gameState: GameState): number => {
  return gameState.playerTeam === "red" ? gameState.redScore : gameState.blueScore;
};

export const getOpponentTeamScore = (gameState: GameState): number => {
  return gameState.playerTeam === "red" ? gameState.blueScore : gameState.redScore;
};
