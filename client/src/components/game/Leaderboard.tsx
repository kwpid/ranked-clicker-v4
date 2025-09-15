import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGameStore } from "@/lib/stores/useGameStore";
import { formatRank, getRankColor } from "@/lib/rankingSystem";
import { 
  getLeaderboard, 
  simulateMMRChanges,
  shouldShowPlayerOnLeaderboard,
  getPlayerLeaderboardPosition 
} from "@/lib/leaderboardSystem";
import { ArrowLeft, Trophy, Crown, Medal, Award } from "lucide-react";
import { GameMode } from "@/lib/types";

export function Leaderboard() {
  const { playerData, setScreen } = useGameStore();
  const [activeTab, setActiveTab] = useState<GameMode>("1v1");
  const [leaderboardData, setLeaderboardData] = useState<{
    "1v1": any[];
    "2v2": any[];
    "3v3": any[];
  }>({
    "1v1": [],
    "2v2": [],
    "3v3": []
  });

  useEffect(() => {
    // Simulate MMR changes for AI players
    simulateMMRChanges();
    
    // Load leaderboard data for all modes
    const data = {
      "1v1": getLeaderboard("1v1"),
      "2v2": getLeaderboard("2v2"),
      "3v3": getLeaderboard("3v3")
    };
    setLeaderboardData(data);
  }, []);

  const handleBack = () => {
    setScreen("main-menu");
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-300" />;
      case 3: return <Award className="w-5 h-5 text-orange-400" />;
      default: return <Crown className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-900 to-yellow-800 border-yellow-600";
      case 2: return "bg-gradient-to-r from-gray-700 to-gray-600 border-gray-500";
      case 3: return "bg-gradient-to-r from-orange-900 to-orange-800 border-orange-600";
      default: return "bg-gray-800 border-gray-700";
    }
  };

  const PlayerRow = ({ player, position, isPlayer = false }: { 
    player: any; 
    position: number; 
    isPlayer?: boolean;
  }) => (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${getPositionStyle(position)} ${isPlayer ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 w-12">
          {getRankIcon(position)}
          <span className="font-bold text-white">#{position}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${isPlayer ? 'text-blue-400' : 'text-white'}`}>
                {isPlayer ? `${player.username} (You)` : player.username}
              </span>
            </div>
            <div className={`text-sm font-semibold ${getRankColor(player.rank[activeTab].rank)}`}>
              {formatRank(player.rank[activeTab].rank, player.rank[activeTab].division)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <p className="text-lg font-bold text-white">
          {isPlayer ? playerData.rankedMMR[activeTab] : player.mmr[activeTab]}
        </p>
        <p className="text-xs text-gray-400">MMR</p>
      </div>
    </div>
  );

  // Check if player should be shown on leaderboard
  const playerPosition = getPlayerLeaderboardPosition(activeTab, playerData.rankedMMR[activeTab]);
  const showPlayer = shouldShowPlayerOnLeaderboard(activeTab, playerData.rankedMMR[activeTab]);

  // Create combined leaderboard with player if applicable
  const getCombinedLeaderboard = () => {
    const leaderboard = [...leaderboardData[activeTab]];
    
    if (showPlayer && playerPosition) {
      // Insert player at correct position
      const playerEntry = {
        username: playerData.username,
        mmr: playerData.rankedMMR,
        rank: playerData.rank,
        title: playerData.equippedTitle,
        isPlayer: true
      };
      
      leaderboard.splice(playerPosition - 1, 0, playerEntry);
      
      // Keep only top 30
      return leaderboard.slice(0, 30);
    }
    
    return leaderboard;
  };

  const combinedLeaderboard = getCombinedLeaderboard();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-8">
        
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
          <div>
            <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
            <p className="text-gray-400">Top players in ranked competitive play</p>
          </div>
        </div>

        {/* Player Status */}
        {!showPlayer && (
          <Card className="mb-6 bg-orange-900 border-orange-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-orange-400" />
                <div>
                  <p className="font-semibold text-orange-200">
                    Reach Grand Champion (1600+ MMR) to appear on the leaderboard!
                  </p>
                  <p className="text-sm text-orange-300">
                    Your current {activeTab} MMR: {playerData.rankedMMR[activeTab]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Mode Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as GameMode)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
            <TabsTrigger value="1v1" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              1v1 Solo
            </TabsTrigger>
            <TabsTrigger value="2v2" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              2v2 Doubles
            </TabsTrigger>
            <TabsTrigger value="3v3" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              3v3 Standard
            </TabsTrigger>
          </TabsList>

          {(['1v1', '2v2', '3v3'] as GameMode[]).map(mode => (
            <TabsContent key={mode} value={mode} className="mt-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    {mode} Leaderboard
                    <Badge variant="secondary" className="ml-auto">
                      Top {combinedLeaderboard.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {combinedLeaderboard.map((player, index) => (
                      <PlayerRow
                        key={player.isPlayer ? 'player' : player.id}
                        player={player}
                        position={index + 1}
                        isPlayer={player.isPlayer}
                      />
                    ))}
                    
                    {combinedLeaderboard.length === 0 && (
                      <div className="text-center py-8">
                        <Crown className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No players found for this mode</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Legend */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span>Champion</span>
                </div>
                <div className="flex items-center gap-1">
                  <Medal className="w-4 h-4 text-gray-300" />
                  <span>Runner-up</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-orange-400" />
                  <span>Third Place</span>
                </div>
              </div>
              <p>Updated in real-time</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}