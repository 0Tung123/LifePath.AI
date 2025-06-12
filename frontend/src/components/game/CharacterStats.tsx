import { Character } from "@/store/game-store";

interface CharacterStatsProps {
  character: Character;
}

export default function CharacterStats({ character }: CharacterStatsProps) {
  // Calculate health percentage
  const healthPercentage = Math.max(
    0,
    Math.min(100, (character.attributes.health / 100) * 100)
  );
  
  // Calculate mana percentage if it exists
  const manaPercentage = character.attributes.mana
    ? Math.max(0, Math.min(100, (character.attributes.mana / 100) * 100))
    : null;
  
  return (
    <div className="p-4 border-b">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold">Character</h2>
        <div className="text-sm">
          Level {character.level} • {character.characterClass}
        </div>
      </div>
      
      {/* Health Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span>Health</span>
          <span>{character.attributes.health}/100</span>
        </div>
        <div className="h-2 bg-gray-200 rounded">
          <div
            className="h-2 bg-red-500 rounded"
            style={{ width: `${healthPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Mana Bar (if applicable) */}
      {manaPercentage !== null && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Mana</span>
            <span>{character.attributes.mana}/100</span>
          </div>
          <div className="h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-blue-500 rounded"
              style={{ width: `${manaPercentage}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Experience Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span>Experience</span>
          <span>{character.experience} XP</span>
        </div>
        <div className="h-2 bg-gray-200 rounded">
          <div
            className="h-2 bg-green-500 rounded"
            style={{
              width: `${Math.min(
                100,
                (character.experience / (character.level * 100)) * 100
              )}%`,
            }}
          ></div>
        </div>
      </div>
      
      {/* Attributes */}
      <div className="text-sm">
        <h3 className="font-medium mb-2">Attributes</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(character.attributes)
            .filter(([key]) => !["health", "mana"].includes(key.toLowerCase()))
            .map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize">{key}:</span>
                <span>{value}</span>
              </div>
            ))}
        </div>
      </div>
      
      {/* Skills */}
      {character.skills && character.skills.length > 0 && (
        <div className="mt-4 text-sm">
          <h3 className="font-medium mb-2">Skills</h3>
          <div className="flex flex-wrap gap-1">
            {character.skills.slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-200 rounded-full text-xs"
              >
                {skill}
              </span>
            ))}
            {character.skills.length > 5 && (
              <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                +{character.skills.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}