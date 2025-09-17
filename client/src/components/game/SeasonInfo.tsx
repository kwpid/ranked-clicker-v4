import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy } from "lucide-react";
import { CURRENT_SEASON } from "@/lib/constants";

export function SeasonInfo() {
  // Calculate days remaining in current season (assuming 30-day seasons)
  const seasonStartDate = new Date(2025, 8, 1); // September 1, 2025 (month is 0-indexed)
  const seasonEndDate = new Date(2025, 8, 30); // September 30, 2025
  const currentDate = new Date();
  
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.max(0, Math.ceil((seasonEndDate.getTime() - currentDate.getTime()) / msPerDay));
  
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