import { LambdaExpr } from '@/types/lambda';

/**
 * Evaluator for lambda calculus expressions
 */
export class LambdaEvaluator {
	/**
	 * Perform a single beta reduction step on the expression
	 * Returns null if no reduction is possible
	 */
	betaReduce(expr: LambdaExpr): LambdaExpr | null {
		switch (expr.type) {
			case 'variable':
				// Variables cannot be reduced
				return null;

			case 'abstraction':
				// Try to reduce the body of the abstraction
				const reducedBody = this.betaReduce(expr.body);
				if (reducedBody) {
					return {
						type: 'abstraction',
						param: expr.param,
						body: reducedBody
					};
				}
				return null;

			case 'application':
				// Case 1: Redex - Application of an abstraction to an argument
				if (expr.left.type === 'abstraction') {
					// Perform beta reduction: substitute argument for parameter
					return this.substitute(expr.left.body, expr.left.param, expr.right);
				}

				// Case 2: Try to reduce the left side
				const reducedLeft = this.betaReduce(expr.left);
				if (reducedLeft) {
					return {
						type: 'application',
						left: reducedLeft,
						right: expr.right
					};
				}

				// Case 3: Try to reduce the right side
				const reducedRight = this.betaReduce(expr.right);
				if (reducedRight) {
					return {
						type: 'application',
						left: expr.left,
						right: reducedRight
					};
				}

				return null;
		}
	}

	/**
	 * Substitute all free occurrences of a variable in an expression with another expression
	 */
	substitute(expr: LambdaExpr, varName: string, replacement: LambdaExpr): LambdaExpr {
		switch (expr.type) {
			case 'variable':
				// If this is the variable to replace, return the replacement
				if (expr.name === varName) {
					return this.clone(replacement);
				}
				// Otherwise, keep the variable as is
				return expr;

			case 'abstraction':
				// If the abstraction binds the same variable, don't substitute in its body
				if (expr.param === varName) {
					return expr;
				}

				// Check if the parameter name conflicts with free variables in the replacement
				const freeVars = this.freeVariables(replacement);
				if (freeVars.has(expr.param)) {
					// Rename the parameter to avoid variable capture
					const newParam = this.generateFreshName(expr.param, freeVars);
					const renamedBody = this.substitute(expr.body, expr.param, { type: 'variable', name: newParam });
					return {
						type: 'abstraction',
						param: newParam,
						body: this.substitute(renamedBody, varName, replacement)
					};
				}

				// No conflict, substitute in the body
				return {
					type: 'abstraction',
					param: expr.param,
					body: this.substitute(expr.body, varName, replacement)
				};

			case 'application':
				// Substitute in both parts of the application
				return {
					type: 'application',
					left: this.substitute(expr.left, varName, replacement),
					right: this.substitute(expr.right, varName, replacement)
				};
		}
	}

	/**
	 * Find all free variables in an expression
	 */
	freeVariables(expr: LambdaExpr, bound: Set<string> = new Set()): Set<string> {
		switch (expr.type) {
			case 'variable':
				return bound.has(expr.name) ? new Set() : new Set([expr.name]);

			case 'abstraction':
				// Add the parameter to the bound variables
				const newBound = new Set(bound);
				newBound.add(expr.param);
				// Find free variables in the body with updated bound set
				return this.freeVariables(expr.body, newBound);

			case 'application':
				// Combine free variables from both sides
				const leftFree = this.freeVariables(expr.left, bound);
				const rightFree = this.freeVariables(expr.right, bound);
				return new Set([...leftFree, ...rightFree]);
		}
	}

	/**
	 * Generate a fresh variable name that doesn't conflict with existing names
	 */
	generateFreshName(base: string, used: Set<string>): string {
		let fresh = base;
		let counter = 1;
		while (used.has(fresh)) {
			fresh = `${base}${counter}`;
			counter++;
		}
		return fresh;
	}

	/**
	 * Perform multiple reduction steps until the expression reaches normal form
	 * or up to a limit of steps to avoid infinite loops
	 */
	reduceToNormalForm(expr: LambdaExpr, maxSteps: number = 1000): LambdaExpr {
		let current = expr;
		let steps = 0;

		while (steps < maxSteps) {
			const reduced = this.betaReduce(current);
			if (!reduced) {
				// No more reductions possible, we've reached normal form
				break;
			}
			current = reduced;
			steps++;
		}

		return current;
	}

	/**
	 * Generate all reduction steps until normal form
	 */
	reduceMany(expr: LambdaExpr, maxSteps: number = 100): LambdaExpr[] {
		const steps: LambdaExpr[] = [expr];
		let current = expr;

		for (let i = 0; i < maxSteps; i++) {
			const reduced = this.betaReduce(current);
			if (!reduced) break; // No more reductions possible

			steps.push(reduced);
			current = reduced;
		}

		return steps;
	}

	/**
	 * Deep clone a lambda expression
	 */
	clone(expr: LambdaExpr): LambdaExpr {
		switch (expr.type) {
			case 'variable':
				return { type: 'variable', name: expr.name };

			case 'abstraction':
				return {
					type: 'abstraction',
					param: expr.param,
					body: this.clone(expr.body)
				};

			case 'application':
				return {
					type: 'application',
					left: this.clone(expr.left),
					right: this.clone(expr.right)
				};
		}
	}

	/**
	 * Convert a lambda expression to a string
	 */
	toString(expr: LambdaExpr): string {
		switch (expr.type) {
			case 'variable':
				return expr.name;

			case 'abstraction':
				return `λ${expr.param}.${this.toString(expr.body)}`;

			case 'application':
				const left = expr.left.type === 'abstraction'
					? `(${this.toString(expr.left)})`
					: this.toString(expr.left);

				const right = expr.right.type === 'abstraction' || expr.right.type === 'application'
					? `(${this.toString(expr.right)})`
					: this.toString(expr.right);

				return `${left} ${right}`;
		}
	}
}

// Export a singleton instance for convenience
export const lambdaEvaluator = new LambdaEvaluator();