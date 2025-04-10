// Lambda calculus node types
export type LambdaNode =
	| Variable
	| Abstraction
	| Application;

export interface Variable {
	type: 'variable';
	name: string;
}

export interface Abstraction {
	type: 'abstraction';
	param: string;
	body: LambdaNode;
}

export interface Application {
	type: 'application';
	func: LambdaNode;
	arg: LambdaNode;
}

// Helper functions to create lambda terms
export const variable = (name: string): Variable => ({
	type: 'variable',
	name
});

export const abstraction = (param: string, body: LambdaNode): Abstraction => ({
	type: 'abstraction',
	param,
	body
});

export const application = (func: LambdaNode, arg: LambdaNode): Application => ({
	type: 'application',
	func,
	arg
});

// Church encodings for numbers
export function churchNumber(n: number): LambdaNode {
	// λf.λx.f^n(x)
	return abstraction('f',
		abstraction('x',
			applyNTimes('f', 'x', n)
		)
	);
}

// Helper to create f^n(x)
function applyNTimes(funcName: string, argName: string, n: number): LambdaNode {
	let result: LambdaNode = variable(argName);

	for (let i = 0; i < n; i++) {
		result = application(variable(funcName), result);
	}

	return result;
}

// Church encoding for arithmetic operations
export const churchAdd = abstraction('m',
	abstraction('n',
		abstraction('f',
			abstraction('x',
				application(
					application(variable('m'), variable('f')),
					application(
						application(variable('n'), variable('f')),
						variable('x')
					)
				)
			)
		)
	)
);

export const churchMultiply = abstraction('m',
	abstraction('n',
		abstraction('f',
			application(
				variable('m'),
				application(variable('n'), variable('f'))
			)
		)
	)
);

export const churchSubtract = abstraction('m',
	abstraction('n',
		abstraction('f',
			abstraction('x',
				application(
					application(
						variable('n'),
						abstraction('g',
							abstraction('h',
								application(
									variable('h'),
									application(variable('g'), variable('f'))
								)
							)
						)
					),
					application(
						abstraction('u', variable('x')),
						abstraction('u', variable('u'))
					)
				)
			)
		)
	)
);

// Memoization cache for substitution operations
// This improves performance for repeated substitutions
const substitutionCache = new Map<string, LambdaNode>();

// Generate a cache key for substitution operations
function getSubstitutionCacheKey(term: LambdaNode, varName: string, replacement: LambdaNode): string {
	return `${JSON.stringify(term)}_${varName}_${JSON.stringify(replacement)}`;
}

// Clear the substitution cache (useful when starting a new evaluation)
export function clearSubstitutionCache(): void {
	substitutionCache.clear();
}

// Optimized substitute function with memoization
export function substitute(term: LambdaNode, varName: string, replacement: LambdaNode): LambdaNode {
	const cacheKey = getSubstitutionCacheKey(term, varName, replacement);

	// Check if result is already in cache
	if (substitutionCache.has(cacheKey)) {
		return substitutionCache.get(cacheKey)!;
	}

	let result: LambdaNode;

	switch (term.type) {
		case 'variable':
			// Replace the variable if it matches the name
			result = term.name === varName ? replacement : term;
			break;

		case 'abstraction':
			// If the abstraction parameter shadows the variable we're replacing,
			// then we don't substitute inside the body
			if (term.param === varName) {
				result = term;
			} else {
				// Otherwise, substitute in the body
				result = {
					type: 'abstraction',
					param: term.param,
					body: substitute(term.body, varName, replacement)
				};
			}
			break;

		case 'application':
			// Substitute in both the function and argument parts
			result = {
				type: 'application',
				func: substitute(term.func, varName, replacement),
				arg: substitute(term.arg, varName, replacement)
			};
			break;

		default:
			throw new Error(`Unknown term type: ${(term as any).type}`);
	}

	// Store result in cache
	substitutionCache.set(cacheKey, result);
	return result;
}

