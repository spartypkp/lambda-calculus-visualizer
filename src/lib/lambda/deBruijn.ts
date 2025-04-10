import { LambdaExpr, createAbstraction, createApplication, createVariable } from '@/types/lambda';

/**
 * De Bruijn term representation for lambda calculus
 * This follows the Haskell implementation more closely
 */
export interface DeBruijnTerm {
	type: 'var' | 'lam' | 'app';
	index?: number;         // For var
	body?: DeBruijnTerm;    // For lam
	left?: DeBruijnTerm;    // For app
	right?: DeBruijnTerm;   // For app
}

/**
 * Convert a lambda expression with named variables to de Bruijn representation
 */
export function toDeBruijn(expr: LambdaExpr): DeBruijnTerm {
	return toDeBruijnWithContext(expr, []);
}

/**
 * Convert with a given context of bound variables
 */
function toDeBruijnWithContext(expr: LambdaExpr, context: string[]): DeBruijnTerm {
	switch (expr.type) {
		case 'variable': {
			const index = context.indexOf(expr.name);
			// Allow free variables by assigning them a special index
			if (index === -1) {
				return {
					type: 'var',
					index: -1,  // Mark as free variable
				};
			}
			return {
				type: 'var',
				index
			};
		}
		case 'abstraction': {
			const newContext = [expr.param, ...context];
			return {
				type: 'lam',
				body: toDeBruijnWithContext(expr.body, newContext)
			};
		}
		case 'application': {
			return {
				type: 'app',
				left: toDeBruijnWithContext(expr.left, context),
				right: toDeBruijnWithContext(expr.right, context)
			};
		}
	}
}

/**
 * Convert a de Bruijn term back to a lambda expression with named variables
 */
export function fromDeBruijn(term: DeBruijnTerm): LambdaExpr {
	return fromDeBruijnWithContext(term, []);
}

/**
 * Convert back to named variables with a given context
 */
function fromDeBruijnWithContext(term: DeBruijnTerm, context: string[]): LambdaExpr {
	switch (term.type) {
		case 'var': {
			if (term.index === undefined) {
				throw new Error('Variable missing index');
			}

			// Handle free variables
			if (term.index === -1 || term.index >= context.length) {
				return createVariable(`free_${term.index === -1 ? context.length : term.index}`);
			}

			return createVariable(context[term.index]);
		}
		case 'lam': {
			if (!term.body) {
				throw new Error('Lambda term missing body');
			}
			const paramName = generateFreshName(context);
			const newContext = [paramName, ...context];
			return createAbstraction(
				paramName,
				fromDeBruijnWithContext(term.body, newContext)
			);
		}
		case 'app': {
			if (!term.left || !term.right) {
				throw new Error('Application missing left or right term');
			}
			return createApplication(
				fromDeBruijnWithContext(term.left, context),
				fromDeBruijnWithContext(term.right, context)
			);
		}
	}
}

/**
 * Generate a fresh variable name that doesn't conflict with existing ones
 */
function generateFreshName(context: string[]): string {
	const vars = ['x', 'y', 'z', 'a', 'b', 'c', 'm', 'n'];
	for (const v of vars) {
		if (!context.includes(v)) return v;
	}
	let i = 0;
	while (context.includes(`x${i}`)) i++;
	return `x${i}`;
}

/**
 * Calculate the dimensions of a term (height and width)
 * This follows the Haskell implementation more closely
 */
export function calculateDimensions(term: DeBruijnTerm): { width: number, height: number; } {
	switch (term.type) {
		case 'var':
			return {
				width: 1,   // Width is 1 grid unit
				height: 0   // Height is 0 (just a point)
			};

		case 'lam': {
			if (!term.body) throw new Error('Lambda term missing body');
			const bodyDims = calculateDimensions(term.body);
			return {
				width: bodyDims.width,
				height: bodyDims.height + 1 // Add 1 for the lambda line
			};
		}

		case 'app': {
			if (!term.left || !term.right) throw new Error('Application missing terms');
			const leftDims = calculateDimensions(term.left);
			const rightDims = calculateDimensions(term.right);
			return {
				width: leftDims.width + rightDims.width, // Combined width
				height: Math.max(leftDims.height, rightDims.height) + 1 // Max height + 1 for app line
			};
		}
	}
}

/**
 * Get free variables from a lambda expression 
 */
export function getFreeVariables(expr: LambdaExpr): string[] {
	return collectFreeVariables(expr);
}

/**
 * Collect all free variables in a lambda expression
 */
function collectFreeVariables(expr: LambdaExpr, bound: string[] = []): string[] {
	switch (expr.type) {
		case 'variable':
			return bound.includes(expr.name) ? [] : [expr.name];
		case 'abstraction':
			return collectFreeVariables(expr.body, [expr.param, ...bound]);
		case 'application':
			return [
				...collectFreeVariables(expr.left, bound),
				...collectFreeVariables(expr.right, bound)
			].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
	}
}
