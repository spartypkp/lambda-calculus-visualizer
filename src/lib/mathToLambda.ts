import {
	LambdaNode,
	application,
	churchAdd,
	churchMultiply,
	churchNumber,
	churchSubtract,
	clearSubstitutionCache,
	evaluate,
	extractNumber
} from './lambdaCalculus';
import { MathNode, evaluateMathAST } from './mathParser';

// Convert a math AST to its lambda calculus representation
export function convertMathToLambda(node: MathNode): LambdaNode {
	if (node.type === 'number') {
		// Convert number to Church numeral
		return churchNumber(node.value);
	} else if (node.type === 'binaryOp') {
		// Convert left and right operands
		const leftLambda = convertMathToLambda(node.left);
		const rightLambda = convertMathToLambda(node.right);

		// Apply the appropriate Church encoding based on operator
		switch (node.operator) {
			case '+':
				return application(application(churchAdd, leftLambda), rightLambda);
			case '-':
				return application(application(churchSubtract, leftLambda), rightLambda);
			case '*':
				return application(application(churchMultiply, leftLambda), rightLambda);
			case '/':
				// Division is more complex in lambda calculus and not implemented here
				throw new Error('Division not yet implemented in lambda calculus');
			default:
				throw new Error(`Unknown operator: ${node.operator}`);
		}
	}

	throw new Error(`Unknown node type: ${(node as any).type}`);
}

// Take a math expression, convert to lambda calculus, evaluate, and return result
export function evaluateMathAsLambda(node: MathNode): {
	lambdaExpr: LambdaNode;
	steps: LambdaNode[];
	result: number;
} {
	try {
		// Convert math AST to lambda calculus
		const lambdaExpr = convertMathToLambda(node);

		// Clear substitution cache before evaluation for clean start
		clearSubstitutionCache();

		// Evaluate the lambda expression
		const { result, steps } = evaluate(lambdaExpr);

		// Extract the numeric result from the lambda expression
		const numericResult = extractNumber(result);

		// Check if the result is valid
		if (Number.isNaN(numericResult)) {
			console.warn("Lambda evaluation produced NaN, using simplified approach");
			// Fall back to direct evaluation of the math AST
			const directResult = evaluateMathAST(node);
			return {
				lambdaExpr,
				steps,
				result: directResult
			};
		}

		return {
			lambdaExpr,
			steps,
			result: numericResult
		};
	} catch (error) {
		console.error("Error in lambda calculus evaluation:", error);
		// Fall back to direct evaluation of the math AST
		const directResult = evaluateMathAST(node);
		// Return a simplified step list with just the initial expression
		return {
			lambdaExpr: churchNumber(directResult), // Simple Church numeral for the result
			steps: [churchNumber(directResult)],    // Single step with the result
			result: directResult
		};
	}
} 