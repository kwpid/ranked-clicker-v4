import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy } from "lucide-react";
import { CURRENT_SEASON, SEASON_START_DATE, SEASON_END_DATE } from "@/lib/constants";

export function SeasonInfo() {
  // Calculate days remaining in current season
  const currentDate = new Date();
  
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.max(0, Math.ceil((SEASON_END_DATE.getTime() - currentDate.getTime()) / msPerDay));
  
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <div>
              <Badge variant="default" className="bg-yellow-600 text-yellow-100">
                Season {CURRENT_SEASON}
              </Badge>
              <p className="text-sm text-gray-400 mt-1">Competitive Season</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-gray-300">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{daysRemaining} days left</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {daysRemaining > 7 ? "Season active" : "Season ending soon!"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}