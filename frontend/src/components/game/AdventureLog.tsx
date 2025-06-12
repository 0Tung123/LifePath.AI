import { useRef, useEffect } from "react";
import { AdventureLogEntry } from "@/store/game-store";

interface AdventureLogProps {
  entries: AdventureLogEntry[];
  isLoading: boolean;
}

export default function AdventureLog({ entries, isLoading }: AdventureLogProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when entries update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [entries]);
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div ref={logContainerRef} className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4 space-y-4">
      {entries.map((entry) => {
        switch (entry.type) {
          case "story":
            return (
              <div
                key={entry.id}
                className="bg-gray-100 p-4 rounded-lg shadow-sm"
              >
                <p className="whitespace-pre-line">{entry.content}</p>
                {entry.metadata?.location && (
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span>Location: {entry.metadata.location}</span>
                    <span>{formatTimestamp(entry.timestamp)}</span>
                  </div>
                )}
              </div>
            );
          case "choice":
            return (
              <div
                key={entry.id}
                className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400"
              >
                <div className="flex justify-between items-center">
                  <p className="text-blue-800">{entry.content}</p>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
              </div>
            );
          case "system":
            return (
              <div
                key={entry.id}
                className="bg-gray-200 p-2 rounded text-sm text-gray-600 text-center"
              >
                {entry.content}
                <span className="text-xs text-gray-500 ml-2">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
            );
          case "combat":
            return (
              <div
                key={entry.id}
                className="bg-red-50 p-3 rounded-lg border-l-4 border-red-400"
              >
                <div className="flex justify-between items-center">
                  <p className="text-red-800">{entry.content}</p>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
              </div>
            );
          case "quest":
            return (
              <div
                key={entry.id}
                className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400"
              >
                <div className="flex justify-between items-center">
                  <p className="text-yellow-800">{entry.content}</p>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
              </div>
            );
          default:
            return (
              <div key={entry.id} className="p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <p>{entry.content}</p>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
              </div>
            );
        }
      })}
      
      {isLoading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      {entries.length === 0 && !isLoading && (
        <div className="text-center p-8 text-gray-500">
          Your adventure will begin soon...
        </div>
      )}
    </div>
  );
}