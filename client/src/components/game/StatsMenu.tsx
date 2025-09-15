import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGameStore } from "@/lib/stores/useGameStore";
import { formatRank, getRankColor, getSeasonRewardProgress } from "@/lib/rankingSystem";
import { ArrowLeft, Trophy, Target, TrendingUp, Award } from "lucide-react";
import { CURRENT_SEASON } from "@/lib/constants";

export function StatsMenu() {
  const { playerData, setScreen } = useGameStore();

  const handleBack = () => {
    setScreen("main-menu");
  };

  const getWinRate = () => {
    if (playerData.totalGames === 0) return 0;
    return Math.round((playerData.totalWins / playerData.totalGames) * 100);
  };

  const getXPProgress = () => {
    const currentLevelXP = playerData.level * 100;
    return (playerData.xp / currentLevelXP) * 100;
  };

  const getSeasonProgress = (mode: "1v1" | "2v2" | "3v3") => {
    const wins = playerData.seasonWins[mode];
    const currentRank = playerData.rank[mode].rank;
    return getSeasonRewardProgress(wins, currentRank);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mr-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-white">Statistics</h1>
        </div>

        {/* Player Overview */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Player Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{playerData.level}</p>
                <p className="text-sm text-gray-400">Level</p>
                <div className="mt-2">
                  <Progress value={getXPProgress()} className="h-2" />
                  <p className="text-xs text-gray-400 mt-1">
                    {playerData.xp}/{playerData.level * 100} XP
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{playerData.totalGames}</p>
                <p className="text-sm text-gray-400">Total Games</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{playerData.totalWins}</p>
                <p className="text-sm text-gray-400">Total Wins</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{getWinRate()}%</p>
                <p className="text-sm text-gray-400">Win Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Casual Stats */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5" />
              Casual Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Current MMR</p>
                <p className="text-3xl font-bold text-white">{playerData.casualMMR}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Peak MMR</p>
                <p className="text-3xl font-bold text-yellow-400">{playerData.peakMMR.casual}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ranked Stats */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Ranked Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(["1v1", "2v2", "3v3"] as const).map(mode => {
                const rank = playerData.rank[mode];
                const seasonProgress = getSeasonProgress(mode);
                const isPlacementComplete = playerData.isPlacementComplete[mode];
                
                return (
                  <div key={mode} className="border-b border-gray-700 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{mode}</h3>
                      <Badge className={getRankColor(rank.rank)}>
                        {formatRank(rank.rank, rank.division)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Current MMR</p>
                        <p className="text-xl font-bold text-white">{playerData.rankedMMR[mode]}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Peak MMR</p>
                        <p className="text-xl font-bold text-yellow-400">{playerData.peakMMR.ranked[mode]}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Season Wins</p>
                        <p className="text-xl font-bold text-green-400">{playerData.seasonWins[mode]}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Placement</p>
                        {isPlacementComplete ? (
                          <p className="text-xl font-bold text-blue-400">Complete</p>
                        ) : (
                          <p className="text-xl font-bold text-orange-400">
                            {playerData.placementMatches[mode]}/5
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Season Reward Progress */}
                    {isPlacementComplete && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-400">Season {CURRENT_SEASON} Rewards</p>
                          <p className="text-sm text-gray-300">
                            {seasonProgress.progress}/10 wins for next reward
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRankColor(seasonProgress.current)}>
                            {seasonProgress.current}
                          </Badge>
                          <Progress 
                            value={(seasonProgress.progress / seasonProgress.total) * 100} 
                            className="flex-1 h-2" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="w-5 h-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="font-semibold text-white">Titles Collected</p>
                    <p className="text-2xl font-bold text-yellow-400">{playerData.titles.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="font-semibold text-white">Ranked Unlocked</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {playerData.level >= 5 ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Achievements */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white mb-3">Recent Titles</h4>
              <div className="flex flex-wrap gap-2">
                {playerData.titles.slice(-5).map(title => (
                  <Badge key={title} variant="secondary">
                    {title}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
