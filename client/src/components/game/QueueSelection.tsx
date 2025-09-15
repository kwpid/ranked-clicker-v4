import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/lib/stores/useGameStore";
import { formatRank, getRankColor } from "@/lib/rankingSystem";
import { ArrowLeft, Users, UserCheck, Users2 } from "lucide-react";
import { GameMode } from "@/lib/types";

export function QueueSelection() {
  const { 
    playerData, 
    selectedQueueType, 
    selectedGameMode,
    setScreen, 
    setGameMode, 
    startQueue 
  } = useGameStore();

  const handleBack = () => {
    setScreen("main-menu");
  };

  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
  };

  const handleStartQueue = () => {
    startQueue();
  };

  const getCurrentMMR = () => {
    if (selectedQueueType === "casual") {
      return playerData.casualMMR;
    }
    return playerData.rankedMMR[selectedGameMode];
  };

  const getCurrentRank = () => {
    if (selectedQueueType === "casual") {
      return null;
    }
    return playerData.rank[selectedGameMode];
  };

  const getModeIcon = (mode: GameMode) => {
    switch (mode) {
      case "1v1": return <UserCheck className="w-8 h-8" />;
      case "2v2": return <Users className="w-8 h-8" />;
      case "3v3": return <Users2 className="w-8 h-8" />;
    }
  };

  const getModeDescription = (mode: GameMode) => {
    switch (mode) {
      case "1v1": return "Solo combat - 1 vs 1";
      case "2v2": return "Team combat - 2 vs 2";
      case "3v3": return "Large team - 3 vs 3";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
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
            <h1 className="text-4xl font-bold text-white mb-2">
              {selectedQueueType === "casual" ? "CASUAL QUEUE" : "RANKED QUEUE"}
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-300">
                Current MMR: {getCurrentMMR()}
              </p>
              {getCurrentRank() && (
                <Badge className={getRankColor(getCurrentRank()!.rank)}>
                  {formatRank(getCurrentRank()!.rank, getCurrentRank()!.division)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Game Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {(["1v1", "2v2", "3v3"] as GameMode[]).map((mode) => (
            <Card
              key={mode}
              className={`cursor-pointer transition-all duration-200 ${
                selectedGameMode === mode
                  ? "bg-blue-900 border-blue-600 ring-2 ring-blue-500"
                  : "bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600"
              }`}
              onClick={() => handleModeSelect(mode)}
            >
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  {getModeIcon(mode)}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{mode}</h3>
                    <p className="text-gray-300 mb-4">{getModeDescription(mode)}</p>
                    
                    {selectedQueueType === "ranked" && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-400">
                          MMR: {playerData.rankedMMR[mode]}
                        </div>
                        <div className={`text-sm font-semibold ${getRankColor(playerData.rank[mode].rank)}`}>
                          {formatRank(playerData.rank[mode].rank, playerData.rank[mode].division)}
                        </div>
                        {!playerData.isPlacementComplete[mode] && (
                          <Badge variant="secondary" className="text-xs">
                            Placement: {playerData.placementMatches[mode]}/5
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Queue Information */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Queue Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400">Match Time</p>
                <p className="text-lg font-semibold text-white">60 seconds</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Score Limit</p>
                <p className="text-lg font-semibold text-white">No limit</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Best of</p>
                <p className="text-lg font-semibold text-white">1 match</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Queue Button */}
        <div className="text-center">
          <Button
            onClick={handleStartQueue}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 text-xl font-bold"
          >
            START QUEUE
          </Button>
        </div>
      </div>
    </div>
  );
}
