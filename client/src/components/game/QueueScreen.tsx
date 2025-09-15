import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/lib/stores/useGameStore";
import { Loader2, X } from "lucide-react";

export function QueueScreen() {
  const { 
    queueState, 
    selectedQueueType, 
    selectedGameMode,
    playerData,
    cancelQueue
  } = useGameStore();

  // Update queue time
  useEffect(() => {
    if (!queueState.isQueuing) return;

    const interval = setInterval(() => {
      useGameStore.setState(state => ({
        queueState: {
          ...state.queueState,
          queueTime: state.queueState.queueTime + 1
        }
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [queueState.isQueuing]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPopulationColor = (population: string): string => {
    switch (population) {
      case "poor": return "text-red-400";
      case "bad": return "text-orange-400";
      case "mid": return "text-yellow-400";
      case "good": return "text-green-400";
      case "great": return "text-blue-400";
      default: return "text-gray-400";
    }
  };

  const getCurrentMMR = () => {
    if (selectedQueueType === "casual") {
      return playerData.casualMMR;
    }
    return playerData.rankedMMR[selectedGameMode];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            SEARCHING FOR MATCH
          </h1>
          <div className="flex items-center justify-center gap-4 mb-4">
            <Badge variant="secondary">
              {selectedQueueType.toUpperCase()}
            </Badge>
            <Badge variant="outline">
              {selectedGameMode}
            </Badge>
          </div>
          <p className="text-gray-300">
            MMR: {getCurrentMMR()}
          </p>
        </div>

        {/* Queue Status */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Loading Animation */}
              <div className="flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              </div>

              {/* Queue Time */}
              <div>
                <p className="text-sm text-gray-400 mb-1">Time in Queue</p>
                <p className="text-3xl font-bold text-white">
                  {formatTime(queueState.queueTime)}
                </p>
              </div>

              {/* Estimated Wait Time */}
              <div>
                <p className="text-sm text-gray-400 mb-1">Estimated Wait Time</p>
                <p className="text-xl font-semibold text-blue-400">
                  {formatTime(queueState.estimatedWaitTime)}
                </p>
              </div>

              {/* Population */}
              <div>
                <p className="text-sm text-gray-400 mb-1">Playlist Population</p>
                <p className={`text-lg font-semibold uppercase ${getPopulationColor(queueState.populationText)}`}>
                  {queueState.populationText}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue Info */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-400">Match Time</p>
                <p className="text-sm font-semibold text-white">60s</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Score Limit</p>
                <p className="text-sm font-semibold text-white">None</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Best of</p>
                <p className="text-sm font-semibold text-white">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancel Button */}
        <div className="text-center">
          <Button
            onClick={cancelQueue}
            variant="destructive"
            size="lg"
            className="px-8 py-3"
          >
            <X className="w-5 h-5 mr-2" />
            CANCEL QUEUE
          </Button>
        </div>

        {/* Tips */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            💡 Tip: Higher MMR players may experience longer queue times
          </p>
        </div>
      </div>
    </div>
  );
}
