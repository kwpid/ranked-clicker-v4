import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/lib/stores/useGameStore";
import { ArrowLeft, Trophy, Crown, Target, Award } from "lucide-react";
import { 
  getCurrentRCCSWeek, 
  getWeekDescription, 
  createRCCSTournament,
  generateAITournamentResults,
  updatePlayerDataWithRCCSTitle,
  checkEliteTitle,
  RCCS_TITLES
} from "@/lib/rccsSystem";
import { GameMode } from "@/lib/types";
import { useState } from "react";

export function RCCSMenu() {
  const { playerData, setScreen, saveData } = useGameStore();
  const [selectedMode, setSelectedMode] = useState<GameMode>("1v1");
  const [tournamentResult, setTournamentResult] = useState<any>(null);

  const currentWeek = getCurrentRCCSWeek();
  const weekDescription = getWeekDescription(currentWeek);

  const handleBack = () => {
    setScreen("main-menu");
  };

  const handleEnterTournament = () => {
    if (currentWeek === 1) {
      // Week 1 is break week
      return;
    }

    let tournamentType: any;
    if (currentWeek === 2) tournamentType = "Regional1";
    else if (currentWeek === 3) tournamentType = "Regional2";
    else if (currentWeek === 4) {
      // For now, just do Major. Worlds would require qualifying from Major
      tournamentType = "Major";
    }

    const tournament = createRCCSTournament(tournamentType, currentWeek, selectedMode, 1);
    const playerMMR = playerData.rankedMMR[selectedMode];
    const result = generateAITournamentResults(tournament, playerMMR);
    
    setTournamentResult({
      tournament,
      ...result
    });

    // Update player data with earned title
    if (result.earnedTitle) {
      const updatedData = updatePlayerDataWithRCCSTitle(playerData, result.earnedTitle);
      
      // Check for elite title
      const eliteTitle = checkEliteTitle(updatedData, 1);
      const finalData = eliteTitle ? updatePlayerDataWithRCCSTitle(updatedData, eliteTitle) : updatedData;
      
      useGameStore.setState({ playerData: finalData });
      saveData();
    }
  };

  const getRCCSTitles = () => {
    return playerData.titles.filter(title => title.includes('RCCS'));
  };

  const getTournamentIcon = (week: number) => {
    switch (week) {
      case 1: return <Target className="w-5 h-5" />;
      case 2: case 3: return <Trophy className="w-5 h-5" />;
      case 4: return <Crown className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  const rccsData = {
    currentPoints: 150, // Mock data
    currentRank: "12th",
    tournamentsEntered: 3,
    bestFinish: "2nd (Regional 1)"
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto py-8">
        
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
          <h1 className="text-4xl font-bold text-white">RCCS Championship</h1>
        </div>

        {/* Current Week Status */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {getTournamentIcon(currentWeek)}
              Week {currentWeek}: {weekDescription}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentWeek === 1 ? (
              <div>
                <p className="text-gray-300 mb-4">
                  It's break week! The ranked ladder has been reset. 
                  Play ranked matches to establish your MMR for the upcoming tournaments.
                </p>
                <p className="text-yellow-400">No tournaments available this week.</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-300 mb-4">
                  {currentWeek === 2 || currentWeek === 3 ? 
                    "Regional tournament is active! Open qualifiers with Swiss stage and playoffs." :
                    "Major tournament week! Only top RCCS point earners qualify."
                  }
                </p>
                
                {/* Game Mode Selection */}
                <div className="flex gap-2 mb-4">
                  {(["1v1", "2v2", "3v3"] as GameMode[]).map(mode => (
                    <Button
                      key={mode}
                      variant={selectedMode === mode ? "default" : "outline"}
                      onClick={() => setSelectedMode(mode)}
                      size="sm"
                    >
                      {mode}
                    </Button>
                  ))}
                </div>

                <Button 
                  onClick={handleEnterTournament}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!!tournamentResult}
                >
                  {tournamentResult ? "Already Participated" : `Enter ${selectedMode} Tournament`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tournament Result */}
        {tournamentResult && (
          <Card className="mb-8 bg-green-900 border-green-600">
            <CardHeader>
              <CardTitle className="text-white">Tournament Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-green-200">
                  <strong>Placement:</strong> #{tournamentResult.placement} out of {tournamentResult.totalParticipants}
                </p>
                <p className="text-green-200">
                  <strong>Tournament:</strong> {tournamentResult.tournament.name}
                </p>
                {tournamentResult.earnedTitle && (
                  <div className="mt-4 p-3 bg-green-800 rounded">
                    <p className="text-green-100 font-bold">🏆 Title Earned!</p>
                    <p className="title-glow-aqua text-sm">{tournamentResult.earnedTitle}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* RCCS Stats */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Your RCCS Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">RCCS Points:</span>
                  <span className="text-blue-400 font-bold">{rccsData.currentPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Current Rank:</span>
                  <span className="text-yellow-400 font-bold">{rccsData.currentRank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Tournaments Entered:</span>
                  <span className="text-white">{rccsData.tournamentsEntered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Best Finish:</span>
                  <span className="text-green-400">{rccsData.bestFinish}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RCCS Titles */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">RCCS Titles</CardTitle>
            </CardHeader>
            <CardContent>
              {getRCCSTitles().length > 0 ? (
                <div className="space-y-2">
                  {getRCCSTitles().map(title => (
                    <div key={title} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                      <span className={`font-semibold ${
                        title.includes('ELITE') ? 'title-glow-golden' : 'title-glow-aqua'
                      }`}>
                        {title}
                      </span>
                      <Badge variant="secondary">
                        {title.includes('ELITE') ? 'Elite' : 'RCCS'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No RCCS titles earned yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tournament Schedule */}
        <Card className="mt-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">RCCS Monthly Cycle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(week => (
                <div key={week} className={`p-4 rounded-lg border-2 ${
                  week === currentWeek ? 'border-blue-500 bg-blue-900' : 'border-gray-600 bg-gray-700'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getTournamentIcon(week)}
                    <h3 className="font-bold">Week {week}</h3>
                  </div>
                  <p className="text-sm text-gray-300">
                    {getWeekDescription(week as any)}
                  </p>
                  {week === currentWeek && (
                    <Badge className="mt-2 bg-blue-600">Current Week</Badge>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-sm text-gray-400">
              <p><strong>Format:</strong> Open Qualifiers → Swiss Stage → Playoffs</p>
              <p><strong>Match Rules:</strong> Best of 5 (Bo5), Finals = Best of 7 (Bo7)</p>
              <p><strong>All opponents are AI</strong> with skill levels matching your MMR range</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}