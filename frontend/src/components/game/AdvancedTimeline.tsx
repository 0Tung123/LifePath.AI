'use client';

import React, { useState, useEffect } from 'react';

interface Branch {
  branchId: string;
  paths: any[];
  createdAt: number;
  isActive?: boolean;
}

interface BranchPoint {
  nodeId: string;
  paths: any[];
  branchCount: number;
}

interface AdvancedTimelineProps {
  sessionId: string;
  onNodeSelect: (nodeId: string) => void;
  onBranchRestore: (branchId: string) => void;
  currentNodeId?: string;
}

export const AdvancedTimeline: React.FC<AdvancedTimelineProps> = ({
  sessionId,
  onNodeSelect,
  onBranchRestore,
  currentNodeId,
}) => {
  const [branches, setBranches] = useState<any>(null);
  const [pathHistory, setPathHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState(0);
  const [showBranches, setShowBranches] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pathResponse, branchResponse] = await Promise.all([
        fetch(`/api/game/sessions/${sessionId}/path-history`),
        fetch(`/api/game/sessions/${sessionId}/branches`),
      ]);
      
      const pathData = await pathResponse.json();
      const branchData = await branchResponse.json();
      
      setPathHistory(pathData);
      setBranches(branchData);
      
      // Set current step
      const currentIndex = pathData.currentPath.findIndex((nodeId: string) => nodeId === currentNodeId);
      if (currentIndex >= 0) {
        setSelectedStep(currentIndex);
      }
    } catch (error) {
      console.error('Failed to load timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (pathHistory && pathHistory.currentPath[stepIndex]) {
      // Add current state to undo stack
      setUndoStack(prev => [...prev, pathHistory.currentPath[selectedStep]]);
      setRedoStack([]); // Clear redo stack
      
      setSelectedStep(stepIndex);
      onNodeSelect(pathHistory.currentPath[stepIndex]);
    }
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousNodeId = undoStack[undoStack.length - 1];
      setRedoStack(prev => [...prev, pathHistory.currentPath[selectedStep]]);
      setUndoStack(prev => prev.slice(0, -1));
      
      const stepIndex = pathHistory.currentPath.findIndex((nodeId: string) => nodeId === previousNodeId);
      if (stepIndex >= 0) {
        setSelectedStep(stepIndex);
        onNodeSelect(previousNodeId);
      }
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextNodeId = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, pathHistory.currentPath[selectedStep]]);
      setRedoStack(prev => prev.slice(0, -1));
      
      const stepIndex = pathHistory.currentPath.findIndex((nodeId: string) => nodeId === nextNodeId);
      if (stepIndex >= 0) {
        setSelectedStep(stepIndex);
        onNodeSelect(nextNodeId);
      }
    }
  };

  const handleBranchRestore = async (branchId: string) => {
    try {
      await onBranchRestore(branchId);
      await loadData(); // Reload data after branch restore
    } catch (error) {
      console.error('Failed to restore branch:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-8 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!pathHistory || pathHistory.currentPath.length === 0) {
    return (
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <p className="text-gray-400 text-sm">Chưa có lịch sử đường đi</p>
      </div>
    );
  }

  const maxSteps = pathHistory.currentPath.length - 1;

  return (
    <div className="p-4 bg-gray-800/50 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Advanced Timeline
        </h3>
        
        <div className="flex items-center space-x-2">
          {/* Undo/Redo buttons */}
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="p-1 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-colors"
            title="Undo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-1 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-colors"
            title="Redo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>
          
          {/* Branch toggle */}
          <button
            onClick={() => setShowBranches(!showBranches)}
            className={`p-1 rounded text-xs transition-colors ${
              showBranches ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
            title="Toggle Branches"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Timeline */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="range"
            min="0"
            max={maxSteps}
            value={selectedStep}
            onChange={(e) => handleStepClick(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(selectedStep / maxSteps) * 100}%, #374151 ${(selectedStep / maxSteps) * 100}%, #374151 100%)`
            }}
          />
          
          {/* Step markers with branch indicators */}
          <div className="flex justify-between mt-2">
            {pathHistory.currentPath.map((nodeId: string, index: number) => {
              const isBranchPoint = branches?.branchPoints?.some((bp: BranchPoint) => bp.nodeId === nodeId);
              
              return (
                <div key={nodeId} className="relative">
                  <button
                    onClick={() => handleStepClick(index)}
                    className={`w-4 h-4 rounded-full border-2 transition-all relative ${
                      index === selectedStep
                        ? 'bg-blue-500 border-blue-500 scale-125'
                        : index < selectedStep
                        ? 'bg-blue-400 border-blue-400'
                        : 'bg-gray-600 border-gray-600'
                    } hover:scale-110 ${
                      isBranchPoint ? 'ring-2 ring-yellow-400' : ''
                    }`}
                    title={`Bước ${index + 1}${isBranchPoint ? ' (Branch Point)' : ''}`}
                  />
                  
                  {/* Branch indicator */}
                  {isBranchPoint && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step info */}
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-400">
            Bước {selectedStep + 1} / {pathHistory.currentPath.length}
          </span>
          {undoStack.length > 0 && (
            <span className="text-xs text-blue-400 ml-2">
              ({undoStack.length} undo available)
            </span>
          )}
        </div>
      </div>

      {/* Branch Visualization */}
      {showBranches && branches && (
        <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
          <h4 className="text-md font-semibold mb-3 text-white flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Branches ({branches.inactiveBranches.length} inactive)
          </h4>
          
          {/* Active Branch */}
          <div className="mb-3">
            <div className="flex items-center justify-between p-2 bg-green-900/20 border border-green-800/30 rounded">
              <span className="text-green-400 text-sm font-medium">
                🟢 Active Branch ({branches.activeBranch.length} steps)
              </span>
              <span className="text-xs text-gray-400">Current</span>
            </div>
          </div>
          
          {/* Inactive Branches */}
          {branches.inactiveBranches.map((branch: Branch) => (
            <div key={branch.branchId} className="mb-2">
              <div className="flex items-center justify-between p-2 bg-gray-900/20 border border-gray-600/30 rounded">
                <div className="flex-1">
                  <span className="text-gray-300 text-sm font-medium">
                    🔴 Branch {branch.branchId.substring(0, 8)}... ({branch.paths.length} steps)
                  </span>
                  <div className="text-xs text-gray-400 mt-1">
                    Created: {new Date(branch.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => handleBranchRestore(branch.branchId)}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                >
                  Restore
                </button>
              </div>
            </div>
          ))}
          
          {/* Branch Points */}
          {branches.branchPoints.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-yellow-400 mb-2">
                🔀 Branch Points ({branches.branchPoints.length})
              </h5>
              {branches.branchPoints.map((point: BranchPoint) => (
                <div key={point.nodeId} className="text-xs text-gray-400 mb-1">
                  Node {point.nodeId.substring(0, 8)}... ({point.branchCount} branches)
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Current step details */}
      {pathHistory.pathNodes[selectedStep] && (
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
              Bước {selectedStep + 1}
            </span>
            {selectedStep === pathHistory.currentPath.length - 1 && (
              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                Hiện tại
              </span>
            )}
          </div>
          
          <div className="text-sm text-gray-300 mb-2 line-clamp-3">
            {pathHistory.pathNodes[selectedStep].content.substring(0, 150)}...
          </div>
          
          {pathHistory.pathNodes[selectedStep].selectedChoiceText && (
            <div className="text-xs text-blue-400 italic">
              → {pathHistory.pathNodes[selectedStep].selectedChoiceText}
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => handleStepClick(Math.max(0, selectedStep - 1))}
          disabled={selectedStep === 0}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
        >
          ← Trước
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-colors"
          >
            Undo
          </button>
          
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-colors"
          >
            Redo
          </button>
        </div>
        
        <button
          onClick={() => handleStepClick(Math.min(maxSteps, selectedStep + 1))}
          disabled={selectedStep === maxSteps}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
        >
          Sau →
        </button>
      </div>

      {/* Statistics */}
      <div className="mt-4 p-2 bg-gray-900/20 border border-gray-600/30 rounded text-xs text-gray-400">
        <div className="grid grid-cols-2 gap-2">
          <div>📊 Total Nodes: {pathHistory.allNodes.length}</div>
          <div>🌿 Active Path: {pathHistory.pathNodes.length}</div>
          <div>🔀 Branch Points: {branches?.branchPoints?.length || 0}</div>
          <div>💾 Saved Branches: {branches?.inactiveBranches?.length || 0}</div>
        </div>
      </div>
    </div>
  );
};