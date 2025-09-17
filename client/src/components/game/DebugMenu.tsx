import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/lib/stores/useGameStore";
import { CUSTOM_TITLES } from "@/lib/customTitles";
import { Badge } from "@/components/ui/badge";
import { X, Crown } from "lucide-react";

interface DebugMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DebugMenu({ isOpen, onClose }: DebugMenuProps) {
  const { playerData, equipTitle, addTitle } = useGameStore();
  const [customTitleInput, setCustomTitleInput] = useState("");

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddCustomTitle = () => {
    if (customTitleInput.trim()) {
      addTitle(customTitleInput.trim());
      setCustomTitleInput("");
    }
  };

  const handleAddPresetTitle = (title: string) => {
    addTitle(title);
  };

  const handleEquipTitle = (title: string) => {
    equipTitle(title);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              Debug Title Manager
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Custom Title */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              Add Custom Title
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom title..."
                value={customTitleInput}
                onChange={(e) => setCustomTitleInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustomTitle()}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button
                onClick={handleAddCustomTitle}
                disabled={!customTitleInput.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Preset Custom Titles */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              Preset Custom Titles
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {CUSTOM_TITLES.map((title) => (
                <div
                  key={title.id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <div>
                    <span
                      className={`font-bold ${title.color} ${title.glow ? title.glow : ""}`}
                    >
                      {title.name}
                    </span>
                    <p className="text-sm text-gray-400">{title.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddPresetTitle(title.name)}
                      disabled={playerData.titles.includes(title.name)}
                    >
                      {playerData.titles.includes(title.name) ? "Owned" : "Add"}
                    </Button>
                    {playerData.titles.includes(title.name) && (
                      <Button
                        size="sm"
                        onClick={() => handleEquipTitle(title.name)}
                        disabled={playerData.equippedTitle === title.name}
                      >
                        {playerData.equippedTitle === title.name
                          ? "Equipped"
                          : "Equip"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Equipped Title */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Current Title</h3>
            <div className="p-3 bg-gray-700 rounded-lg">
              {playerData.equippedTitle ? (
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-lg">
                    {playerData.equippedTitle}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => equipTitle(null)}
                  >
                    Unequip
                  </Button>
                </div>
              ) : (
                <p className="text-gray-400">No title equipped</p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-700 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-2">Instructions</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>
                • Press{" "}
                <Badge variant="outline" className="text-xs">
                  F
                </Badge>{" "}
                to open/close this menu
              </li>
              <li>• Add any custom title to your collection</li>
              <li>• Use preset titles with special effects</li>
              <li>• Press Escape to close this menu</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
