"use client";

import { lambdaEvaluator } from '@/lib/lambda/evaluator';
import { parseMathToLambda } from '@/lib/math/parser';
import { LambdaExpr } from '@/types/lambda';
import { useEffect, useState } from 'react';
import { InfoPanel } from './InfoPanel';
import ReductionSequence from './ReductionSequence';
import TrompDiagram from './TrompDiagram';

// We'll add some example expressions later
const createSampleExpressions = (): LambdaExpr[] => {
	// This is just a placeholder - we'd actually parse real expressions
	const sampleExpr: LambdaExpr = {
		type: 'abstraction',
		param: 'x',
		body: { type: 'variable', name: 'x' }
	};

	return [sampleExpr];
};

const Visualizer = () => {
	const [expressions, setExpressions] = useState<LambdaExpr[]>([]);
	const [currentExpr, setCurrentExpr] = useState<LambdaExpr | null>(null);
	const [showInfo, setShowInfo] = useState(false);
	const [showVariableNames, setShowVariableNames] = useState(true);
	const [useColors, setUseColors] = useState(true);
	const [inputValue, setInputValue] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [evaluationSteps, setEvaluationSteps] = useState<LambdaExpr[]>([]);

	// Load sample expressions on mount
	useEffect(() => {
		const samples = createSampleExpressions();
		setExpressions(samples);
		if (samples.length > 0) {
			setCurrentExpr(samples[0]);
		}
	}, []);

	const handleSelectExpr = (expr: LambdaExpr) => {
		setCurrentExpr(expr);
	};

	const toggleInfo = () => {
		setShowInfo(!showInfo);
	};

	const toggleVariableNames = () => {
		setShowVariableNames(!showVariableNames);
	};

	const toggleColors = () => {
		setUseColors(!useColors);
	};

	const handleParse = () => {
		setError(null);

		try {
			// Try to parse as a math expression first
			const lambdaExpr = parseMathToLambda(inputValue);

			if (lambdaExpr) {
				// Successfully parsed
				const allExpressions = [lambdaExpr];
				setExpressions(allExpressions);
				setCurrentExpr(lambdaExpr);

				// Generate evaluation steps
				const steps = lambdaEvaluator.reduceMany(lambdaExpr);
				setEvaluationSteps(steps);

				// If we have a result (reduced form), add it to our expressions
				if (steps.length > 1) {
					const result = steps[steps.length - 1];
					setExpressions([lambdaExpr, result]);
				}
			} else {
				setError("Could not parse expression. Try a simple math expression like '1+2'.");
			}
		} catch (e) {
			setError(`Error: ${e instanceof Error ? e.message : String(e)}`);
		}
	};

	return (
		<div className="grid grid-cols-1 gap-4">
			<div className="flex flex-col space-y-2">
				<h1 className="text-2xl font-bold">Lambda Calculus Visualizer</h1>
				<div className="flex space-x-2">
					<input
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder="Enter math expression (e.g., 1+3)"
						className="flex-1 px-3 py-2 border rounded"
						onKeyDown={(e) => {
							if (e.key === 'Enter') handleParse();
						}}
					/>
					<button
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						onClick={handleParse}
					>
						Visualize
					</button>
				</div>
				{error && <div className="text-red-500 text-sm">{error}</div>}
			</div>

			<div className="flex space-x-2 mb-4">
				<button
					onClick={toggleVariableNames}
					className={`px-3 py-1 text-sm rounded ${showVariableNames ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
				>
					{showVariableNames ? 'Hide Variable Names' : 'Show Variable Names'}
				</button>
				<button
					onClick={toggleInfo}
					className={`px-3 py-1 text-sm rounded ${showInfo ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
				>
					{showInfo ? 'Hide Info Panel' : 'Show Info Panel'}
				</button>
			</div>

			<div className="flex flex-wrap lg:flex-nowrap gap-4">
				<div className="w-full lg:w-1/2">
					<h2 className="text-lg font-semibold mb-2">Current Expression</h2>
					<div className="p-4 border rounded bg-white">
						{currentExpr ? (
							<TrompDiagram
								expr={currentExpr}
								width={500}
								height={300}
								options={{
									showVariableNames,
									gridSize: 30,
									padding: 20
								}}
							/>
						) : (
							<div className="text-gray-500 text-center p-4">
								Enter an expression and click "Visualize"
							</div>
						)}
					</div>
				</div>
				{showInfo && (
					<div className="w-full lg:w-1/2">
						<h2 className="text-lg font-semibold mb-2">Info</h2>
						<div className="p-4 border rounded bg-white">
							<InfoPanel
								expression={currentExpr}
								originalExpression={inputValue}
								steps={evaluationSteps.length}
							/>
						</div>
					</div>
				)}
			</div>

			<div className="mt-4">
				<h2 className="text-lg font-semibold mb-2">Reduction Sequence</h2>
				<div className="p-4 border rounded bg-white">
					{!currentExpr ? (
						<div className="text-gray-500 text-center p-4">
							Enter an expression and click "Visualize" to see the reduction sequence
						</div>
					) : (
						<ReductionSequence
							initialExpr={currentExpr!}
							width={500}
							height={300}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default Visualizer;