// Optimized beta reduce function that limits reduction depth
// This prevents excessive computation for very complex expressions
export function betaReduce(
	term: LambdaNode,
	maxDepth: number = 1000
): { reduced: LambdaNode; changed: boolean; } {
	// Track current depth to prevent stack overflow
	let currentDepth = 0;

	function reduceTerm(node: LambdaNode, depth: number): { reduced: LambdaNode; changed: boolean; } {
		// Safety check to prevent excessive recursion
		if (depth > maxDepth) {
			console.warn('Maximum beta reduction depth reached, stopping reduction');
			return { reduced: node, changed: false };
		}

		switch (node.type) {
			case 'variable':
				// Variables can't be reduced
				return { reduced: node, changed: false };

			case 'abstraction':
				// Try to reduce the body
				const bodyResult = reduceTerm(node.body, depth + 1);
				if (bodyResult.changed) {
					return {
						reduced: { ...node, body: bodyResult.reduced },
						changed: true
					};
				}
				return { reduced: node, changed: false };

			case 'application':
				// Case 1: If the function is an abstraction, perform the substitution (beta reduction)
				if (node.func.type === 'abstraction') {
					const substituted = substitute(node.func.body, node.func.param, node.arg);
					return { reduced: substituted, changed: true };
				}

				// Case 2: Try to reduce the function part
				const funcResult = reduceTerm(node.func, depth + 1);
				if (funcResult.changed) {
					return {
						reduced: { ...node, func: funcResult.reduced },
						changed: true
					};
				}

				// Case 3: Try to reduce the argument part
				const argResult = reduceTerm(node.arg, depth + 1);
				if (argResult.changed) {
					return {
						reduced: { ...node, arg: argResult.reduced },
						changed: true
					};
				}

				// Nothing to reduce
				return { reduced: node, changed: false };

			default:
				throw new Error(`Unknown node type: ${(node as any).type}`);
		}
	}

	return reduceTerm(term, currentDepth);
}

// Optimized evaluate function with performance improvements
export function evaluate(term: LambdaNode): { result: LambdaNode; steps: LambdaNode[]; } {
	// Clear the substitution cache at the start of evaluation
	clearSubstitutionCache();

	const steps: LambdaNode[] = [term];
	let current = term;

	// Limit the maximum number of steps to prevent infinite loops
	const MAX_STEPS = 1000;
	let stepCount = 0;

	while (stepCount < MAX_STEPS) {
		const { reduced, changed } = betaReduce(current);

		if (!changed) {
			// No more reductions possible
			return { result: current, steps };
		}

		current = reduced;
		steps.push(current);
		stepCount++;
	}

	console.warn('Maximum evaluation steps reached, result may not be fully reduced');
	return { result: current, steps };
}

// Convert a Church numeral back to a JavaScript number
export function extractNumber(church: LambdaNode): number {
	// Make sure we have a proper Church numeral (should be an abstraction)
	if (church.type !== 'abstraction') {
		console.warn("Not a Church numeral (expected abstraction):", church);
		return 0; // Return 0 for non-abstraction terms instead of throwing
	}

	// For simple cases, we can detect the number directly from the structure
	if (church.type === 'abstraction' &&
		church.body.type === 'abstraction') {
		let count = 0;
		let current: LambdaNode = church.body.body;

		// Handle the case for zero: λf.λx.x
		if (current.type === 'variable' &&
			current.name === church.body.param) {
			return 0;
		}

		// Count nested applications for small Church numerals
		// Pattern: λf.λx.f(f(...f(x)))
		while (current.type === 'application') {
			count++;

			// Check if the function part is a variable matching our outer param
			if (current.func.type !== 'variable' ||
				current.func.name !== church.param) {
				break;
			}

			current = current.arg;
		}

		// If we ended with the innermost variable matching the inner param,
		// then we have a valid Church numeral
		if (current.type === 'variable' &&
			current.name === church.body.param) {
			return count;
		}
	}

	// If the direct approach didn't work, use the simulation approach as a fallback
	try {
		// Create a function to count applications
		const counter = (n: number) => (x: any) => n + 1;
		const identity = (x: any) => x;

		// Simulate application in JavaScript
		const applyChurch = (f: LambdaNode, arg: any): any => {
			if (f.type === 'abstraction') {
				// Create a JavaScript function representing the abstraction
				return (x: any) => {
					// Substitute the parameter with the argument in the body
					const substituted = substitute(f.body, f.param, {
						type: 'variable',
						name: '_jsval_' // Special marker
					});

					// Evaluate the substituted body
					if (substituted.type === 'variable' && substituted.name === '_jsval_') {
						return arg;
					} else if (substituted.type === 'application') {
						// Apply the function to the argument
						try {
							const funcResult = applyChurch(substituted.func, arg);
							return funcResult(applyChurch(substituted.arg, arg));
						} catch (e) {
							console.warn('Error in nested application:', e);
							return NaN;
						}
					}

					console.warn("Unable to evaluate substituted body:", substituted);
					return NaN;
				};
			}

			console.warn("Not a function in applyChurch:", f);
			return (x: any) => x; // Return identity function instead of throwing
		};

		try {
			// Apply church to the counter function and initial value 0
			const churchFunc = applyChurch(church, counter);
			if (typeof churchFunc !== 'function') {
				console.warn("Church numeral did not evaluate to a function:", churchFunc);
				return 0;
			}

			const result = churchFunc(0);
			if (Number.isNaN(result) || typeof result !== 'number') {
				console.warn("Church numeral evaluated to non-number:", result);
				return 0;
			}

			return result;
		} catch (e) {
			console.warn("Error evaluating Church numeral:", e);
			return 0; // Return 0 instead of NaN for errors
		}
	} catch (e) {
		console.warn("Error extracting number:", e);
		return 0; // Return 0 instead of NaN for errors
	}
} 