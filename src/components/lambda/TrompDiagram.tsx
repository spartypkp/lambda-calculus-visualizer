"use client";

import { TrompApplication, trompDiagramGenerator, TrompDiagramOptions, TrompLambda, TrompVariable } from '@/lib/lambda/trompDiagramGrid';
import { LambdaExpr } from '@/types/lambda';
import React, { useEffect, useRef, useState } from 'react';

interface TrompDiagramProps {
	expr: LambdaExpr;
	width: number;
	height: number;
	options?: TrompDiagramOptions;
}

interface TrompColorScheme {
	lambda: string;
	variable: string;
	application: string;
	background: string;
	textFill: string;
	freeVariable?: string;
}

export default function TrompDiagram({
	expr,
	width,
	height,
	options = {
		showVariableNames: true,
		gridSize: 30,
		padding: 30,
		useColors: true
	}
}: TrompDiagramProps) {
	const [scale, setScale] = useState(1);
	const [translate, setTranslate] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const svgRef = useRef<SVGSVGElement>(null);

	// Generate the diagram using our new generator
	const diagram = trompDiagramGenerator.generateDiagram(expr, options);

	// Create a lookup map of lambda colors for variables
	const lambdaColors = React.useMemo(() => {
		const colorMap: { [key: string]: string; } = {};
		if (options.useColors) {
			// Assign different colors for each lambda abstraction
			diagram.lambdas.forEach((lambda, index) => {
				// Use a variety of colors for different lambdas
				const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#f59e0b'];
				colorMap[lambda.id] = colors[index % colors.length];
			});
		}
		return colorMap;
	}, [diagram.lambdas, options.useColors]);

	// Color scheme
	const colors: TrompColorScheme = React.useMemo(() => ({
		lambda: options.useColors ? '#0ea5e9' : '#000',   // Cyan for lambdas
		variable: options.useColors ? '#22c55e' : '#000', // Green for variables
		application: options.useColors ? '#f97316' : '#000', // Orange for applications
		background: options.useColors ? '#f1f5f9' : 'white', // Light gray background
		textFill: options.useColors ? '#334155' : '#333',   // Slate text
		freeVariable: options.useColors ? '#6b7280' : '#000' // Gray for free variables
	}), [options.useColors]);

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

	if (!diagram) {
		return (
			<div className="h-64 w-full flex items-center justify-center bg-gray-100 rounded-md">
				<p className="text-gray-400">No diagram to display</p>
			</div>
		);
	}

	// Calculate the scale for rendering
	const viewBoxWidth = diagram.width;
	const viewBoxHeight = diagram.height;

	// Render a variable in the diagram with improved handling for Church numerals
	const renderVariable = (
		v: TrompVariable,
		colors: TrompColorScheme,
		lambdaColors: { [key: string]: string; },
		showVariableNames: boolean
	) => {
		// Use a color based on the variable's binding lambda
		const varColor = v.lambdaId === 'free'
			? (colors.freeVariable || colors.variable)
			: (lambdaColors[v.lambdaId] || colors.variable);

		// Enhanced vertical line scaling for Church numerals
		// Give variables in deeper applications more visual prominence
		const strokeWidth = 2 + (v.appLevel || 0) * 0.4;

		// Adjust line cap style based on whether this is a free variable
		const lineCap = v.lambdaId === 'free' ? 'round' : 'square';

		return (
			<g key={v.id} data-id={v.id} className="tromp-variable">
				{/* Vertical line with enhanced styling for Church numerals */}
				<line
					x1={v.x}
					y1={v.y}
					x2={v.x}
					y2={v.y + v.height}
					stroke={varColor}
					strokeWidth={strokeWidth}
					strokeLinecap={lineCap}
				/>

				{/* Variable name label - conditionally rendered with improved positioning */}
				{showVariableNames && v.name && (
					<text
						x={v.x}
						y={v.y - 8}
						textAnchor="middle"
						fontSize="12"
						fill={varColor}
						fontWeight={v.appLevel && v.appLevel > 1 ? 'bold' : 'normal'}
					>
						{v.name}
					</text>
				)}
			</g>
		);
	};

	// Render an application in the diagram with improved Church numeral connections
	const renderApplication = (
		app: TrompApplication,
		colors: TrompColorScheme,
		variables: TrompVariable[]
	) => {
		// Find corresponding variables
		const leftVar = variables.find(v => v.id === app.leftVarId);
		const rightVar = variables.find(v => v.id === app.rightVarId);

		// Enhanced styling based on application level - deeper levels get more emphasis
		const strokeWidth = 2 + (app.level || 0) * 0.3;
		const opacity = 0.8 + (app.level || 0) * 0.05;

		// Church numeral applications need clearer connections
		return (
			<g key={app.id} data-id={app.id} className="tromp-application">
				{/* Horizontal connection line with improved styling */}
				<line
					x1={app.x1}
					y1={app.y}
					x2={app.x2}
					y2={app.y}
					stroke={colors.application}
					strokeWidth={strokeWidth}
					opacity={opacity}
					strokeLinecap="round"
				/>

				{/* Connection dots at variable intersections for better visibility */}
				<circle
					cx={app.x1}
					cy={app.y}
					r={3 + (app.level || 0) * 0.2}
					fill={colors.application}
					opacity={opacity + 0.1}
				/>
				<circle
					cx={app.x2}
					cy={app.y}
					r={3 + (app.level || 0) * 0.2}
					fill={colors.application}
					opacity={opacity + 0.1}
				/>
			</g>
		);
	};

	// Render a lambda abstraction (horizontal line)
	const renderLambda = (
		lambda: TrompLambda,
		colors: TrompColorScheme,
		lambdaColors: { [key: string]: string; },
		showVariableNames: boolean
	) => {
		// Use lambda colors from our map or default lambda color
		const lambdaColor = lambdaColors[lambda.id] || colors.lambda;

		return (
			<g key={lambda.id} data-id={lambda.id} className="tromp-lambda">
				{/* Horizontal line */}
				<line
					x1={lambda.x}
					y1={lambda.y}
					x2={lambda.x + lambda.width}
					y2={lambda.y}
					stroke={lambdaColor}
					strokeWidth={3}
					strokeLinecap="round"
				/>

				{/* Parameter name */}
				{showVariableNames && lambda.paramName && (
					<text
						x={lambda.x - 5}
						y={lambda.y - 5}
						fontSize={12}
						fill={lambdaColor}
						textAnchor="end"
						dominantBaseline="baseline"
					>
						λ{lambda.paramName}.
					</text>
				)}
			</g>
		);
	};

	return (
		<div className="w-full max-w-full overflow-auto p-4 bg-gray-50 rounded-lg border border-gray-200">
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
				width={diagram.width}
				height={diagram.height}
				viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
				style={{ background: colors.background }}
				className="mx-auto cursor-move"
				onWheel={handleWheel}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
			>
				<g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>
					{/* Draw applications first (so they appear behind variables) */}
					{diagram.applications.map(app =>
						renderApplication(app, colors, diagram.variables)
					)}

					{/* Draw variables above applications */}
					{diagram.variables.map(variable =>
						renderVariable(variable, colors, lambdaColors, options.showVariableNames)
					)}

					{/* Draw lambdas on top */}
					{diagram.lambdas.map(lambda =>
						renderLambda(lambda, colors, lambdaColors, options.showVariableNames)
					)}
				</g>
			</svg>
		</div>
	);
}