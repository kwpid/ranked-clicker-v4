import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/lib/stores/useGameStore";
import { getRankColor } from "@/lib/rankingSystem";
import { ArrowLeft, Crown, Trophy, Star, CheckCircle } from "lucide-react";
import { CURRENT_SEASON } from "@/lib/constants";

export function TitlesMenu() {
  const { playerData, equipTitle, setScreen } = useGameStore();

  const handleBack = () => {
    setScreen("main-menu");
  };

  const handleEquipTitle = (title: string) => {
    if (playerData.equippedTitle === title) {
      equipTitle(null); // Unequip if already equipped
    } else {
      equipTitle(title);
    }
  };

  // Generate all possible titles based on player data
  const generateTitles = () => {
    const titles: Array<{
      id: string;
      name: string;
      type: 'XP' | 'Ranked' | 'Competitive';
      description: string;
      unlocked: boolean;
      owned: boolean;
      color: string;
      glow: boolean;
    }> = [];

    // XP Titles (based on level)
    const xpTitles = [
      { level: 1, title: "NEWCOMER", color: "text-gray-400" },
      { level: 5, title: "CLICKER", color: "text-gray-400" },
      { level: 10, title: "EXPERIENCED", color: "text-gray-400" },
      { level: 15, title: "VETERAN", color: "text-gray-400" },
      { level: 20, title: "EXPERT", color: "text-gray-400" },
      { level: 25, title: "MASTER", color: "text-gray-400" },
      { level: 30, title: "LEGEND", color: "text-yellow-400" }
    ];

    xpTitles.forEach(({ level, title, color }) => {
      const unlocked = playerData.level >= level;
      const owned = unlocked;
      titles.push({
        id: title,
        name: title,
        type: "XP" as const,
        description: `Reach level ${level}`,
        unlocked,
        owned,
        color,
        glow: title === "LEGEND"
      });
    });

    // Ranked Titles (Season rewards)
    playerData.titles.forEach(title => {
      if (title.startsWith("S") && title.includes(" ")) {
        const [season, rank] = title.split(" ");
        const rankName = rank as any;
        const color = getRankColor(rankName);
        const glow = rankName === "GRAND CHAMPION";
        
        titles.push({
          id: title,
          name: title,
          type: "Ranked" as const,
          description: `Season ${season.slice(1)} reward`,
          unlocked: true,
          owned: true,
          color,
          glow
        });
      } else if (title.startsWith("SINCE S")) {
        titles.push({
          id: title,
          name: title,
          type: "Competitive" as const,
          description: "Exclusive legacy title",
          unlocked: true,
          owned: true,
          color: "text-blue-400",
          glow: false
        });
      }
    });

    // Competitive Titles (Future tournaments)
    const competitiveTitles = [
      { title: "TOURNAMENT WINNER", description: "Win a community tournament", color: "text-purple-400" },
      { title: "PRO PLAYER", description: "Participate in pro-level play", color: "text-red-400" },
      { title: "WORLD CHAMPION", description: "Win the world championship", color: "text-yellow-400" }
    ];

    competitiveTitles.forEach(({ title, description, color }) => {
      titles.push({
        id: title,
        name: title,
        type: "Competitive" as const,
        description,
        unlocked: false,
        owned: false,
        color,
        glow: title === "WORLD CHAMPION"
      });
    });

    return titles;
  };

  const titles = generateTitles();
  const ownedTitles = titles.filter(t => t.owned);

  const getTitleIcon = (type: string) => {
    switch (type) {
      case "XP": return <Star className="w-4 h-4" />;
      case "Ranked": return <Crown className="w-4 h-4" />;
      case "Competitive": return <Trophy className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const TitleCard = ({ title }: { title: any }) => {
    const isEquipped = playerData.equippedTitle === title.name;
    const canEquip = title.owned;

    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 ${
          isEquipped 
            ? "bg-blue-900 border-blue-600 ring-2 ring-blue-500" 
            : canEquip 
              ? "bg-gray-800 border-gray-700 hover:bg-gray-700" 
              : "bg-gray-900 border-gray-800 opacity-60"
        }`}
        onClick={() => canEquip && handleEquipTitle(title.name)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant={title.type === "XP" ? "secondary" : title.type === "Ranked" ? "default" : "destructive"}>
              {getTitleIcon(title.type)}
              <span className="ml-1">{title.type}</span>
            </Badge>
            {isEquipped && <CheckCircle className="w-5 h-5 text-blue-400" />}
          </div>
          
          <h3 className={`text-lg font-bold mb-1 ${title.color} ${title.glow ? "drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]" : ""}`}>
            {title.name}
          </h3>
          
          <p className="text-sm text-gray-400">{title.description}</p>
          
          {!title.owned && title.unlocked && (
            <p className="text-xs text-yellow-400 mt-2">Available to unlock</p>
          )}
          
          {!title.unlocked && (
            <p className="text-xs text-red-400 mt-2">Locked</p>
          )}
        </CardContent>
      </Card>
    );
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
          <h1 className="text-4xl font-bold text-white">Titles</h1>
        </div>

        {/* Current Title */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Currently Equipped</CardTitle>
          </CardHeader>
          <CardContent>
            {playerData.equippedTitle ? (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-blue-400">{playerData.equippedTitle}</h3>
                  <p className="text-gray-400">This title will appear in-game</p>
                </div>
                <Button
                  onClick={() => equipTitle(null)}
                  variant="outline"
                  size="sm"
                  className="border-gray-600"
                >
                  Unequip
                </Button>
              </div>
            ) : (
              <p className="text-gray-400">No title equipped</p>
            )}
          </CardContent>
        </Card>

        {/* Owned Titles */}
        {ownedTitles.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Your Titles ({ownedTitles.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ownedTitles.map(title => (
                <TitleCard key={title.id} title={title} />
              ))}
            </div>
          </div>
        ) : (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400 text-lg mb-4">No titles obtained yet</p>
              <p className="text-sm text-gray-500">
                Win matches and level up to earn titles!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
