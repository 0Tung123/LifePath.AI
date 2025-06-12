import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/game-store";

interface GameOverScreenProps {
  characterId: string;
  characterName: string;
  deathReason: string;
  legacyId?: string;
}

export default function GameOverScreen({
  characterId,
  characterName,
  deathReason,
  legacyId,
}: GameOverScreenProps) {
  const router = useRouter();
  const { resetGameState } = useGameStore();

  const handleViewLegacy = () => {
    resetGameState();
    if (legacyId) {
      router.push(`/game/legacy?id=${legacyId}`);
    }
  };

  const handleReturnToCharacters = () => {
    resetGameState();
    router.push("/game");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full bg-gray-900 border border-red-800 rounded-lg overflow-hidden text-white">
        <div className="p-8 text-center">
          <h2 className="text-4xl font-bold text-red-500 mb-6">Game Over</h2>

          <div className="mb-8">
            <p className="text-2xl mb-4">{characterName} has perished</p>
            <p className="text-gray-300 italic">{deathReason}</p>
          </div>

          <div className="border-t border-gray-700 pt-6 mb-8">
            <p className="text-gray-300 mb-4">
              Death is not the end. The legacy of your character will be
              remembered.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {legacyId && (
              <button
                onClick={handleViewLegacy}
                className="px-6 py-3 bg-red-700 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                View Legacy
              </button>
            )}
            <button
              onClick={handleReturnToCharacters}
              className="px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Return to Characters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
