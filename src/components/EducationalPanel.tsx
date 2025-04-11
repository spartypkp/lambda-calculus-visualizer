"use client";

import { LambdaNode } from "@/lib/lambdaCalculus";

// Remove unused import
// import { LambdaNode } from "@/lib/lambdaCalculus";

// Remove unused interface
// interface EducationalPanelProps {
// 	steps: LambdaNode[];
// 	currentStep: number;
// 	showLambdaNotation: boolean;
// 	onToggleLambdaNotation: () => void;
// }

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

export default function EducationalPanel() {
	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-sm">
			<h3 className="font-medium text-blue-800 mb-2 flex items-center text-base">
				<svg className="w-4 h-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
						d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
				</svg>
				Lambda Calculus Basics
			</h3>

			<div className="space-y-2 text-gray-700">
				<div className="bg-blue-50 p-2 rounded-md">
					<h4 className="font-medium text-blue-800 mb-1 text-xs">Syntax</h4>
					<ul className="list-disc pl-4 space-y-0.5 text-xs">
						<li><span className="font-mono bg-blue-100 text-blue-800 px-1 rounded">x</span> - Variable</li>
						<li><span className="font-mono bg-blue-100 text-blue-800 px-1 rounded">λx.M</span> - Abstraction (function)</li>
						<li><span className="font-mono bg-blue-100 text-blue-800 px-1 rounded">(M N)</span> - Application (call)</li>
					</ul>
				</div>

				<div>
					<h4 className="font-medium text-blue-800 mb-1 text-xs">Reduction Rules</h4>
					<ul className="list-disc pl-4 space-y-0.5 text-xs">
						<li>
							<span className="font-medium">Alpha</span>: Renaming bound variables
							<div className="font-mono text-xs mt-0.5 bg-gray-50 p-0.5 rounded">λx.x → λy.y</div>
						</li>
						<li>
							<span className="font-medium">Beta</span>: Function application
							<div className="font-mono text-xs mt-0.5 bg-gray-50 p-0.5 rounded">(λx.M) N → M[x := N]</div>
						</li>
						<li>
							<span className="font-medium">Eta</span>: Function extensionality
							<div className="font-mono text-xs mt-0.5 bg-gray-50 p-0.5 rounded">λx.(M x) → M</div>
						</li>
					</ul>
				</div>

				<div className="bg-purple-50 p-2 rounded-md">
					<h4 className="font-medium text-purple-800 mb-1 text-xs">Common Combinators</h4>
					<div className="grid grid-cols-2 gap-1 text-xs">
						<div className="flex items-center">
							<span className="bg-purple-200 text-purple-800 font-medium rounded-full w-5 h-5 inline-flex items-center justify-center mr-1">I</span>
							<span><span className="font-mono bg-purple-100 text-purple-800 px-1 rounded">λx.x</span></span>
						</div>
						<div className="flex items-center">
							<span className="bg-purple-200 text-purple-800 font-medium rounded-full w-5 h-5 inline-flex items-center justify-center mr-1">K</span>
							<span><span className="font-mono bg-purple-100 text-purple-800 px-1 rounded">λx.λy.x</span></span>
						</div>
						<div className="flex items-center">
							<span className="bg-purple-200 text-purple-800 font-medium rounded-full w-5 h-5 inline-flex items-center justify-center mr-1">S</span>
							<span><span className="font-mono bg-purple-100 text-purple-800 px-1 rounded">λx.λy.λz.xz(yz)</span></span>
						</div>
						<div className="flex items-center">
							<span className="bg-purple-200 text-purple-800 font-medium rounded-full w-5 h-5 inline-flex items-center justify-center mr-1">Ω</span>
							<span><span className="font-mono bg-purple-100 text-purple-800 px-1 rounded">(λx.xx)(λx.xx)</span></span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
} 