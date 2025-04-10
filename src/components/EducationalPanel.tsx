"use client";

import { LambdaNode } from "@/lib/lambdaCalculus";
import { useState } from "react";

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

// Find the difference between two nodes to identify what changed in the reduction
function findDifference(
	current: LambdaNode,
	next: LambdaNode
): { path: string[]; before: string; after: string; } | null {
	// Compare nodes using paths to track location
	function compare(
		node1: LambdaNode,
		node2: LambdaNode,
		path: string[] = []
	): { path: string[]; before: string; after: string; } | null {
		// Check if node types differ
		if (node1.type !== node2.type) {
			return {
				path,
				before: lambdaToString(node1),
				after: lambdaToString(node2)
			};
		}

		// Check specific node types
		if (node1.type === 'variable' && node2.type === 'variable') {
			if (node1.name !== node2.name) {
				return {
					path,
					before: node1.name,
					after: node2.name
				};
			}
		} else if (node1.type === 'abstraction' && node2.type === 'abstraction') {
			// Check parameter names
			if (node1.param !== node2.param) {
				return {
					path,
					before: `λ${node1.param}`,
					after: `λ${node2.param}`
				};
			}

			// Check body recursively
			return compare(node1.body, node2.body, [...path, 'body']);
		} else if (node1.type === 'application' && node2.type === 'application') {
			// Check function part recursively
			const funcDiff = compare(node1.func, node2.func, [...path, 'func']);
			if (funcDiff) return funcDiff;

			// Check argument part recursively
			return compare(node1.arg, node2.arg, [...path, 'arg']);
		}

		// No difference found in this branch
		return null;
	}

	return compare(current, next);
}

// Identify if a node is a beta redex (a function application where the function is an abstraction)
function findBetaRedex(node: LambdaNode): {
	path: string[];
	param: string;
	body: LambdaNode;
	arg: LambdaNode;
} | null {
	if (node.type === 'application' && node.func.type === 'abstraction') {
		// Found a beta redex! (λx.body) arg
		return {
			path: [],
			param: node.func.param,
			body: node.func.body,
			arg: node.arg
		};
	}

	// Recursively search deeper
	if (node.type === 'application') {
		// Check the function part
		const funcRedex = findBetaRedex(node.func);
		if (funcRedex) {
			return {
				...funcRedex,
				path: ['func', ...funcRedex.path]
			};
		}

		// Check the argument part
		const argRedex = findBetaRedex(node.arg);
		if (argRedex) {
			return {
				...argRedex,
				path: ['arg', ...argRedex.path]
			};
		}
	} else if (node.type === 'abstraction') {
		// Check the body
		const bodyRedex = findBetaRedex(node.body);
		if (bodyRedex) {
			return {
				...bodyRedex,
				path: ['body', ...bodyRedex.path]
			};
		}
	}

	// No beta redex found
	return null;
}

// Generate a detailed explanation for the current reduction step
function generateDetailedExplanation(current: LambdaNode, next: LambdaNode | undefined, step: number): string {
	if (!next) {
		return "This is the final result after all beta reductions have been performed. The expression is now in its simplest form (normal form).";
	}

	if (step === 0) {
		// First step - explain the initial Church encoding
		return "This is the initial lambda calculus representation of your mathematical expression using Church encodings. Church numerals represent numbers as higher-order functions: λf.λx.f^n(x) where n is the number being represented.";
	}

	// Find the beta redex in the current term (if any)
	const redex = findBetaRedex(current);

	// Find what changed between current and next
	const diff = findDifference(current, next);

	if (redex) {
		// Explain the beta reduction that's about to happen
		const paramStr = redex.param;
		const argStr = lambdaToString(redex.arg);

		return `Performing β-reduction: (λ${paramStr}.${lambdaToString(redex.body)}) ${argStr} → [${paramStr} := ${argStr}]${lambdaToString(redex.body)}. This substitutes all occurrences of the variable ${paramStr} in the function body with the argument ${argStr}.`;
	}

	if (diff) {
		// Generic explanation based on what changed
		return `The expression is being reduced by substituting values. ${diff.before} is being replaced with ${diff.after}.`;
	}

	// Fallback explanation
	return "Continuing the beta reduction process by applying substitution rules.";
}

export default function EducationalPanel({
	steps,
	currentStep,
	showLambdaNotation,
	onToggleLambdaNotation
}: EducationalPanelProps) {
	const [showDetails, setShowDetails] = useState<boolean>(false);

	// Get the current step and next step (if it exists)
	const currentNode = steps[currentStep];
	const nextNode = steps[currentStep + 1];

	// Generate explanation for the current step
	const explanation = generateDetailedExplanation(currentNode, nextNode, currentStep);

	// Get a simplified explanation based on step number
	const getSimplifiedExplanation = () => {
		if (!nextNode) {
			return "Final result after all reductions.";
		}

		if (currentStep === 0) {
			return "Initial lambda calculus representation.";
		}

		return "Performing beta reduction.";
	};

	return (
		<div className="bg-white p-3 rounded-lg shadow-md w-full text-sm">
			<div className="flex justify-between items-center mb-2">
				<h3 className="font-medium text-gray-700">Step Explanation</h3>
				<div className="flex items-center">
					<button
						onClick={() => setShowDetails(!showDetails)}
						className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded mr-2"
					>
						{showDetails ? "Simplified" : "Detailed"}
					</button>
					<button
						onClick={onToggleLambdaNotation}
						className={`text-xs px-2 py-1 rounded ${showLambdaNotation
							? "bg-blue-100 text-blue-800"
							: "bg-gray-200 hover:bg-gray-300"
							}`}
					>
						λ Notation
					</button>
				</div>
			</div>

			<div className="text-gray-700 border-t pt-2">
				<p>
					{showDetails ? explanation : getSimplifiedExplanation()}
				</p>
			</div>

			{showLambdaNotation && (
				<div className="border-t pt-2 mt-2">
					<h4 className="text-xs font-medium text-gray-700 mb-1">Lambda Notation:</h4>
					<pre className="bg-gray-100 p-2 overflow-x-auto rounded text-xs">
						{lambdaToString(currentNode)}
					</pre>

					{/* Show tooltip icons next to notation */}
					<div className="mt-2 text-xs grid grid-cols-2 gap-2">
						<p className="flex items-center">
							<span className="bg-blue-100 text-blue-800 text-xs font-medium px-1 py-0.5 rounded mr-1">λ</span>
							Lambda abstraction
						</p>
						<p className="flex items-center">
							<span className="bg-green-100 text-green-800 text-xs font-medium px-1 py-0.5 rounded mr-1">x</span>
							Variables
						</p>
						<p className="flex items-center">
							<span className="bg-purple-100 text-purple-800 text-xs font-medium px-1 py-0.5 rounded mr-1">(f)</span>
							Application
						</p>
						<p className="flex items-center">
							<span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-1 py-0.5 rounded mr-1">β</span>
							Beta reduction
						</p>
					</div>
				</div>
			)}
		</div>
	);
} 