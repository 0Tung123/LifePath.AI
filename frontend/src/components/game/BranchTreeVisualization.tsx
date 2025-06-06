'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TreeNode {
  id: string;
  content: string;
  x: number;
  y: number;
  children: TreeNode[];
  parent?: TreeNode;
  isActive: boolean;
  isCurrent: boolean;
  branchId?: string;
}

interface BranchTreeVisualizationProps {
  sessionId: string;
  onNodeClick: (nodeId: string) => void;
  currentNodeId?: string;
}

export const BranchTreeVisualization: React.FC<BranchTreeVisualizationProps> = ({
  sessionId,
  onNodeClick,
  currentNodeId,
}) => {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    loadTreeData();
  }, [sessionId]);

  const loadTreeData = async () => {
    try {
      setLoading(true);
      const [pathResponse, branchResponse] = await Promise.all([
        fetch(`/api/game/sessions/${sessionId}/path-history`),
        fetch(`/api/game/sessions/${sessionId}/branches`),
      ]);
      
      const pathData = await pathResponse.json();
      const branchData = await branchResponse.json();
      
      // Build tree structure
      const tree = buildTreeStructure(pathData, branchData);
      setTreeData(tree);
    } catch (error) {
      console.error('Failed to load tree data:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildTreeStructure = (pathData: any, branchData: any): TreeNode => {
    const nodes = new Map<string, TreeNode>();
    const nodeWidth = 120;
    const nodeHeight = 80;
    const levelHeight = 100;
    
    // Create nodes for active path
    pathData.pathNodes.forEach((node: any, index: number) => {
      nodes.set(node.id, {
        id: node.id,
        content: node.content.substring(0, 50) + '...',
        x: index * nodeWidth * 1.5,
        y: 0,
        children: [],
        isActive: true,
        isCurrent: node.id === currentNodeId,
        branchId: 'active',
      });
    });

    // Add inactive branches
    branchData.inactiveBranches.forEach((branch: any, branchIndex: number) => {
      branch.paths.forEach((path: any, pathIndex: number) => {
        const node = pathData.allNodes.find((n: any) => n.id === path.nodeId);
        if (node && !nodes.has(node.id)) {
          nodes.set(node.id, {
            id: node.id,
            content: node.content.substring(0, 50) + '...',
            x: pathIndex * nodeWidth * 1.5,
            y: (branchIndex + 1) * levelHeight,
            children: [],
            isActive: false,
            isCurrent: false,
            branchId: branch.branchId,
          });
        }
      });
    });

    // Build parent-child relationships
    const nodeArray = Array.from(nodes.values());
    const rootNode = nodeArray[0];

    // Simple tree layout - this could be improved with a proper tree layout algorithm
    return rootNode || {
      id: 'empty',
      content: 'No data',
      x: 0,
      y: 0,
      children: [],
      isActive: true,
      isCurrent: false,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = Math.max(0.1, Math.min(3, scale + (e.deltaY > 0 ? -0.1 : 0.1)));
    setScale(newScale);
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!treeData) {
    return (
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <p className="text-gray-400 text-sm">Không thể tải dữ liệu cây</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800/50 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Branch Tree
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={resetView}
            className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs transition-colors"
          >
            Reset View
          </button>
          <span className="text-xs text-gray-400">
            Zoom: {Math.round(scale * 100)}%
          </span>
        </div>
      </div>

      <div className="relative w-full h-64 bg-gray-900/50 rounded border border-gray-600 overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="2000" height="1000" fill="url(#grid)" />
            
            {/* Render tree nodes */}
            <g>
              {/* Example nodes - this would be replaced with actual tree rendering */}
              <g>
                <rect
                  x={treeData.x}
                  y={treeData.y + 50}
                  width="100"
                  height="60"
                  rx="8"
                  fill={treeData.isCurrent ? "#3b82f6" : treeData.isActive ? "#10b981" : "#6b7280"}
                  stroke={treeData.isCurrent ? "#60a5fa" : "#9ca3af"}
                  strokeWidth="2"
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => onNodeClick(treeData.id)}
                />
                <text
                  x={treeData.x + 50}
                  y={treeData.y + 75}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  className="pointer-events-none"
                >
                  {treeData.content.substring(0, 15)}...
                </text>
                <text
                  x={treeData.x + 50}
                  y={treeData.y + 90}
                  textAnchor="middle"
                  fill="#d1d5db"
                  fontSize="8"
                  className="pointer-events-none"
                >
                  {treeData.isCurrent ? 'Current' : treeData.isActive ? 'Active' : 'Inactive'}
                </text>
              </g>
            </g>
          </g>
        </svg>

        {/* Controls overlay */}
        <div className="absolute top-2 right-2 flex flex-col space-y-1">
          <button
            onClick={() => setScale(Math.min(3, scale + 0.2))}
            className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center justify-center text-sm"
          >
            +
          </button>
          <button
            onClick={() => setScale(Math.max(0.1, scale - 0.2))}
            className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center justify-center text-sm"
          >
            −
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-300">Current</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-300">Active Branch</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-500 rounded"></div>
          <span className="text-gray-300">Inactive Branch</span>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        💡 Drag to pan, scroll to zoom, click nodes to navigate
      </div>
    </div>
  );
};