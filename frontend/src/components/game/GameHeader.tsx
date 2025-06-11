import React from "react";
import { Character, GameSession } from "../../api/apiClient";
import Button from "./Button";

interface GameHeaderProps {
  character?: Character;
  session?: GameSession;
  onSaveGame: () => void;
  onEndGame: () => void;
  isSaving?: boolean;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  character,
  session,
  onSaveGame,
  onEndGame,
  isSaving = false,
}) => {
  if (!character) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="mb-4 md:mb-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {character.name}
          </h1>
          <div className="flex items-center mt-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Cấp độ {character.level} • Kinh nghiệm: {character.experience}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onSaveGame}
            isLoading={isSaving}
            leftIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
            }
          >
            Lưu game
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onEndGame}
            leftIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            }
          >
            Kết thúc
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
