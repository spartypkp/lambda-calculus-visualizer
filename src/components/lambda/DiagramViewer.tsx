"use client";

import { useRef, useEffect, useState } from 'react';
import { TrompDiagram, TrompNode, TrompLink } from '@/lib/lambda/trompDiagram';

interface DiagramViewerProps {
  diagram: TrompDiagram | null;
  width?: number;
  height?: number;
  alternativeStyle?: boolean;
}

export function DiagramViewer({ 
  diagram, 
  width = 600, 
  height = 400, 
  alternativeStyle = false 
}: DiagramViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!diagram || !svgRef.current) return;

    // Reset view when diagram changes
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [diagram]);

  // Handle mouse wheel for zooming
  const handleWheel = (e: React.WheelEvent) => {
    if (!diagram) return;
    
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(4, scale * delta));
    
    setScale(newScale);
  };

  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!diagram) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse move for panning
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !diagram) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setTranslate({
      x: translate.x + dx,
      y: translate.y + dy
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse up to stop panning
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calculate the transform for the diagram
  const transform = `translate(${translate.x}, ${translate.y}) scale(${scale})`;

  // Calculate padding to center the diagram
  const padding = {
    x: diagram && diagram.width * scale < width ? (width - diagram.width * scale) / 2 : 0,
    y: diagram && diagram.height * scale < height ? (height - diagram.height * scale) / 2 : 0
  };

  return (
    <div className="w-full h-full border border-gray-300 rounded-md overflow-hidden diagram-container">
      {diagram ? (
        <svg 
          ref={svgRef} 
          width={width} 
          height={height} 
          className="w-full h-full"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            {/* Removed drop shadow filter for cleaner look */}
          </defs>
          <g transform={`translate(${padding.x}, ${padding.y}) ${transform}`}>
            {/* Render abstraction lines (vertical now) */}
            {diagram.links.filter(link => link.type === 'abstraction').map(link => (
              <line
                key={link.id}
                x1={link.x1}
                y1={link.y1}
                x2={link.x2}
                y2={link.y2}
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
              />
            ))}
            
            {/* Render variable lines (horizontal now) */}
            {diagram.links.filter(link => link.type === 'variable').map(link => (
              <line
                key={link.id}
                x1={link.x1}
                y1={link.y1}
                x2={link.x2}
                y2={link.y2}
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
              />
            ))}
            
            {/* Render application links (vertical connections now) */}
            {diagram.links.filter(link => link.type === 'application').map(link => (
              <path
                key={link.id}
                d={`M ${link.x1} ${link.y1} C ${link.x1 - 15} ${(link.y1 + link.y2) / 2}, ${link.x2 - 15} ${(link.y1 + link.y2) / 2}, ${link.x2} ${link.y2}`}
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
              />
            ))}
            
            {/* Render abstraction nodes (circles at the start of horizontal lines) */}
            {diagram.nodes.filter(node => node.type === 'abstraction').map(node => (
              <g key={node.id} className="diagram-node">
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={4}
                  fill="currentColor"
                />
              </g>
            ))}
            
            {/* Render variable nodes (circles at the end of vertical lines) */}
            {diagram.nodes.filter(node => node.type === 'variable').map(node => (
              <g key={node.id} className="diagram-node">
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={4}
                  fill="currentColor"
                />
              </g>
            ))}
          </g>
        </svg>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 text-center p-4">
          Enter a lambda expression to see its diagram
        </div>
      )}
    </div>
  );
}