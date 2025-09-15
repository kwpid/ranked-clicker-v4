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
    matchStarted: false
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
    
    // Handle player clicking
    if (playerClicked) {
      newState.playerClicks += 1;
      if (state.playerTeam === "red") {
        newState.redScore += 1;
      } else {
        newState.blueScore += 1;
      }
    }
    
    // Simulate AI clicking
    state.players.forEach(ai => {
      const clicks = simulateAIClicking(ai, deltaTime);
      if (ai.team === "red") {
        newState.redScore += clicks;
      } else {
        newState.blueScore += clicks;
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
