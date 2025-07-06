// Game Interface Component - Enhanced UI/UX
// Based on complete backend types and AI prompts

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { GameState, Choice } from '../../types/game.types';
import NPCHighlight from '../NPCSystem/NPCHighlight';
import NPCTooltip from '../NPCSystem/NPCTooltip';
import NPCDetailCard from '../NPCSystem/NPCDetailCard';
import NPCNotification from '../NPCSystem/NPCNotification';
import CharacterSheet from '../CharacterSheet/CharacterSheet';
import { InventoryPanel } from '../GameplayScreen/InventoryPanel';
import { LoreBook } from '../LoreBook/LoreBook';
import { AchievementPanel } from '../Achievements/AchievementPanel';
import { GameStats } from '../GameStats/GameStats';
import { ActionInput } from '../ActionInput/ActionInput';
import { StoryDisplay } from '../StoryDisplay/StoryDisplay';
import { GameMenu } from '../GameMenu/GameMenu';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { ErrorMessage } from '../UI/ErrorMessage';
import { Toast } from '../UI';
import './GameInterface.css';

interface GameInterfaceProps {
  gameId: string;
  onExitGame?: () => void;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({
  gameId,
  onExitGame,
}) => {
  const {
    gameState,
    uiState,
    performAction,
    selectChoice,
    customAction,
    thinkAction,
    communicateAction,
    setActionMode,
    setSelectedTab,
    togglePanel,
    setActionInput,
    setThinkingInput,
    setCommunicationInput,
    isLoading,
    error,
    canPerformAction,
    refreshGameState,
    isConnected,
    connectionStatus,
  } = useGameState({ gameId, enableWebSocket: true });

  // Local state for UI
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [npcTooltip, setNPCTooltip] = useState<any>(null);
  const [npcDetailCard, setNPCDetailCard] = useState<any>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Memoized computations
  const isCharacterDead = useMemo(
    () => !gameState?.active,
    [gameState?.active],
  );
  const hasChoices = useMemo(
    () => gameState?.currentChoices && gameState.currentChoices.length > 0,
    [gameState?.currentChoices],
  );
  const currentStoryText = useMemo(() => {
    if (!gameState?.storyHistory.length) return '';
    const lastStory = gameState.storyHistory[gameState.storyHistory.length - 1];
    return lastStory.type === 'story' ? lastStory.content : '';
  }, [gameState?.storyHistory]);

  // Effects
  useEffect(() => {
    if (error) {
      setToastMessage(error);
    }
  }, [error]);

  useEffect(() => {
    // Show achievement notifications
    if (gameState?.achievements && gameState.achievements.length > 0) {
      const latestAchievement =
        gameState.achievements[gameState.achievements.length - 1];
      const timeSinceUnlock =
        Date.now() - new Date(latestAchievement.unlockedAt).getTime();
      if (timeSinceUnlock < 5000) {
        // Show for achievements unlocked in last 5 seconds
        setToastMessage(`🏆 Achievement Unlocked: ${latestAchievement.name}`);
      }
    }
  }, [gameState?.achievements]);

  // Handlers
  const handleChoiceClick = useCallback(
    (choice: Choice) => {
      selectChoice(choice.number);
    },
    [selectChoice],
  );

  const handleCustomAction = useCallback(() => {
    if (uiState.actionInput.trim()) {
      customAction(uiState.actionInput.trim());
    }
  }, [customAction, uiState.actionInput]);

  const handleThinkingAction = useCallback(() => {
    if (uiState.thinkingInput.trim()) {
      thinkAction(uiState.thinkingInput.trim());
    }
  }, [thinkAction, uiState.thinkingInput]);

  const handleCommunicationAction = useCallback(() => {
    if (uiState.communicationInput.trim()) {
      communicateAction(uiState.communicationInput.trim());
    }
  }, [communicateAction, uiState.communicationInput]);

  const handleNPCHover = useCallback(
    (npcId: string, event: React.MouseEvent) => {
      // Show NPC tooltip
      setNPCTooltip({
        npcId,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    [],
  );

  const handleNPCClick = useCallback((npcId: string) => {
    // Show NPC detail card
    setNPCDetailCard({ npcId });
  }, []);

  const handleNPCLeave = useCallback(() => {
    setNPCTooltip(null);
  }, []);

  const handleExitGame = useCallback(() => {
    if (window.confirm('Are you sure you want to exit the game?')) {
      onExitGame?.();
    }
  }, [onExitGame]);

  // Loading state
  if (isLoading && !gameState) {
    return (
      <div className="game-interface game-interface--loading">
        <LoadingSpinner size="large" message="Loading your adventure..." />
      </div>
    );
  }

  // Error state
  if (error && !gameState) {
    return (
      <div className="game-interface game-interface--error">
        <ErrorMessage
          message={error}
          onRetry={refreshGameState}
          actionLabel="Try Again"
        />
      </div>
    );
  }

  // No game state
  if (!gameState) {
    return (
      <div className="game-interface game-interface--no-game">
        <ErrorMessage
          message="Game not found or could not be loaded"
          onRetry={refreshGameState}
          actionLabel="Reload"
        />
      </div>
    );
  }

  return (
    <div
      className={`game-interface ${isCharacterDead ? 'game-interface--dead' : ''}`}
    >
      {/* Header */}
      <header className="game-interface__header">
        <div className="game-interface__header-left">
          <h1 className="game-interface__title">
            {gameState.settings.characterName}
          </h1>
          <span className="game-interface__subtitle">
            {gameState.settings.theme} • {gameState.settings.setting}
          </span>
        </div>
        <div className="game-interface__header-right">
          <div className="game-interface__connection-status">
            <span
              className={`connection-indicator connection-indicator--${connectionStatus}`}
            >
              {connectionStatus === 'connected'
                ? '🟢'
                : connectionStatus === 'connecting'
                  ? '🟡'
                  : connectionStatus === 'error'
                    ? '🔴'
                    : '⚪'}
            </span>
          </div>
          <button
            className="game-interface__menu-button"
            onClick={() => setShowGameMenu(!showGameMenu)}
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="game-interface__main">
        {/* Left Sidebar */}
        <aside className="game-interface__sidebar game-interface__sidebar--left">
          <GameStats
            stats={gameState.characterStats}
            karma={gameState.karmaScore}
            reputation={gameState.reputation}
            isDead={isCharacterDead}
          />

          <div className="game-interface__quick-panels">
            <button
              className={`quick-panel-button ${uiState.showInventory ? 'active' : ''}`}
              onClick={() => togglePanel('inventory')}
            >
              🎒 Inventory ({gameState.inventoryItems.length})
            </button>
            <button
              className={`quick-panel-button ${uiState.showCharacterSheet ? 'active' : ''}`}
              onClick={() => togglePanel('character')}
            >
              👤 Character
            </button>
            <button
              className={`quick-panel-button ${uiState.showLoreBook ? 'active' : ''}`}
              onClick={() => togglePanel('lore')}
            >
              📖 Lore ({gameState.loreFragments.length})
            </button>
            <button
              className={`quick-panel-button ${uiState.showNPCPanel ? 'active' : ''}`}
              onClick={() => togglePanel('npcs')}
            >
              👥 NPCs ({gameState.npcsMet?.length || 0})
            </button>
            <button
              className={`quick-panel-button ${uiState.showAchievements ? 'active' : ''}`}
              onClick={() => togglePanel('achievements')}
            >
              🏆 Achievements ({gameState.achievements?.length || 0})
            </button>
          </div>
        </aside>

        {/* Center Content */}
        <div className="game-interface__content">
          {/* Story Display */}
          <div className="game-interface__story-container">
            <StoryDisplay
              storyHistory={gameState.storyHistory}
              currentObjective={gameState.currentObjective}
              autoScroll={autoScroll}
              onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
            />

            {/* NPC Highlights in story */}
            {currentStoryText && (
              <NPCHighlight
                text={currentStoryText}
                npcHighlights={[]} // This would be populated from NPC service
                onNPCHover={handleNPCHover}
                onNPCClick={handleNPCClick}
                onNPCLeave={handleNPCLeave}
              />
            )}
          </div>

          {/* Action Section */}
          <div className="game-interface__action-section">
            {/* Choices */}
            {hasChoices && !isCharacterDead && (
              <div className="game-interface__choices">
                <h3>Choose your action:</h3>
                <div className="choices-grid">
                  {gameState.currentChoices!.map((choice) => (
                    <button
                      key={choice.number}
                      className={`choice-button choice-button--${choice.number}`}
                      onClick={() => handleChoiceClick(choice)}
                      disabled={!canPerformAction}
                    >
                      <span className="choice-number">{choice.number}.</span>
                      <span className="choice-text">{choice.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Actions */}
            {!isCharacterDead && (
              <ActionInput
                mode={uiState.actionMode}
                actionInput={uiState.actionInput}
                thinkingInput={uiState.thinkingInput}
                communicationInput={uiState.communicationInput}
                onActionInputChange={setActionInput}
                onThinkingInputChange={setThinkingInput}
                onCommunicationInputChange={setCommunicationInput}
                onModeChange={setActionMode}
                onCustomAction={handleCustomAction}
                onThinkingAction={handleThinkingAction}
                onCommunicationAction={handleCommunicationAction}
                canPerformAction={canPerformAction}
                isLoading={isLoading}
              />
            )}

            {/* Death Summary */}
            {isCharacterDead && (
              <div className="game-interface__death-summary">
                <h2>💀 Game Over</h2>
                {gameState.deathCause && (
                  <p className="death-cause">{gameState.deathCause}</p>
                )}
                <div className="death-actions">
                  <button
                    className="button button--primary"
                    onClick={() => {
                      /* Show life summary */
                    }}
                  >
                    View Life Summary
                  </button>
                  <button
                    className="button button--secondary"
                    onClick={handleExitGame}
                  >
                    Exit Game
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Dynamic Panels */}
        <aside className="game-interface__sidebar game-interface__sidebar--right">
          {uiState.showInventory && (
            <InventoryPanel
              items={gameState.inventoryItems}
              onClose={() => togglePanel('inventory')}
            />
          )}

          {uiState.showCharacterSheet && (
            <CharacterSheet
              character={{
                name: gameState.settings.characterName,
                backstory: gameState.settings.characterBackstory,
                stats: gameState.characterStats,
                skills: gameState.characterSkills,
                karma: gameState.karmaScore,
                reputation: gameState.reputation,
              }}
              onClose={() => togglePanel('character')}
            />
          )}

          {uiState.showLoreBook && (
            <LoreBook
              loreFragments={gameState.loreFragments}
              onClose={() => togglePanel('lore')}
            />
          )}

          {uiState.showAchievements && (
            <AchievementPanel
              achievements={gameState.achievements || []}
              onClose={() => togglePanel('achievements')}
            />
          )}
        </aside>
      </main>

      {/* Overlays */}
      {showGameMenu && (
        <GameMenu
          isOpen={showGameMenu}
          onClose={() => setShowGameMenu(false)}
          onExitGame={handleExitGame}
          onSaveGame={() => {
            /* Implement save */
          }}
          onLoadGame={() => {
            /* Implement load */
          }}
        />
      )}

      {/* NPC Tooltip */}
      <NPCTooltip
        data={npcTooltip}
        visible={!!npcTooltip}
        onClose={() => setNPCTooltip(null)}
      />

      {/* NPC Detail Card */}
      <NPCDetailCard
        data={npcDetailCard}
        visible={!!npcDetailCard}
        position="modal"
        onClose={() => setNPCDetailCard(null)}
      />

      {/* Notifications */}
      <NPCNotification
        notifications={[]} // This would be populated from NPC service
        onDismiss={() => {}}
        onDismissAll={() => {}}
        position="top-right"
      />

      {/* Toast Messages */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="info"
          onClose={() => setToastMessage(null)}
          duration={5000}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="game-interface__loading-overlay">
          <LoadingSpinner message="Processing your action..." />
        </div>
      )}
    </div>
  );
};
