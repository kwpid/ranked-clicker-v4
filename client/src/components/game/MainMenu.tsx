import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/lib/stores/useGameStore";
import { formatRank, getRankColor } from "@/lib/rankingSystem";
import { Settings, Trophy, BarChart3, Crown, Zap } from "lucide-react";

export function MainMenu() {
  const { playerData, setScreen, setQueueType } = useGameStore();
  const isRankedUnlocked = playerData.level >= 5;

  const handleCasualQueue = () => {
    setQueueType("casual");
    setScreen("queue-selection");
  };

  const handleRankedQueue = () => {
    if (isRankedUnlocked) {
      setQueueType("ranked");
      setScreen("queue-selection");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            RANKED CLICKER
          </h1>
          <p className="text-xl text-gray-300">
            Competitive clicking at its finest
          </p>
        </div>

        {/* Player Card */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  {playerData.equippedTitle && (
                    <Badge variant="secondary" className="mr-2">
                      {playerData.equippedTitle}
                    </Badge>
                  )}
                  {playerData.username}
                </CardTitle>
                <p className="text-gray-400">Level {playerData.level}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Casual MMR</p>
                <p className="text-lg font-bold text-white">{playerData.casualMMR}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Menu Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Casual Queue */}
          <Card className="bg-blue-900 border-blue-700 hover:bg-blue-800 transition-colors cursor-pointer">
            <CardContent className="p-8" onClick={handleCasualQueue}>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">CASUAL QUEUE</h3>
                <p className="text-blue-200 mb-4">
                  Relaxed gameplay with shared MMR across all modes
                </p>
                <p className="text-sm text-blue-300">
                  Current MMR: {playerData.casualMMR}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ranked Queue */}
          <Card 
            className={`${
              isRankedUnlocked 
                ? "bg-purple-900 border-purple-700 hover:bg-purple-800 cursor-pointer" 
                : "bg-gray-700 border-gray-600 cursor-not-allowed opacity-60"
            } transition-colors`}
          >
            <CardContent className="p-8" onClick={handleRankedQueue}>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-6 h-6" />
                  <h3 className="text-2xl font-bold text-white">RANKED QUEUE</h3>
                </div>
                {isRankedUnlocked ? (
                  <>
                    <p className="text-purple-200 mb-4">
                      Competitive play with separate MMR per mode
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>1v1:</span>
                        <span className={getRankColor(playerData.rank["1v1"].rank)}>
                          {formatRank(playerData.rank["1v1"].rank, playerData.rank["1v1"].division)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>2v2:</span>
                        <span className={getRankColor(playerData.rank["2v2"].rank)}>
                          {formatRank(playerData.rank["2v2"].rank, playerData.rank["2v2"].division)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>3v3:</span>
                        <span className={getRankColor(playerData.rank["3v3"].rank)}>
                          {formatRank(playerData.rank["3v3"].rank, playerData.rank["3v3"].division)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400">
                    Unlocks at Level 5 (Current: {playerData.level})
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Options */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-16 bg-gray-800 border-gray-600 hover:bg-gray-700"
            onClick={() => setScreen("settings")}
          >
            <div className="flex flex-col items-center gap-1">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-16 bg-gray-800 border-gray-600 hover:bg-gray-700"
            onClick={() => setScreen("titles")}
          >
            <div className="flex flex-col items-center gap-1">
              <Trophy className="w-5 h-5" />
              <span>Titles</span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-16 bg-gray-800 border-gray-600 hover:bg-gray-700"
            onClick={() => setScreen("stats")}
          >
            <div className="flex flex-col items-center gap-1">
              <BarChart3 className="w-5 h-5" />
              <span>Stats</span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-16 bg-gray-800 border-gray-600 hover:bg-gray-700"
            onClick={() => setScreen("leaderboard")}
          >
            <div className="flex flex-col items-center gap-1">
              <Crown className="w-5 h-5" />
              <span>Leaderboard</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
