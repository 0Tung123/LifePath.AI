import React, { useState } from 'react';
import Button from './Button';

interface UserInputFormProps {
  onSubmit: (type: string, content: string, target?: string) => Promise<void>;
  inputTypes?: Array<{
    id: string;
    label: string;
    placeholder: string;
  }>;
  isLoading?: boolean;
}

const DEFAULT_INPUT_TYPES = [
  {
    id: 'dialog',
    label: 'Đối thoại',
    placeholder: 'Nhập điều bạn muốn nói...'
  },
  {
    id: 'action',
    label: 'Hành động',
    placeholder: 'Mô tả hành động bạn muốn thực hiện...'
  },
  {
    id: 'examine',
    label: 'Quan sát',
    placeholder: 'Nhập thứ bạn muốn quan sát kỹ hơn...'
  }
];

const UserInputForm: React.FC<UserInputFormProps> = ({
  onSubmit,
  inputTypes = DEFAULT_INPUT_TYPES,
  isLoading = false
}) => {
  const [selectedType, setSelectedType] = useState(inputTypes[0].id);
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    onSubmit(selectedType, content, target || undefined)
      .then(() => {
        setContent('');
        setTarget('');
      })
      .catch(error => {
        console.error('Error submitting user input:', error);
      });
  };

  const currentInputType = inputTypes.find(type => type.id === selectedType) || inputTypes[0];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {inputTypes.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedType === type.id
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {selectedType === 'examine' && (
          <div className="mb-3">
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Đối tượng cần quan sát"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              disabled={isLoading}
            />
          </div>
        )}

        <div className="mb-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={currentInputType.placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading || !content.trim()}
          >
            Gửi
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserInputForm;