import { useState, useEffect } from "react";
import { MainMenu } from "./components/game/MainMenu";
import { QueueSelection } from "./components/game/QueueSelection";
import { QueueScreen } from "./components/game/QueueScreen";
import { GameScreen } from "./components/game/GameScreen";
import { EndScreen } from "./components/game/EndScreen";
import { SettingsMenu } from "./components/game/SettingsMenu";
import { TitlesMenu } from "./components/game/TitlesMenu";
import { StatsMenu } from "./components/game/StatsMenu";
import { useGameStore } from "./lib/stores/useGameStore";
import { GameScreen as GameScreenType } from "./lib/types";
import "@fontsource/inter";

function App() {
  const { currentScreen, initializePlayer } = useGameStore();

  useEffect(() => {
    initializePlayer();
  }, [initializePlayer]);

  const renderScreen = () => {
    switch (currentScreen) {
      case "main-menu":
        return <MainMenu />;
      case "queue-selection":
        return <QueueSelection />;
      case "queue-screen":
        return <QueueScreen />;
      case "game":
        return <GameScreen />;
      case "end-screen":
        return <EndScreen />;
      case "settings":
        return <SettingsMenu />;
      case "titles":
        return <TitlesMenu />;
      case "stats":
        return <StatsMenu />;
      default:
        return <MainMenu />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {renderScreen()}
    </div>
  );
}

export default App;
