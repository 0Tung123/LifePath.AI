'use client';

import React from 'react';
import { CharacterCreationStepType } from '@/types/character-creation.types';

interface StepIndicatorProps {
  currentStep: CharacterCreationStepType;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { key: 'template', label: 'Chọn Mẫu', description: 'Chọn mẫu nhân vật' },
    { key: 'backstory', label: 'Tiểu Sử', description: 'Tùy chỉnh tiểu sử' },
    { key: 'stats', label: 'Chỉ Số', description: 'Phân bổ chỉ số' },
    {
      key: 'finalize',
      label: 'Hoàn Thành',
      description: 'Xem lại và hoàn thành',
    },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex((step) => step.key === currentStep);
  };

  const isStepCompleted = (stepIndex: number) => {
    return stepIndex < getCurrentStepIndex();
  };

  const isStepCurrent = (stepIndex: number) => {
    return stepIndex === getCurrentStepIndex();
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                  isStepCompleted(index)
                    ? 'bg-green-500'
                    : isStepCurrent(index)
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                }`}
              >
                {isStepCompleted(index) ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="text-center mt-2">
                <div
                  className={`text-sm font-medium ${
                    isStepCurrent(index) ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {step.description}
                </div>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 mt-6">
                <div
                  className={`h-full ${
                    isStepCompleted(index) ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Tiến độ</span>
          <span>
            {Math.round(((getCurrentStepIndex() + 1) / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((getCurrentStepIndex() + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;
