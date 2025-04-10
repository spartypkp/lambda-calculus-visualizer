"use client";

import { LambdaNode } from "@/lib/lambdaCalculus";

interface EducationalPanelProps {
	steps: LambdaNode[];
	currentStep: number;
	showLambdaNotation: boolean;
	onToggleLambdaNotation: () => void;
}

// Helper function to generate a simple textual representation of a lambda term
function lambdaToString(node: LambdaNode): string {
	switch (node.type) {
		case "variable":
			return node.name;
		case "abstraction":
			return `(λ${node.param}.${lambdaToString(node.body)})`;
		case "application":
			return `(${lambdaToString(node.func)} ${lambdaToString(node.arg)})`;
		default:
			return "unknown";
	}
}

// Generate an explanation for the current reduction step
function generateExplanation(current: LambdaNode, next: LambdaNode | undefined, step: number): string {
	if (!next) {
		return "This is the final result after all beta reductions have been performed.";
	}

	if (step === 0) {
		return "This is the initial lambda calculus representation of your expression.";
	}

	// Simple explanation based on current step
	return "Performing beta reduction by substituting the bound variable with the argument.";
}

export default function EducationalPanel({
	steps,
	currentStep,
	showLambdaNotation,
	onToggleLambdaNotation
}: EducationalPanelProps) {
	// Get the current step and next step (if it exists)
	const currentNode = steps[currentStep];
	const nextNode = steps[currentStep + 1];

	// Generate explanation for the current step
	const explanation = generateExplanation(currentNode, nextNode, currentStep);

	return (
		<div className="bg-white p-4 rounded-lg shadow-md w-full">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-medium text-gray-800">Step Explanation</h3>

				<div className="flex items-center">
					<label className="inline-flex items-center cursor-pointer mr-2">
						<span className="mr-2 text-sm text-gray-700">Show Lambda Notation</span>
						<input
							type="checkbox"
							checked={showLambdaNotation}
							onChange={onToggleLambdaNotation}
							className="sr-only peer"
						/>
						<div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
					</label>
				</div>
			</div>

			<div className="mb-4 p-3 bg-gray-50 rounded text-gray-700">
				{explanation}
			</div>

			{showLambdaNotation && (
				<div className="border-t pt-4">
					<h4 className="text-sm font-medium text-gray-700 mb-2">Lambda Notation:</h4>
					<pre className="bg-gray-100 p-3 overflow-x-auto rounded text-sm">
						{lambdaToString(currentNode)}
					</pre>

					{/* Show tooltip icons next to notation */}
					<div className="mt-4 text-sm">
						<p className="flex items-center mb-2">
							<span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">λ</span>
							Lambda abstraction - defines a function with a parameter
						</p>
						<p className="flex items-center mb-2">
							<span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">x y z</span>
							Variables - represent values or parameters
						</p>
						<p className="flex items-center">
							<span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">(f x)</span>
							Application - applying a function to an argument
						</p>
					</div>
				</div>
			)}
		</div>
	);
} 