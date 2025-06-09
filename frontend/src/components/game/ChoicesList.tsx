import React from "react";

interface Choice {
  id: string;
  text: string;
  order: number;
  metadata?: {
    isCustomAction?: boolean;
  };
}

interface ChoicesListProps {
  choices: Choice[];
  onChoiceSelected: (choiceId: string) => void;
}

const ChoicesList: React.FC<ChoicesListProps> = ({
  choices,
  onChoiceSelected,
}) => {
  // Sắp xếp các lựa chọn theo thứ tự
  const sortedChoices = [...choices].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Lựa chọn</h3>
      <div className="space-y-3">
        {sortedChoices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => onChoiceSelected(choice.id)}
            className={`w-full p-3 text-left rounded-lg transition duration-300 ${
              choice.metadata?.isCustomAction
                ? "bg-purple-700 hover:bg-purple-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2 text-gray-400">{choice.order + 1}.</span>
              <span>{choice.text}</span>
            </div>
          </button>
        ))}

        {choices.length === 0 && (
          <div className="text-gray-400 text-center py-4">
            Không có lựa chọn khả dụng. Hãy sử dụng các hành động tùy chỉnh bên
            dưới.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChoicesList;
