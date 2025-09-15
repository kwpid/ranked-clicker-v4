import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGameStore } from "@/lib/stores/useGameStore";
import { useAudio } from "@/lib/stores/useAudio";
import { ArrowLeft, Save, Volume2, VolumeX } from "lucide-react";

export function SettingsMenu() {
  const { playerData, updateUsername, setScreen } = useGameStore();
  const { isMuted, toggleMute } = useAudio();
  const [username, setUsername] = useState(playerData.username);

  const handleBack = () => {
    setScreen("main-menu");
  };

  const handleSave = () => {
    if (username.trim() && username !== playerData.username) {
      updateUsername(username.trim());
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Limit to 20 characters and alphanumeric + spaces
    if (value.length <= 20 && /^[a-zA-Z0-9\s]*$/.test(value)) {
      setUsername(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto py-8">
        
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
          <h1 className="text-4xl font-bold text-white">Settings</h1>
        </div>

        {/* Username Settings */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Player Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="username"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="Enter your username"
                  className="bg-gray-700 border-gray-600 text-white"
                  maxLength={20}
                />
                <Button 
                  onClick={handleSave}
                  disabled={!username.trim() || username === playerData.username}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Max 20 characters, letters and numbers only
              </p>
            </div>
            
            <div className="pt-4 border-t border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Current Username</p>
                  <p className="text-lg font-semibold text-white">{playerData.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300">Level</p>
                  <p className="text-lg font-semibold text-white">{playerData.level}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audio Settings */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Audio Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Sound Effects</Label>
                <p className="text-sm text-gray-400">
                  Enable or disable click sounds and feedback
                </p>
              </div>
              <Button
                onClick={toggleMute}
                variant={isMuted ? "outline" : "default"}
                size="sm"
                className={isMuted ? "border-gray-600" : "bg-green-600 hover:bg-green-700"}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-4 h-4 mr-2" />
                    Muted
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Enabled
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Game Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Game Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Total Games</p>
                <p className="text-lg font-semibold text-white">{playerData.totalGames}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Wins</p>
                <p className="text-lg font-semibold text-white">{playerData.totalWins}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-lg font-semibold text-white">
                  {playerData.totalGames > 0 
                    ? `${Math.round((playerData.totalWins / playerData.totalGames) * 100)}%`
                    : "N/A"
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Casual MMR</p>
                <p className="text-lg font-semibold text-white">{playerData.casualMMR}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-600">
              <p className="text-sm text-gray-400 mb-2">Ranked Progress</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">1v1 Placement:</span>
                  <span className="text-sm text-white">
                    {playerData.placementMatches["1v1"]}/5
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">2v2 Placement:</span>
                  <span className="text-sm text-white">
                    {playerData.placementMatches["2v2"]}/5
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">3v3 Placement:</span>
                  <span className="text-sm text-white">
                    {playerData.placementMatches["3v3"]}/5
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
