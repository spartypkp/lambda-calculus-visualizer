import {
	LambdaNode,
	application,
	churchAdd,
	churchMultiply,
	churchNumber,
	churchSubtract,
	evaluate,
	extractNumber
} from './lambdaCalculus';
import { MathNode } from './mathParser';

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
	// Convert math AST to lambda calculus
	const lambdaExpr = convertMathToLambda(node);

	// Evaluate the lambda expression
	const { result, steps } = evaluate(lambdaExpr);

	// Extract the numeric result from the lambda expression
	const numericResult = extractNumber(result);

	return {
		lambdaExpr,
		steps,
		result: numericResult
	};
} 