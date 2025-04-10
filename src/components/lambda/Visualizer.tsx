"use client";

import { lambdaEvaluator } from '@/lib/lambda/evaluator';
import { lambdaParser } from '@/lib/lambda/parser';
import { mathParser } from '@/lib/math/parser';
import { LambdaExpr } from '@/types/lambda';
import { useCallback, useState } from 'react';
import { ExamplesList } from './ExamplesList';
import { ExpressionInput } from './ExpressionInput';
import ReductionSequence from './ReductionSequence';
import TrompDiagram from './TrompDiagram';
import { TrompDiagramInfo } from './TrompDiagramInfo';

export function Visualizer() {
	const [inputExpression, setInputExpression] = useState('');
	const [parsedExpression, setParsedExpression] = useState<LambdaExpr | null>(null);
	const [currentExpression, setCurrentExpression] = useState<LambdaExpr | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [steps, setSteps] = useState(0);
	const [canReduce, setCanReduce] = useState(false);
	const [showReductionSequence, setShowReductionSequence] = useState(false);
	const [showExamples, setShowExamples] = useState(false);
	const [showInfo, setShowInfo] = useState(false);

	// Parse the input expression
	const parseExpression = useCallback((input: string) => {
		if (!input.trim()) {
			setParsedExpression(null);
			setCurrentExpression(null);
			setError(null);
			setSteps(0);
			setCanReduce(false);
			return;
		}

		try {
			// First parse the math expression to lambda calculus
			const parsed = mathParser.parse(input);
			setParsedExpression(parsed);
			setCurrentExpression(parsed);
			setError(null);
			setSteps(0);
			setCanReduce(lambdaEvaluator.betaReduce(parsed) !== null);
		} catch (err) {
			// If math parsing fails, try direct lambda parsing as fallback
			try {
				const parsed = lambdaParser.parse(input);
				setParsedExpression(parsed);
				setCurrentExpression(parsed);
				setError(null);
				setSteps(0);
				setCanReduce(lambdaEvaluator.betaReduce(parsed) !== null);
			} catch (lambdaErr) {
				// Both parsers failed
				setError((err as Error).message);
				setParsedExpression(null);
				setCurrentExpression(null);
				setCanReduce(false);
			}
		}
	}, []);

	// Handle expression input changes
	const handleExpressionChange = useCallback((expression: string) => {
		setInputExpression(expression);
		parseExpression(expression);
	}, [parseExpression]);

	// Handle example selection
	const handleSelectExample = useCallback((expression: string) => {
		setInputExpression(expression);
		parseExpression(expression);
		setShowExamples(false);
	}, [parseExpression]);

	// Perform a single beta reduction step
	const handleReduce = useCallback(() => {
		if (!currentExpression) return;

		const reduced = lambdaEvaluator.betaReduce(currentExpression);
		if (reduced) {
			setCurrentExpression(reduced);
			setSteps(steps + 1);
			setCanReduce(lambdaEvaluator.betaReduce(reduced) !== null);
		}
	}, [currentExpression, steps]);

	// Reset to the original expression
	const handleReset = useCallback(() => {
		if (parsedExpression) {
			setCurrentExpression(parsedExpression);
			setSteps(0);
			setCanReduce(lambdaEvaluator.betaReduce(parsedExpression) !== null);
		}
	}, [parsedExpression]);

	// Reduce to normal form
	const handleNormalForm = useCallback(() => {
		if (!currentExpression) return;

		const normalForm = lambdaEvaluator.reduceToNormalForm(currentExpression);
		setCurrentExpression(normalForm);

		// Count the steps
		let count = 0;
		let expr = currentExpression;
		while (true) {
			const reduced = lambdaEvaluator.betaReduce(expr);
			if (!reduced) break;
			expr = reduced;
			count++;
		}

		setSteps(steps + count);
		setCanReduce(false);
	}, [currentExpression, steps]);

	// Toggle between single diagram and reduction sequence
	const toggleReductionSequence = useCallback(() => {
		setShowReductionSequence(!showReductionSequence);
	}, [showReductionSequence]);

	return (
		<div className="max-w-6xl mx-auto p-4">
			<header className="flex items-center justify-between mb-6 border-b pb-4">
				<h1 className="text-2xl font-bold text-gray-800">λ-Calculus Visualizer</h1>
				<div className="flex space-x-2">
					<button
						onClick={() => setShowExamples(!showExamples)}
						className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition"
					>
						Examples
					</button>
					<button
						onClick={() => setShowInfo(!showInfo)}
						className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition"
					>
						About
					</button>
				</div>
			</header>

			<div className="space-y-4">
				{/* Expression Input */}
				<div className="bg-white rounded-lg shadow-sm border p-3">
					<ExpressionInput
						initialValue={inputExpression}
						onExpressionChange={handleExpressionChange}
					/>
				</div>

				{/* Error Display */}
				{error && (
					<div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
						<strong>Error:</strong> {error}
					</div>
				)}

				{/* Visualization Controls */}
				<div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-3">
					<div className="flex space-x-2">
						<button
							onClick={handleReduce}
							disabled={!canReduce}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${canReduce
								? 'bg-blue-500 text-white hover:bg-blue-600'
								: 'bg-gray-100 text-gray-400 cursor-not-allowed'
								}`}
						>
							Step
						</button>
						<button
							onClick={handleReset}
							disabled={!parsedExpression}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${parsedExpression
								? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
								: 'bg-gray-100 text-gray-400 cursor-not-allowed'
								}`}
						>
							Reset
						</button>
						<button
							onClick={handleNormalForm}
							disabled={!canReduce}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${canReduce
								? 'bg-blue-500 text-white hover:bg-blue-600'
								: 'bg-gray-100 text-gray-400 cursor-not-allowed'
								}`}
						>
							Normalize
						</button>
					</div>

					<div>
						<button
							onClick={toggleReductionSequence}
							className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition"
						>
							{showReductionSequence ? "Single Diagram" : "Reduction Sequence"}
						</button>
					</div>
				</div>

				{/* Steps and Expression Info */}
				{currentExpression && (
					<div className="bg-white rounded-lg shadow-sm border p-3 text-sm text-gray-600">
						<div className="flex justify-between">
							<div>
								<span className="font-medium">Steps: </span>
								<span className="font-mono">{steps}</span>
							</div>
							<div>
								<span className="font-medium">Original: </span>
								<span className="font-mono">{inputExpression}</span>
							</div>
						</div>
					</div>
				)}

				{/* Visualization Area */}
				<div className="bg-white rounded-lg shadow-sm border p-3 overflow-hidden">
					{currentExpression ? (
						showReductionSequence ? (
							<ReductionSequence
								initialExpr={parsedExpression || currentExpression}
								width={800}
								height={500}
							/>
						) : (
							<TrompDiagram
								expr={currentExpression}
								width={800}
								height={500}
							/>
						)
					) : (
						<div className="flex items-center justify-center h-[500px] text-gray-400">
							Enter an expression above to visualize
						</div>
					)}
				</div>
			</div>

			{/* Examples Panel - Slide in/out */}
			{showExamples && (
				<div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg p-4 overflow-y-auto border-l z-10">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-lg font-semibold">Examples</h2>
						<button
							onClick={() => setShowExamples(false)}
							className="text-gray-500 hover:text-gray-700"
						>
							✕
						</button>
					</div>
					<ExamplesList onSelectExample={handleSelectExample} />
				</div>
			)}

			{/* Info Panel - Slide in/out */}
			{showInfo && (
				<div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg p-4 overflow-y-auto border-l z-10">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-lg font-semibold">About Tromp Diagrams</h2>
						<button
							onClick={() => setShowInfo(false)}
							className="text-gray-500 hover:text-gray-700"
						>
							✕
						</button>
					</div>
					<TrompDiagramInfo />
				</div>
			)}
		</div>
	);
}