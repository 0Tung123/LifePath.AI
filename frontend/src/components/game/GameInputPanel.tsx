import { useState } from "react";

interface GameInputPanelProps {
  onSubmitAction: (content: string) => Promise<void>;
  onSubmitThought: (content: string) => Promise<void>;
  onSubmitCommunication: (content: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function GameInputPanel({
  onSubmitAction,
  onSubmitThought,
  onSubmitCommunication,
  isLoading,
  error,
}: GameInputPanelProps) {
  const [actionInput, setActionInput] = useState("");
  const [thoughtInput, setThoughtInput] = useState("");
  const [communicationInput, setCommunicationInput] = useState("");

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionInput.trim()) return;

    try {
      await onSubmitAction(actionInput);
      setActionInput("");
    } catch (error) {
      console.error("Failed to submit action:", error);
    }
  };

  const handleThoughtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thoughtInput.trim()) return;

    try {
      await onSubmitThought(thoughtInput);
      setThoughtInput("");
    } catch (error) {
      console.error("Failed to submit thought:", error);
    }
  };

  const handleCommunicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!communicationInput.trim()) return;

    try {
      await onSubmitCommunication(communicationInput);
      setCommunicationInput("");
    } catch (error) {
      console.error("Failed to submit communication:", error);
    }
  };

  return (
    <div className="border-t p-4 bg-gray-50">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Action Input */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <form onSubmit={handleActionSubmit}>
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-blue-600">Hành động</h3>
            </div>

            <div className="mb-2">
              <textarea
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder="Nhân vật của bạn sẽ làm gì?"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !actionInput.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoading ? "Đang xử lý..." : "Thực hiện"}
            </button>
          </form>
        </div>

        {/* Thought Input */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <form onSubmit={handleThoughtSubmit}>
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-purple-600">Suy nghĩ</h3>
            </div>

            <div className="mb-2">
              <textarea
                value={thoughtInput}
                onChange={(e) => setThoughtInput(e.target.value)}
                placeholder="Nhân vật của bạn đang suy nghĩ gì?"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !thoughtInput.trim()}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoading ? "Đang xử lý..." : "Suy nghĩ"}
            </button>
          </form>
        </div>

        {/* Communication Input */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <form onSubmit={handleCommunicationSubmit}>
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-green-600">Giao tiếp</h3>
            </div>

            <div className="mb-2">
              <textarea
                value={communicationInput}
                onChange={(e) => setCommunicationInput(e.target.value)}
                placeholder="Nhân vật của bạn muốn nói gì?"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !communicationInput.trim()}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoading ? "Đang xử lý..." : "Nói"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
