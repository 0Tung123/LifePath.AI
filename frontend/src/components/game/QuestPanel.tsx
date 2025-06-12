import { useState } from "react";
import { Quest } from "@/store/game-store";

interface QuestPanelProps {
  activeQuests: Quest[];
  onQuestClick: (quest: Quest) => void;
}

export default function QuestPanel({ activeQuests, onQuestClick }: QuestPanelProps) {
  const [filter, setFilter] = useState<"all" | "main" | "side">("all");
  
  const filteredQuests = activeQuests.filter((quest) => {
    if (filter === "all") return true;
    return quest.type === filter;
  });
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">Quest Log</h2>
        <div className="flex text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-2 py-1 rounded-l ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("main")}
            className={`px-2 py-1 ${
              filter === "main"
                ? "bg-primary text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Main
          </button>
          <button
            onClick={() => setFilter("side")}
            className={`px-2 py-1 rounded-r ${
              filter === "side"
                ? "bg-primary text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Side
          </button>
        </div>
      </div>
      
      {filteredQuests.length === 0 ? (
        <div className="text-sm text-gray-500 text-center p-4 bg-gray-50 rounded">
          {filter === "all"
            ? "No active quests"
            : `No ${filter} quests available`}
        </div>
      ) : (
        <ul className="space-y-2">
          {filteredQuests.map((quest) => (
            <li
              key={quest.id}
              className="text-sm bg-white p-3 rounded border cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onQuestClick(quest)}
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
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {quest.description}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}