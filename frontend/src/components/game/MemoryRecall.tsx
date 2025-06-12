import { useState } from "react";
import { useGameStore } from "@/store/game-store";

interface MemoryRecallProps {
  gameSessionId: string;
}

export default function MemoryRecall({ gameSessionId }: MemoryRecallProps) {
  const { submitCustomInput, isLoading } = useGameStore();
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [memoryType, setMemoryType] = useState<"character" | "world" | "recent">("recent");
  
  const handleRecallMemory = async () => {
    try {
      await submitCustomInput("memory_recall", memoryType);
      setShowMemoryModal(false);
    } catch (error) {
      console.error("Failed to recall memory:", error);
    }
  };
  
  return (
    <>
      <button
        onClick={() => setShowMemoryModal(true)}
        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center hover:bg-indigo-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Hồi Ức
      </button>
      
      {showMemoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Hồi Tưởng Ký Ức</h2>
            
            <p className="text-gray-600 mb-4">
              Nhân vật của bạn sẽ hồi tưởng lại những ký ức quan trọng. Chọn loại ký ức bạn muốn nhớ lại:
            </p>
            
            <div className="space-y-2 mb-6">
              <div
                className={`p-3 border rounded-lg cursor-pointer ${
                  memoryType === "recent" ? "border-indigo-500 bg-indigo-50" : ""
                }`}
                onClick={() => setMemoryType("recent")}
              >
                <div className="font-medium">Ký ức gần đây</div>
                <div className="text-sm text-gray-500">
                  Nhớ lại những sự kiện quan trọng vừa xảy ra gần đây
                </div>
              </div>
              
              <div
                className={`p-3 border rounded-lg cursor-pointer ${
                  memoryType === "character" ? "border-indigo-500 bg-indigo-50" : ""
                }`}
                onClick={() => setMemoryType("character")}
              >
                <div className="font-medium">Ký ức về nhân vật</div>
                <div className="text-sm text-gray-500">
                  Nhớ lại quá khứ và lai lịch của nhân vật
                </div>
              </div>
              
              <div
                className={`p-3 border rounded-lg cursor-pointer ${
                  memoryType === "world" ? "border-indigo-500 bg-indigo-50" : ""
                }`}
                onClick={() => setMemoryType("world")}
              >
                <div className="font-medium">Ký ức về thế giới</div>
                <div className="text-sm text-gray-500">
                  Nhớ lại kiến thức về thế giới, địa điểm và nhân vật quan trọng
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowMemoryModal(false)}
                className="px-4 py-2 border rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleRecallMemory}
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {isLoading ? "Đang xử lý..." : "Hồi tưởng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}