import React from 'react';
import { StoryNode, Choice } from '../../api/apiClient';
import Button from './Button';

interface StoryNodeComponentProps {
  node: StoryNode;
  onMakeChoice: (choiceId: string) => void;
  isLoading?: boolean;
}

const StoryNodeComponent: React.FC<StoryNodeComponentProps> = ({ node, onMakeChoice, isLoading = false }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-4">
      {/* Content */}
      <div className="prose dark:prose-invert max-w-none mb-6">
        {node.image && (
          <div className="mb-4">
            <img 
              src={node.image} 
              alt="Story illustration" 
              className="w-full h-auto rounded-lg object-cover max-h-80" 
            />
          </div>
        )}
        <div 
          dangerouslySetInnerHTML={{ __html: node.content }} 
          className="whitespace-pre-wrap"
        />
      </div>
      
      {/* Choices */}
      {node.choices && node.choices.length > 0 && (
        <div className="space-y-2 mt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Lựa chọn của bạn:</h3>
          {node.choices.map((choice) => (
            <div key={choice.id} className="w-full">
              <Button
                variant="secondary"
                isFullWidth
                size="lg"
                onClick={() => onMakeChoice(choice.id)}
                isLoading={isLoading}
                disabled={isLoading}
                className="text-left justify-start border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 bg-transparent text-gray-800 dark:text-gray-200"
              >
                {choice.text}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoryNodeComponent;