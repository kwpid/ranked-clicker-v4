import { useEffect, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/lib/stores/useGameStore";
import { getPlayerTeamScore, getOpponentTeamScore } from "@/lib/gameLogic";
import { formatRank, getRankColor } from "@/lib/rankingSystem";
import { useAudio } from "@/lib/stores/useAudio";

export function GameScreen() {
  const { gameState, updateGame } = useGameStore();
  const { playHit } = useAudio();
  const [lastTime, setLastTime] = useState(Date.now());

  // Game loop
  useEffect(() => {
    if (!gameState) return;

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = now - lastTime;
      setLastTime(now);

      if (gameState.gamePhase === "countdown" || gameState.gamePhase === "playing") {
        updateGame(deltaTime);
      }
    };

    const interval = setInterval(gameLoop, 16); // ~60 FPS
    return () => clearInterval(interval);
  }, [gameState, lastTime, updateGame]);

  // Handle clicking
  const handleClick = useCallback(() => {
    if (gameState?.gamePhase === "playing") {
      updateGame(0, true);
      playHit();
    }
  }, [gameState, updateGame, playHit]);

  // Add click event listener
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Only count clicks on the game area
      if ((e.target as Element)?.closest('.game-click-area')) {
        handleClick();
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [handleClick]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Loading game...</p>
      </div>
    );
  }

  const playerScore = getPlayerTeamScore(gameState);
  const opponentScore = getOpponentTeamScore(gameState);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTeamPlayers = (team: "red" | "blue") => {
    return gameState.players.filter(p => p.team === team);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              {gameState.queueType.toUpperCase()}
            </Badge>
            <Badge variant="outline">
              {gameState.gameMode}
            </Badge>
          </div>
          
          <div className="text-center">
            {gameState.gamePhase === "countdown" && (
              <div className="text-4xl font-bold text-yellow-400">
                {Math.ceil(gameState.countdown)}
              </div>
            )}
            {gameState.gamePhase === "playing" && (
              <div className="text-2xl font-bold">
                {formatTime(gameState.timeRemaining)}
              </div>
            )}
            {gameState.gamePhase === "waiting" && (
              <div className="text-lg text-gray-400">
                Waiting for players...
              </div>
            )}
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-400">Your Team</p>
            <p className="text-lg font-bold capitalize">
              {gameState.playerTeam}
            </p>
          </div>
        </div>
      </div>

      {/* Game Messages */}
      {gameState.gamePhase === "waiting" && (
        <div className="p-4 bg-blue-900 border-b border-blue-700">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-blue-200">
              {gameState.players.map(p => `${p.username} joined the match`).join(" • ")}
            </p>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Score Display */}
          <div className="grid grid-cols-3 gap-8 mb-8">
            {/* Red Team */}
            <Card className="bg-red-900 border-red-700">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-red-200 mb-2">RED TEAM</h3>
                <p className="text-4xl font-bold text-white mb-4">{gameState.redScore}</p>
                <div className="space-y-1">
                  {getTeamPlayers("red").map(player => (
                    <div key={player.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-red-200">{player.username}</span>
                        {player.title && (
                          <Badge variant="secondary" className="text-xs">
                            {player.title}
                          </Badge>
                        )}
                      </div>
                      <span className="text-red-300">{player.mmr}</span>
                    </div>
                  ))}
                  {gameState.playerTeam === "red" && (
                    <div className="flex items-center justify-between text-sm font-bold border-t border-red-700 pt-1">
                      <span className="text-red-100">You</span>
                      <span className="text-red-100">{gameState.playerClicks} clicks</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* VS */}
            <div className="flex items-center justify-center">
              <div className="text-6xl font-bold text-gray-400">VS</div>
            </div>

            {/* Blue Team */}
            <Card className="bg-blue-900 border-blue-700">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-blue-200 mb-2">BLUE TEAM</h3>
                <p className="text-4xl font-bold text-white mb-4">{gameState.blueScore}</p>
                <div className="space-y-1">
                  {getTeamPlayers("blue").map(player => (
                    <div key={player.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-200">{player.username}</span>
                        {player.title && (
                          <Badge variant="secondary" className="text-xs">
                            {player.title}
                          </Badge>
                        )}
                      </div>
                      <span className="text-blue-300">{player.mmr}</span>
                    </div>
                  ))}
                  {gameState.playerTeam === "blue" && (
                    <div className="flex items-center justify-between text-sm font-bold border-t border-blue-700 pt-1">
                      <span className="text-blue-100">You</span>
                      <span className="text-blue-100">{gameState.playerClicks} clicks</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Click Area */}
          {gameState.gamePhase === "playing" && (
            <div className="text-center">
              <div 
                className="game-click-area w-full h-64 bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors select-none"
                style={{ userSelect: 'none' }}
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-white mb-2">CLICK TO SCORE!</p>
                  <p className="text-gray-400">Click anywhere in this area to gain points for your team</p>
                </div>
              </div>
            </div>
          )}

          {/* Countdown Overlay */}
          {gameState.gamePhase === "countdown" && (
            <div className="text-center">
              <div className="w-full h-64 bg-gray-800 border-2 border-yellow-500 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-6xl font-bold text-yellow-400 mb-4">
                    {Math.ceil(gameState.countdown)}
                  </p>
                  <p className="text-xl text-gray-300">Get ready to click!</p>
                </div>
              </div>
            </div>
          )}

          {/* Waiting Overlay */}
          {gameState.gamePhase === "waiting" && (
            <div className="text-center">
              <div className="w-full h-64 bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white mb-4">Waiting for all players...</p>
                  <p className="text-gray-400">The match will start shortly</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
