import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/lib/stores/useGameStore";
import { formatRank, getRankColor } from "@/lib/rankingSystem";
import { Trophy, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

export function EndScreen() {
  const { 
    matchResult, 
    gameState, 
    selectedQueueType,
    selectedGameMode,
    playerData,
    setScreen 
  } = useGameStore();

  if (!matchResult || !gameState) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Loading results...</p>
      </div>
    );
  }

  const handleReturnToMenu = () => {
    setScreen("main-menu");
  };

  const handlePlayAgain = () => {
    setScreen("queue-selection");
  };

  const playerScore = gameState.playerTeam === "red" ? gameState.redScore : gameState.blueScore;
  const opponentScore = gameState.playerTeam === "red" ? gameState.blueScore : gameState.redScore;

  const getCurrentRank = () => {
    if (selectedQueueType === "casual") return null;
    return playerData.rank[selectedGameMode];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        
        {/* Match Result Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-3 p-6 rounded-lg mb-4 ${
            matchResult.won 
              ? "bg-green-900 border border-green-700" 
              : "bg-red-900 border border-red-700"
          }`}>
            <Trophy className={`w-12 h-12 ${matchResult.won ? "text-green-400" : "text-red-400"}`} />
            <div>
              <h1 className={`text-4xl font-bold ${matchResult.won ? "text-green-400" : "text-red-400"}`}>
                {matchResult.won ? "VICTORY!" : "DEFEAT"}
              </h1>
              <p className="text-xl text-gray-300">
                {playerScore} - {opponentScore}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary">
              {selectedQueueType.toUpperCase()}
            </Badge>
            <Badge variant="outline">
              {selectedGameMode}
            </Badge>
          </div>
        </div>

        {/* MMR Change */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              MMR Change
              {matchResult.mmrChange > 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400">Previous MMR</p>
                <p className="text-2xl font-bold text-white">
                  {matchResult.newMMR - matchResult.mmrChange}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Change</p>
                <p className={`text-2xl font-bold ${
                  matchResult.mmrChange > 0 ? "text-green-400" : "text-red-400"
                }`}>
                  {matchResult.mmrChange > 0 ? "+" : ""}{matchResult.mmrChange}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">New MMR</p>
                <p className="text-2xl font-bold text-white">
                  {matchResult.newMMR}
                </p>
                {getCurrentRank() && (
                  <p className={`text-sm font-semibold ${getRankColor(getCurrentRank()!.rank)}`}>
                    {formatRank(getCurrentRank()!.rank, getCurrentRank()!.division)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Player Performance */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Your Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Clicks</p>
                <p className="text-xl font-bold text-white">{gameState.playerClicks}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Score Contribution</p>
                <p className="text-xl font-bold text-white">{gameState.playerClicks}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">XP Gained</p>
                <p className="text-xl font-bold text-green-400">
                  +{matchResult.won ? 50 : 25}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">New Level</p>
                <p className="text-xl font-bold text-white">{playerData.level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opponents */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Match Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {matchResult.opponentMMRs.map((player, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium">{player.username}</span>
                    {gameState.players.find(p => p.username === player.username)?.title && (
                      <Badge variant="secondary" className="text-xs">
                        {gameState.players.find(p => p.username === player.username)?.title}
                      </Badge>
                    )}
                  </div>
                  <span className="text-gray-300">{player.mmr} MMR</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handlePlayAgain}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 px-8"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Play Again
          </Button>
          
          <Button
            onClick={handleReturnToMenu}
            variant="outline"
            size="lg"
            className="px-8 border-gray-600 hover:bg-gray-700"
          >
            Main Menu
          </Button>
        </div>
      </div>
    </div>
  );
}
