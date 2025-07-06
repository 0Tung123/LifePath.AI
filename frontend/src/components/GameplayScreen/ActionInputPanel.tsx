'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Choice } from '@/types/shared';

interface ActionInputPanelProps {
  currentChoices: Choice[];
  isLoading: boolean;
  onMakeChoice: (choiceNumber: number) => Promise<void>;
  onPerformAction: (action: string) => Promise<void>;
  onPerformThinking: (think: string) => Promise<void>;
  onPerformCommunication: (communication: string) => Promise<void>;
  onGetSummary: () => Promise<void>;
}

const ActionInputPanel = React.forwardRef<
  HTMLDivElement,
  ActionInputPanelProps
>(
  (
    {
      currentChoices,
      isLoading,
      onMakeChoice,
      onPerformAction,
      onPerformThinking,
      onPerformCommunication,
      onGetSummary,
    },
    ref,
  ) => {
    const [activeTab, setActiveTab] = useState<
      'choices' | 'action' | 'think' | 'communicate'
    >('choices');
    const [actionText, setActionText] = useState('');
    const [thinkText, setThinkText] = useState('');
    const [communicateText, setCommunicateText] = useState('');
    const [processingChoice, setProcessingChoice] = useState<number | null>(
      null,
    );
    const [wasLoading, setWasLoading] = useState(false);

    const actionTextareaRef = useRef<HTMLTextAreaElement>(null);
    const thinkTextareaRef = useRef<HTMLTextAreaElement>(null);
    const communicateTextareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textareas
    const autoResize = (textarea: HTMLTextAreaElement) => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };

    useEffect(() => {
      if (actionTextareaRef.current) autoResize(actionTextareaRef.current);
    }, [actionText]);

    useEffect(() => {
      if (thinkTextareaRef.current) autoResize(thinkTextareaRef.current);
    }, [thinkText]);

    useEffect(() => {
      if (communicateTextareaRef.current)
        autoResize(communicateTextareaRef.current);
    }, [communicateText]);

    // Track loading state changes to scroll to choices when loading finishes
    useEffect(() => {
      if (wasLoading && !isLoading) {
        // Loading just finished, scroll to this component
        if (ref && 'current' in ref && ref.current) {
          ref.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
      setWasLoading(isLoading);
    }, [isLoading, wasLoading, ref]);

    const handleChoiceClick = async (choiceNumber: number) => {
      if (isLoading) return;
      setProcessingChoice(choiceNumber);
      try {
        await onMakeChoice(choiceNumber);
      } finally {
        setProcessingChoice(null);
      }
    };

    const handleActionSubmit = async () => {
      if (!actionText.trim() || isLoading) return;
      try {
        await onPerformAction(actionText.trim());
        setActionText('');
      } catch {
        // Error handling is done in parent component
      }
    };

    const handleThinkSubmit = async () => {
      if (!thinkText.trim() || isLoading) return;
      try {
        await onPerformThinking(thinkText.trim());
        setThinkText('');
      } catch {
        // Error handling is done in parent component
      }
    };

    const handleCommunicateSubmit = async () => {
      if (!communicateText.trim() || isLoading) return;
      try {
        await onPerformCommunication(communicateText.trim());
        setCommunicateText('');
      } catch {
        // Error handling is done in parent component
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent, submitFn: () => void) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        submitFn();
      }
    };

    return (
      <div ref={ref} className="bg-gray-800 rounded-lg border border-gray-700">
        {/* Header with Summary Button */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-amber-400 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Hành Động
          </h3>
          <button
            onClick={onGetSummary}
            disabled={isLoading}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-sm rounded-md transition-colors flex items-center space-x-2"
            title="Tóm tắt câu chuyện bằng AI"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Tóm Tắt AI</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-4">
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setActiveTab('choices')}
              className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'choices'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Lựa Chọn ({currentChoices.length})
            </button>
            <button
              onClick={() => setActiveTab('action')}
              className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'action'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Hành Động
            </button>
            <button
              onClick={() => setActiveTab('think')}
              className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'think'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Suy Nghĩ
            </button>
            <button
              onClick={() => setActiveTab('communicate')}
              className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'communicate'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Giao Tiếp
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-0">
          {activeTab === 'choices' && (
            <div className="space-y-3">
              {/* Loading indicator when processing */}
              {isLoading && (
                <div className="text-center text-amber-400 py-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-amber-400/20 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-amber-400 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                    <span className="text-lg font-medium">
                      Đang viết câu chuyện...
                    </span>
                    <span className="text-sm text-gray-400">
                      AI đang tạo ra diễn biến tiếp theo
                    </span>
                  </div>
                </div>
              )}

              {!isLoading && currentChoices.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p>Không có lựa chọn nào</p>
                </div>
              ) : !isLoading ? (
                currentChoices.map((choice) => (
                  <button
                    key={choice.number}
                    onClick={() => handleChoiceClick(choice.number)}
                    disabled={isLoading}
                    className={`w-full p-4 rounded-lg border text-left transition-all duration-200 ${
                      processingChoice === choice.number
                        ? 'bg-amber-900/50 border-amber-500/50 text-amber-200'
                        : isLoading
                          ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-amber-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                        {choice.number}
                      </span>
                      <span className="flex-1 leading-relaxed">
                        {choice.text}
                      </span>
                      {processingChoice === choice.number && (
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : null}
            </div>
          )}

          {activeTab === 'action' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mô tả hành động của nhân vật:
                </label>
                <textarea
                  ref={actionTextareaRef}
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleActionSubmit)}
                  placeholder="Ví dụ: Tôi cẩn thận tiến về phía cửa và lắng nghe..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-green-500 resize-none min-h-[80px]"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Nhấn Ctrl+Enter để gửi
                </p>
              </div>
              <button
                onClick={handleActionSubmit}
                disabled={!actionText.trim() || isLoading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>Thực Hiện Hành Động</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'think' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Suy nghĩ của nhân vật:
                </label>
                <textarea
                  ref={thinkTextareaRef}
                  value={thinkText}
                  onChange={(e) => setThinkText(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleThinkSubmit)}
                  placeholder="Ví dụ: Tôi cần cân nhắc kỹ lưỡng trước khi quyết định..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none min-h-[80px]"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Nhấn Ctrl+Enter để gửi
                </p>
              </div>
              <button
                onClick={handleThinkSubmit}
                disabled={!thinkText.trim() || isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <span>Suy Nghĩ</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'communicate' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Giao tiếp với NPC:
                </label>
                <textarea
                  ref={communicateTextareaRef}
                  value={communicateText}
                  onChange={(e) => setCommunicateText(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleCommunicateSubmit)}
                  placeholder="Ví dụ: Xin chào, tôi có thể hỏi bạn về..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none min-h-[80px]"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Nhấn Ctrl+Enter để gửi
                </p>
              </div>
              <button
                onClick={handleCommunicateSubmit}
                disabled={!communicateText.trim() || isLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>Giao Tiếp</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  },
);

ActionInputPanel.displayName = 'ActionInputPanel';

export default ActionInputPanel;
