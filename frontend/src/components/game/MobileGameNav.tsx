import { useState } from "react";
import { useRouter } from "next/navigation";
import { Character, Quest } from "@/store/game-store";

interface MobileGameNavProps {
  character: Character | null;
  activeQuests: Quest[];
  onQuestClick: (quest: Quest) => void;
}

export default function MobileGameNav({
  character,
  activeQuests,
  onQuestClick,
}: MobileGameNavProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"character" | "quests" | null>(null);
  
  const toggleTab = (tab: "character" | "quests") => {
    if (activeTab === tab) {
      setActiveTab(null);
    } else {
      setActiveTab(tab);
    }
  };
  
  return (
    <>
      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 text-white z-10">
        <div className="flex justify-around">
          <button
            onClick={() => toggleTab("character")}
            className={`flex-1 py-3 flex flex-col items-center ${
              activeTab === "character" ? "bg-gray-700" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mb-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs">Character</span>
          </button>
          
          <button
            onClick={() => toggleTab("quests")}
            className={`flex-1 py-3 flex flex-col items-center ${
              activeTab === "quests" ? "bg-gray-700" : ""
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mb-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="text-xs">Quests</span>
          </button>
          
          <button
            onClick={() => router.push("/game")}
            className="flex-1 py-3 flex flex-col items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mb-1"
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
            <span className="text-xs">Exit</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Slide-up Panels */}
      {activeTab === "character" && character && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 rounded-t-xl shadow-lg z-20 max-h-[70vh] overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{character.name}</h2>
              <button
                onClick={() => setActiveTab(null)}
                className="p-1 rounded-full bg-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
              </button>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Level {character.level} {character.characterClass}</span>
                <span>HP: {character.attributes.health}/100</span>
              </div>
              <div className="h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-red-500 rounded"
                  style={{
                    width: `${(character.attributes.health / 100) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Attributes</h3>
              <div className="grid grid-cols-2 gap-2">
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
            
            {character.skills && character.skills.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Skills</h3>
                <div className="flex flex-wrap gap-1">
                  {character.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-200 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === "quests" && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 rounded-t-xl shadow-lg z-20 max-h-[70vh] overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Quest Log</h2>
              <button
                onClick={() => setActiveTab(null)}
                className="p-1 rounded-full bg-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
              </button>
            </div>
            
            {activeQuests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active quests</p>
            ) : (
              <ul className="space-y-2">
                {activeQuests.map((quest) => (
                  <li
                    key={quest.id}
                    className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      onQuestClick(quest);
                      setActiveTab(null);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{quest.title}</div>
                      <div
                        className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                          quest.type === "main"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {quest.type === "main" ? "Main" : "Side"}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {quest.description}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      
      {/* Overlay when panel is open */}
      {activeTab && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setActiveTab(null)}
        ></div>
      )}
    </>
  );
}