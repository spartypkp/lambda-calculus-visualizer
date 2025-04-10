"use client";

import React, { useState, useEffect, useRef } from 'react';
import { LambdaExpr } from '@/types/lambda';
import { gridTrompGenerator, TrompDiagramOptions } from '@/lib/lambda/trompDiagramGrid';

interface TrompDiagramProps {
  expr: LambdaExpr;
  width: number;
  height: number;
  options?: TrompDiagramOptions;
}

export default function TrompDiagram({ 
  expr, 
  width, 
  height, 
  options = { 
    style: 'minimal', 
    showVariableNames: false, 
    showNodeLabels: false 
  } 
}: TrompDiagramProps) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Generate grid-based diagram
  const diagram = gridTrompGenerator.generateGrid(expr, options);
  
  // Reset view when expression changes
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [expr]);
  
  // Handle mouse wheel for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, scale * delta));
    setScale(newScale);
  };
  
  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  // Handle mouse move for panning
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setTranslate(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  // Handle mouse up to end panning
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Get node color based on style
  const getNodeColor = (type: 'abstraction' | 'variable' | 'application') => {
    if (options.style === 'minimal' || options.style === 'classic') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? '#ffffff' : '#000000';
    }
    
    // Only use colors in colored mode
    if (options.style === 'colored') {
      return type === 'variable' ? '#6366F1' : 
             type === 'abstraction' ? '#22C55E' : '#F59E0B';
    }
    
    return '#000000'; // Default fallback
  };
  
  // Get link color based on style
  const getLinkColor = (type: 'abstraction' | 'variable' | 'application') => {
    if (options.style === 'minimal' || options.style === 'classic') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? '#ffffff' : '#000000';
    }
    
    // Only use colors in colored mode
    if (options.style === 'colored') {
      return type === 'variable' ? '#6366F1' : 
             type === 'abstraction' ? '#22C55E' : '#F59E0B';
    }
    
    return '#000000'; // Default fallback
  };
  
  // Reset view
  const handleReset = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };
  
  // Zoom in
  const handleZoomIn = () => {
    setScale(prev => Math.min(5, prev * 1.2));
  };
  
  // Zoom out
  const handleZoomOut = () => {
    setScale(prev => Math.max(0.1, prev * 0.8));
  };
  
  return (
    <div className="relative bg-white border rounded overflow-hidden">
      <div className="absolute top-2 right-2 flex space-x-2 z-10">
        <button 
          onClick={handleZoomIn}
          className="p-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
        >
          Zoom In
        </button>
        <button 
          onClick={handleZoomOut}
          className="p-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
        >
          Zoom Out
        </button>
        <button 
          onClick={handleReset}
          className="p-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
        >
          Reset
        </button>
      </div>
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${diagram.width} ${diagram.height}`}
        className="mx-auto cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>
          {/* Render links */}
          {diagram.links.map(link => (
            <path
              key={link.id}
              d={`M ${link.points.map(p => `${p.x},${p.y}`).join(' L ')}`}
              stroke={getLinkColor(link.type)}
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          
          {/* Render nodes */}
          {diagram.nodes.map(node => {
            switch (node.type) {
              case 'variable':
                return (
                  <g key={node.id} className="diagram-node">
                    <circle
                      cx={node.x + node.width / 2}
                      cy={node.y + node.height / 2}
                      r={4}
                      fill={getNodeColor('variable')}
                    />
                    {options.showVariableNames && node.varName && (
                      <text
                        x={node.x + node.width / 2}
                        y={node.y + node.height + 15}
                        textAnchor="middle"
                        fontSize="12"
                        fill={window.matchMedia('(prefers-color-scheme: dark)').matches ? '#aaaaaa' : '#666666'}
                        className="select-none diagram-text"
                      >
                        {node.varName}
                      </text>
                    )}
                  </g>
                );
                
              case 'abstraction':
                return (
                  <g key={node.id} className="diagram-node">
                    <rect
                      x={node.x}
                      y={node.y}
                      width={node.width / 2}
                      height={node.height / 2}
                      fill={getNodeColor('abstraction')}
                      rx={2}
                    />
                    {options.showNodeLabels && (
                      <text
                        x={node.x + node.width / 4}
                        y={node.y + node.height / 4 + 4}
                        textAnchor="middle"
                        fontSize="12"
                        fill={window.matchMedia('(prefers-color-scheme: dark)').matches ? '#000000' : '#ffffff'}
                        className="select-none diagram-text"
                      >
                        λ
                      </text>
                    )}
                  </g>
                );
                
              case 'application':
                return (
                  <circle
                    key={node.id}
                    cx={node.x + node.width / 4}
                    cy={node.y + node.height / 4}
                    r={3}
                    fill={getNodeColor('application')}
                  />
                );
            }
          })}
        </g>
      </svg>
      
      {/* Show placeholder if no diagram */}
      {(!diagram.nodes.length || !diagram.links.length) && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          No diagram available
        </div>
      )}
    </div>
  );
}