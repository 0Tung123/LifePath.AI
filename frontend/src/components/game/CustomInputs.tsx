import React, { useState } from "react";

interface CustomInputsProps {
  onSubmit: (type: string, content: string, target?: string) => void;
}

const CustomInputs: React.FC<CustomInputsProps> = ({ onSubmit }) => {
  const [activeTab, setActiveTab] = useState<"thought" | "speech" | "action">(
    "thought"
  );
  const [inputContent, setInputContent] = useState("");
  const [targetNpc, setTargetNpc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!inputContent.trim()) return;

    setIsSubmitting(true);

    try {
      // Gọi hàm xử lý input từ component cha
      await onSubmit(
        activeTab,
        inputContent,
        activeTab === "speech" && targetNpc ? targetNpc : undefined
      );

      // Reset form sau khi gửi thành công
      setInputContent("");
      if (activeTab === "speech") {
        setTargetNpc("");
      }
    } catch (error) {
      console.error("Error submitting custom input:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Hành động tùy chỉnh</h3>

      <div className="flex border-b border-gray-700 mb-4">
        <button
          className={`flex-1 py-2 ${
            activeTab === "thought" ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab("thought")}
        >
          Suy nghĩ
        </button>
        <button
          className={`flex-1 py-2 ${
            activeTab === "speech" ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab("speech")}
        >
          Nói chuyện
        </button>
        <button
          className={`flex-1 py-2 ${
            activeTab === "action" ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab("action")}
        >
          Hành động
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === "speech" && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Nói chuyện với:
            </label>
            <input
              type="text"
              value={targetNpc}
              onChange={(e) => setTargetNpc(e.target.value)}
              placeholder="Nhập tên nhân vật (để trống nếu nói chung)"
              className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            {activeTab === "thought"
              ? "Suy nghĩ của bạn:"
              : activeTab === "speech"
              ? "Nội dung nói:"
              : "Mô tả hành động:"}
          </label>
          <textarea
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder={
              activeTab === "thought"
                ? "Nhập suy nghĩ của nhân vật..."
                : activeTab === "speech"
                ? "Nhập nội dung cuộc hội thoại..."
                : "Mô tả hành động bạn muốn thực hiện..."
            }
            rows={3}
            className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !inputContent.trim()}
            className={`px-4 py-2 rounded-md transition duration-300 ${
              isSubmitting
                ? "bg-gray-600 cursor-not-allowed"
                : activeTab === "thought"
                ? "bg-blue-600 hover:bg-blue-700"
                : activeTab === "speech"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isSubmitting
              ? "Đang gửi..."
              : activeTab === "thought"
              ? "Suy nghĩ"
              : activeTab === "speech"
              ? "Nói"
              : "Thực hiện"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomInputs;
