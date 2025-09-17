import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { 
  GameScreen, 
  PlayerData, 
  GameState, 
  QueueState, 
  MatchResult,
  GameMode,
  QueueType
} from "../types";
import { 
  loadPlayerData, 
  savePlayerData, 
  updatePlayerMMR, 
  addXP 
} from "../localStorage";
import { createGameState, updateGameState, calculateMatchResult } from "../gameLogic";
import { completeMatch } from "../seasonSystem";
import { updateLeaderboardPositionTitles } from "../leaderboardPositionTitles";
import { POPULATION_TIMES } from "../constants";

interface GameStore {
  // Screen state
  currentScreen: GameScreen;
  
  // Player data
  playerData: PlayerData;
  
  // Game state
  gameState: GameState | null;
  queueState: QueueState;
  matchResult: MatchResult | null;
  
  // Queue settings
  selectedQueueType: QueueType;
  selectedGameMode: GameMode;
  
  // Actions
  setScreen: (screen: GameScreen) => void;
  initializePlayer: () => void;
  updateUsername: (username: string) => void;
  equipTitle: (title: string | null) => void;
  addTitle: (title: string) => void;
  
  // Queue actions
  setQueueType: (type: QueueType) => void;
  setGameMode: (mode: GameMode) => void;
  startQueue: () => void;
  cancelQueue: () => void;
  
  // Game actions
  startGame: () => void;
  updateGame: (deltaTime: number, playerClicked?: boolean) => void;
  endGame: () => void;
  
  // Utility
  saveData: () => void;
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentScreen: "main-menu",
    playerData: loadPlayerData(),
    gameState: null,
    queueState: {
      isQueuing: false,
      queueTime: 0,
      estimatedWaitTime: 30,
      populationText: "good"
    },
    matchResult: null,
    selectedQueueType: "casual",
    selectedGameMode: "1v1",
    
    // Screen management
    setScreen: (screen) => set({ currentScreen: screen }),
    
    // Player management
    initializePlayer: () => {
      const data = loadPlayerData();
      set({ playerData: data });
    },
    
    updateUsername: (username) => {
      const { playerData } = get();
      const updated = { ...playerData, username };
      set({ playerData: updated });
      savePlayerData(updated);
    },
    
    equipTitle: (title) => {
      const { playerData } = get();
      const updated = { ...playerData, equippedTitle: title };
      set({ playerData: updated });
      savePlayerData(updated);
    },

    addTitle: (title) => {
      const { playerData } = get();
      if (!playerData.titles.includes(title)) {
        const updated = { ...playerData, titles: [...playerData.titles, title] };
        // Update leaderboard position titles when player data changes
        const withLeaderboardTitles = updateLeaderboardPositionTitles(updated);
        set({ playerData: withLeaderboardTitles });
        savePlayerData(withLeaderboardTitles);
      }
    },
    
    // Queue management
    setQueueType: (type) => set({ selectedQueueType: type }),
    setGameMode: (mode) => set({ selectedGameMode: mode }),
    
    startQueue: () => {
      const { selectedQueueType, selectedGameMode, playerData } = get();
      
      // Get current population
      const hour = new Date().getHours();
      const populationText = (POPULATION_TIMES as any)[hour] || "mid";
      
      // Calculate estimated wait time based on population and MMR
      const mmr = selectedQueueType === "casual" 
        ? playerData.casualMMR 
        : playerData.rankedMMR[selectedGameMode];
      
      let baseWaitTime = 15; // Base 15 seconds
      
      // Higher MMR = longer wait times
      if (mmr > 1400) baseWaitTime += 20;
      else if (mmr > 1200) baseWaitTime += 15;
      else if (mmr > 1000) baseWaitTime += 10;
      
      // Population affects wait time
      const populationMultiplier: Record<string, number> = {
        poor: 2.5,
        bad: 2.0,
        mid: 1.5,
        good: 1.0,
        great: 0.7
      };
      const multiplier = populationMultiplier[populationText] || 1.0;
      
      const estimatedWaitTime = Math.round(baseWaitTime * multiplier);
      
      set({
        queueState: {
          isQueuing: true,
          queueTime: 0,
          estimatedWaitTime,
          populationText
        },
        currentScreen: "queue-screen"
      });
      
      // Simulate finding a match
      setTimeout(() => {
        const { queueState } = get();
        if (queueState.isQueuing) {
          get().startGame();
        }
      }, Math.random() * 10000 + 5000); // 5-15 seconds
    },
    
    cancelQueue: () => {
      set({
        queueState: {
          isQueuing: false,
          queueTime: 0,
          estimatedWaitTime: 30,
          populationText: "good"
        },
        currentScreen: "queue-selection"
      });
    },
    
    // Game management
    startGame: () => {
      const { selectedQueueType, selectedGameMode, playerData } = get();
      const playerMMR = selectedQueueType === "casual" 
        ? playerData.casualMMR 
        : playerData.rankedMMR[selectedGameMode];
      
      const gameState = createGameState(selectedGameMode, selectedQueueType, playerMMR);
      
      set({
        gameState,
        currentScreen: "game",
        queueState: {
          isQueuing: false,
          queueTime: 0,
          estimatedWaitTime: 30,
          populationText: "good"
        }
      });
      
      // Start countdown after AI joins
      setTimeout(() => {
        const current = get().gameState;
        if (current && current.gamePhase === "waiting") {
          set({
            gameState: { ...current, gamePhase: "countdown" }
          });
        }
      }, 2000);
    },
    
    updateGame: (deltaTime, playerClicked = false) => {
      const { gameState } = get();
      if (!gameState) return;
      
      const newState = updateGameState(gameState, deltaTime, playerClicked);
      set({ gameState: newState });
      
      if (newState.gamePhase === "ended" && gameState.gamePhase !== "ended") {
        get().endGame();
      }
    },
    
    endGame: () => {
      const { gameState, playerData, selectedQueueType, selectedGameMode } = get();
      if (!gameState) return;
      
      const currentMMR = selectedQueueType === "casual" 
        ? playerData.casualMMR 
        : playerData.rankedMMR[selectedGameMode];
      
      const result = calculateMatchResult(gameState, currentMMR, playerData.totalGames);
      
      // Update player data
      let updatedData = updatePlayerMMR(playerData, selectedGameMode, selectedQueueType, result.newMMR);
      
      // Add XP (more for wins)
      const xpGain = result.won ? 50 : 25;
      updatedData = addXP(updatedData, xpGain);
      
      // Update match completion (ranked only)
      if (selectedQueueType === "ranked") {
        updatedData = completeMatch(updatedData, selectedGameMode, result.won, result.newMMR);
      }
      
      // Save data
      savePlayerData(updatedData);
      
      set({
        playerData: updatedData,
        matchResult: result,
        currentScreen: "end-screen"
      });
    },
    
    saveData: () => {
      const { playerData } = get();
      savePlayerData(playerData);
    }
  }))
);
