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

// Beta reduction (substitution)
export function substitute(term: LambdaNode, varName: string, replacement: LambdaNode): LambdaNode {
	switch (term.type) {
		case 'variable':
			// Replace the variable if it matches the name
			return term.name === varName ? replacement : term;

		case 'abstraction':
			// If the abstraction parameter shadows the variable we're replacing,
			// then we don't substitute inside the body
			if (term.param === varName) {
				return term;
			}

			// Otherwise, substitute in the body
			return {
				type: 'abstraction',
				param: term.param,
				body: substitute(term.body, varName, replacement)
			};

		case 'application':
			// Substitute in both the function and argument parts
			return {
				type: 'application',
				func: substitute(term.func, varName, replacement),
				arg: substitute(term.arg, varName, replacement)
			};
	}
}

// Perform a single beta reduction step, if possible
export function betaReduce(term: LambdaNode): { reduced: LambdaNode; changed: boolean; } {
	switch (term.type) {
		case 'variable':
			// Variables can't be reduced
			return { reduced: term, changed: false };

		case 'abstraction':
			// Try to reduce the body
			const bodyResult = betaReduce(term.body);
			if (bodyResult.changed) {
				return {
					reduced: { ...term, body: bodyResult.reduced },
					changed: true
				};
			}
			return { reduced: term, changed: false };

		case 'application':
			// Case 1: If the function is an abstraction, perform the substitution (beta reduction)
			if (term.func.type === 'abstraction') {
				const substituted = substitute(term.func.body, term.func.param, term.arg);
				return { reduced: substituted, changed: true };
			}

			// Case 2: Try to reduce the function part
			const funcResult = betaReduce(term.func);
			if (funcResult.changed) {
				return {
					reduced: { ...term, func: funcResult.reduced },
					changed: true
				};
			}

			// Case 3: Try to reduce the argument part
			const argResult = betaReduce(term.arg);
			if (argResult.changed) {
				return {
					reduced: { ...term, arg: argResult.reduced },
					changed: true
				};
			}

			// Nothing to reduce
			return { reduced: term, changed: false };
	}
}

// Fully evaluate a lambda term using normal order reduction
export function evaluate(term: LambdaNode): { result: LambdaNode; steps: LambdaNode[]; } {
	const steps: LambdaNode[] = [term];
	let current = term;

	while (true) {
		const { reduced, changed } = betaReduce(current);

		if (!changed) {
			// No more reductions possible
			return { result: current, steps };
		}

		current = reduced;
		steps.push(current);
	}
}

// Convert a Church numeral back to a JavaScript number
export function extractNumber(church: LambdaNode): number {
	if (church.type !== 'abstraction') {
		throw new Error("Not a Church numeral");
	}

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
					const funcResult = applyChurch(substituted.func, arg);
					return funcResult(applyChurch(substituted.arg, arg));
				}

				throw new Error("Unable to evaluate Church numeral");
			};
		}
		throw new Error("Not a function");
	};

	try {
		// Apply church to the counter function and initial value 0
		const churchFunc = applyChurch(church, counter);
		return churchFunc(0);
	} catch (e) {
		console.error("Error extracting number:", e);
		return NaN;
	}
} 