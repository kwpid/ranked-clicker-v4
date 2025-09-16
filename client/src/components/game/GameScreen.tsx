import { useEffect, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/lib/stores/useGameStore";
import { getPlayerTeamScore, getOpponentTeamScore } from "@/lib/gameLogic";
import { formatRank, getRankColor } from "@/lib/rankingSystem";
import { useAudio } from "@/lib/stores/useAudio";

export function GameScreen() {
  const { gameState, updateGame, playerData } = useGameStore();
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

  // Add spacebar support for clicking during gameplay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameState?.gamePhase === "playing") {
        e.preventDefault(); // Prevent default spacebar behavior (scrolling)
        handleClick();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClick, gameState]);

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
            <Card className="bg-gray-800 border-2 border-red-600">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-red-200 mb-2">RED TEAM</h3>
                <p className="text-4xl font-bold text-white mb-4">{gameState.redScore}</p>
                <div className="space-y-2">
                  {getTeamPlayers("red").map(player => (
                    <div key={player.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-red-200 font-semibold">{player.username}</span>
                        <span className="text-red-300">{player.mmr}</span>
                      </div>
                      {player.title && (
                        <div className={`text-xs mt-1 ${
                          player.title.includes('RCCS') ? 'title-glow-aqua' :
                          player.title.includes('ELITE') ? 'title-glow-golden' :
                          player.title === 'LEGEND' ? 'title-glow-legend' :
                          'text-red-400'
                        }`}>
                          {player.title}
                        </div>
                      )}
                    </div>
                  ))}
                  {gameState.playerTeam === "red" && (
                    <div className="text-sm font-bold border-t border-red-700 pt-2 bg-red-800 rounded p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-red-100 font-bold">{playerData.username}</span>
                        <span className="text-red-100">{gameState.playerClicks} clicks</span>
                      </div>
                      {playerData.equippedTitle && (
                        <div className={`text-xs mt-1 ${
                          playerData.equippedTitle.includes('RCCS') ? 'title-glow-aqua' :
                          playerData.equippedTitle.includes('ELITE') ? 'title-glow-golden' :
                          playerData.equippedTitle === 'LEGEND' ? 'title-glow-legend' :
                          'text-red-300'
                        }`}>
                          {playerData.equippedTitle}
                        </div>
                      )}
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
            <Card className="bg-gray-800 border-2 border-blue-600">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-blue-200 mb-2">BLUE TEAM</h3>
                <p className="text-4xl font-bold text-white mb-4">{gameState.blueScore}</p>
                <div className="space-y-2">
                  {getTeamPlayers("blue").map(player => (
                    <div key={player.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-200 font-semibold">{player.username}</span>
                        <span className="text-blue-300">{player.mmr}</span>
                      </div>
                      {player.title && (
                        <div className={`text-xs mt-1 ${
                          player.title.includes('RCCS') ? 'title-glow-aqua' :
                          player.title.includes('ELITE') ? 'title-glow-golden' :
                          player.title === 'LEGEND' ? 'title-glow-legend' :
                          'text-blue-400'
                        }`}>
                          {player.title}
                        </div>
                      )}
                    </div>
                  ))}
                  {gameState.playerTeam === "blue" && (
                    <div className="text-sm font-bold border-t border-blue-700 pt-2 bg-blue-800 rounded p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-100 font-bold">{playerData.username}</span>
                        <span className="text-blue-100">{gameState.playerClicks} clicks</span>
                      </div>
                      {playerData.equippedTitle && (
                        <div className={`text-xs mt-1 ${
                          playerData.equippedTitle.includes('RCCS') ? 'title-glow-aqua' :
                          playerData.equippedTitle.includes('ELITE') ? 'title-glow-golden' :
                          playerData.equippedTitle === 'LEGEND' ? 'title-glow-legend' :
                          'text-blue-300'
                        }`}>
                          {playerData.equippedTitle}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stop Clicking Warning - Prominent and Clear */}
          {gameState.gamePhase === "playing" && gameState.stopClickingActive && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-red-900 border-4 border-red-500 rounded-lg p-8 animate-pulse max-w-md mx-4 text-center">
                <div className="text-6xl mb-4">🛑</div>
                <p className="text-4xl font-bold text-red-100 mb-4">STOP CLICKING!</p>
                <div className="text-6xl font-bold text-red-200 mb-4">
                  {Math.ceil(gameState.stopClickingTimeRemaining)}
                </div>
                <p className="text-lg text-red-300 mb-2">seconds remaining</p>
                <p className="text-red-400">⚠️ Clicking now will lose you 3 points! ⚠️</p>
              </div>
            </div>
          )}
          
          {/* Stop Clicking Warning Banner */}
          {gameState.gamePhase === "playing" && gameState.stopClickingActive && (
            <div className="text-center mb-4">
              <div className="bg-red-900 border-2 border-red-500 rounded-lg p-4 animate-pulse">
                <p className="text-2xl font-bold text-red-300 mb-1">🛑 STOP CLICKING! 🛑</p>
                <p className="text-xl text-red-200">
                  {Math.ceil(gameState.stopClickingTimeRemaining)}s remaining
                </p>
              </div>
            </div>
          )}

          {/* Click Area */}
          {gameState.gamePhase === "playing" && (
            <div className="text-center">
              <div 
                className={`game-click-area w-full h-64 border-2 rounded-lg flex items-center justify-center transition-colors select-none ${
                  gameState.stopClickingActive 
                    ? 'bg-red-900 border-red-500 cursor-not-allowed' 
                    : 'bg-gray-800 border-gray-600 cursor-pointer hover:bg-gray-700'
                }`}
                style={{ userSelect: 'none' }}
              >
                <div className="text-center">
                  {gameState.stopClickingActive ? (
                    <>
                      <p className="text-2xl font-bold text-red-300 mb-2">DON'T CLICK!</p>
                      <p className="text-red-400">Wait for the stop period to end</p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-white mb-2">CLICK TO SCORE!</p>
                      <p className="text-gray-400">Click anywhere in this area to gain points for your team</p>
                    </>
                  )}
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
