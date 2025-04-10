"use client";

import { lambdaEvaluator } from '@/lib/lambda/evaluator';
import { LambdaExpr } from '@/types/lambda';
import { useEffect, useState } from 'react';
import TrompDiagram from './TrompDiagram';

interface ReductionSequenceProps {
	initialExpr: LambdaExpr;
	width: number;
	height: number;
}

export default function ReductionSequence({ initialExpr, width, height }: ReductionSequenceProps) {
	// Generate the reduction sequence
	const [sequence] = useState(() => lambdaEvaluator.reduceMany(initialExpr));
	const [currentStep, setCurrentStep] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [playSpeed, setPlaySpeed] = useState(1000); // ms per step
	const [showVariableNames, setShowVariableNames] = useState(true);

	// Auto-play functionality
	useEffect(() => {
		if (!isPlaying) return;

		const timer = setTimeout(() => {
			if (currentStep < sequence.length - 1) {
				setCurrentStep(step => step + 1);
			} else {
				setIsPlaying(false);
			}
		}, playSpeed);

		return () => clearTimeout(timer);
	}, [currentStep, isPlaying, playSpeed, sequence.length]);

	return (
		<div className="flex flex-col">
			<div className="mb-4">
				<TrompDiagram
					expr={sequence[currentStep]}
					width={width}
					height={height}
					options={{
						showVariableNames,
						gridSize: 30,
						padding: 30
					}}
				/>
			</div>

			<div className="flex items-center justify-between p-2 bg-gray-100 rounded">
				<div className="text-sm">
					Step {currentStep + 1} of {sequence.length}
				</div>

				<div className="flex space-x-2">
					<button
						onClick={() => setCurrentStep(0)}
						disabled={currentStep === 0}
						className="p-1 bg-white rounded disabled:opacity-50"
					>
						⏮️
					</button>

					<button
						onClick={() => setCurrentStep(step => Math.max(0, step - 1))}
						disabled={currentStep === 0}
						className="p-1 bg-white rounded disabled:opacity-50"
					>
						⏪
					</button>

					<button
						onClick={() => setIsPlaying(!isPlaying)}
						className="p-1 bg-white rounded"
					>
						{isPlaying ? '⏸️' : '▶️'}
					</button>

					<button
						onClick={() => setCurrentStep(step => Math.min(sequence.length - 1, step + 1))}
						disabled={currentStep === sequence.length - 1}
						className="p-1 bg-white rounded disabled:opacity-50"
					>
						⏩
					</button>

					<button
						onClick={() => setCurrentStep(sequence.length - 1)}
						disabled={currentStep === sequence.length - 1}
						className="p-1 bg-white rounded disabled:opacity-50"
					>
						⏭️
					</button>
				</div>

				<div className="flex items-center space-x-2">
					<span className="text-xs">Speed:</span>
					<input
						type="range"
						min="200"
						max="2000"
						step="100"
						value={playSpeed}
						onChange={e => setPlaySpeed(Number(e.target.value))}
						className="w-20"
					/>
				</div>
			</div>

			<div className="flex items-center space-x-4 mt-2 p-2 bg-gray-50 rounded">
				<div className="flex items-center space-x-2">
					<input
						type="checkbox"
						id="showVarNames"
						checked={showVariableNames}
						onChange={e => setShowVariableNames(e.target.checked)}
					/>
					<label htmlFor="showVarNames" className="text-sm">
						Show variable names
					</label>
				</div>
			</div>

			<div className="mt-2 text-sm font-mono p-2 bg-gray-50 rounded">
				{lambdaEvaluator.toString(sequence[currentStep])}
			</div>
		</div>
	);
}