'use client';

import React, { useState, useEffect } from 'react';
import {
  BackstoryAnalysis,
  CharacterCreationResult,
  CharacterCreationStepType,
  CharacterTemplate,
  PointAllocationSystem,
} from '@/types/character-creation.types';
import StepIndicator from './StepIndicator';
import TemplateSelection from './TemplateSelection';
import BackstoryEditor from './BackstoryEditor';
import StatsEditor from './StatsEditor';
import CharacterPreview from './CharacterPreview';
import characterCreationService from '@/services/character-creation.service';

interface CharacterCreationWizardProps {
  gameId: string;
  worldType: string;
  characterName: string;
  initialBackstory: string;
  onComplete: (result: CharacterCreationResult) => void;
  onCancel: () => void;
}

const CharacterCreationWizard: React.FC<CharacterCreationWizardProps> = ({
  gameId,
  worldType,
  characterName,
  initialBackstory,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] =
    useState<CharacterCreationStepType>('template');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Step data
  const [selectedTemplate, setSelectedTemplate] = useState<
    CharacterTemplate | undefined
  >(undefined);
  const [backstory, setBackstory] = useState(initialBackstory);
  const [useCustomBackstory, setUseCustomBackstory] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<BackstoryAnalysis | undefined>(
    undefined,
  );
  const [currentStats, setCurrentStats] = useState<Record<string, number>>({});
  const [pointAllocationRules, setPointAllocationRules] =
    useState<PointAllocationSystem | null>(null);
  // Remove unused finalResult state

  // Load point allocation rules
  useEffect(() => {
    const loadPointAllocationRules = async () => {
      try {
        const rules =
          await characterCreationService.getPointAllocationRules(worldType);
        setPointAllocationRules(rules);
      } catch (err) {
        console.error('Error loading point allocation rules:', err);
        setError('Failed to load point allocation rules');
      }
    };

    loadPointAllocationRules();
  }, [worldType]);

  const handleNextStep = () => {
    const steps: CharacterCreationStepType[] = [
      'template',
      'backstory',
      'stats',
      'finalize',
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePreviousStep = () => {
    const steps: CharacterCreationStepType[] = [
      'template',
      'backstory',
      'stats',
      'finalize',
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleTemplateSelect = (template: CharacterTemplate) => {
    setSelectedTemplate(template);
    setCurrentStats(template.attributes);
    if (!useCustomBackstory) {
      setBackstory(template.backstory);
    }
  };

  const handleBackstoryAnalyze = async () => {
    if (!backstory.trim()) {
      setError('Please enter a backstory to analyze');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const analysis = await characterCreationService.analyzeBackstory({
        gameId,
        backstory,
        worldType,
        templateId: selectedTemplate?.id,
      });

      setAiAnalysis(analysis);
      setCurrentStats(analysis.suggestedStats);
    } catch (err) {
      console.error('Error analyzing backstory:', err);
      setError('Failed to analyze backstory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizeCharacter = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await characterCreationService.finalizeCharacter({
        gameId,
        finalStats: currentStats,
        selectedTraits: [],
        saveAsTemplate: false,
      });

      onComplete(result);
    } catch (err) {
      console.error('Error finalizing character:', err);
      setError('Failed to finalize character');
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = (step: CharacterCreationStepType): boolean => {
    switch (step) {
      case 'template':
        return selectedTemplate !== undefined;
      case 'backstory':
        return backstory.trim().length > 0;
      case 'stats':
        return Object.keys(currentStats).length > 0;
      case 'finalize':
        return true;
      default:
        return false;
    }
  };

  const getStepValidationMessage = (
    step: CharacterCreationStepType,
  ): string => {
    switch (step) {
      case 'template':
        return selectedTemplate ? '' : 'Please select a character template';
      case 'backstory':
        return backstory.trim() ? '' : 'Please enter a character backstory';
      case 'stats':
        return Object.keys(currentStats).length > 0
          ? ''
          : 'Please allocate character stats';
      default:
        return '';
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'template':
        return (
          <TemplateSelection
            worldType={worldType}
            selectedTemplate={selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
          />
        );

      case 'backstory':
        return (
          <BackstoryEditor
            initialBackstory={backstory}
            onBackstoryChange={setBackstory}
            onAnalyzeBackstory={handleBackstoryAnalyze}
            aiAnalysis={aiAnalysis}
            isAnalyzing={isLoading}
            useCustomBackstory={useCustomBackstory}
            onToggleCustomBackstory={setUseCustomBackstory}
            selectedTemplate={selectedTemplate}
          />
        );

      case 'stats':
        return (
          <StatsEditor
            stats={currentStats}
            onStatsChange={setCurrentStats}
            pointAllocationRules={pointAllocationRules}
            aiSuggestedStats={aiAnalysis?.suggestedStats}
            worldType={worldType}
          />
        );

      case 'finalize':
        return (
          <CharacterPreview
            characterName={characterName}
            stats={currentStats}
            backstory={backstory}
            selectedTemplate={selectedTemplate}
            aiAnalysis={aiAnalysis}
            worldType={worldType}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="mb-8">{renderCurrentStep()}</div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Hủy
          </button>

          {currentStep !== 'template' && (
            <button
              onClick={handlePreviousStep}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Quay lại
            </button>
          )}
        </div>

        <div className="flex space-x-4">
          {/* Step validation message */}
          {!isStepValid(currentStep) && (
            <div className="text-sm text-red-600 flex items-center">
              {getStepValidationMessage(currentStep)}
            </div>
          )}

          {currentStep === 'finalize' ? (
            <button
              onClick={handleFinalizeCharacter}
              disabled={isLoading || !isStepValid(currentStep)}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang hoàn thành...' : 'Hoàn thành'}
            </button>
          ) : (
            <button
              onClick={handleNextStep}
              disabled={!isStepValid(currentStep)}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp theo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterCreationWizard;
