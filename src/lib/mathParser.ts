export type MathNode =
	| NumberNode
	| BinaryOpNode;

export interface NumberNode {
	type: 'number';
	value: number;
}

export interface BinaryOpNode {
	type: 'binaryOp';
	operator: '+' | '-' | '*' | '/';
	left: MathNode;
	right: MathNode;
}

// Simple recursive descent parser for mathematical expressions
export function parseMathExpression(expression: string): MathNode {
	let pos = 0;
	const tokens = tokenize(expression);

	function parseExpression(): MathNode {
		let left = parseTerm();

		while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
			const operator = tokens[pos] as '+' | '-';
			pos++;
			const right = parseTerm();
			left = {
				type: 'binaryOp',
				operator,
				left,
				right
			};
		}

		return left;
	}

	function parseTerm(): MathNode {
		let left = parseFactor();

		while (pos < tokens.length && (tokens[pos] === '*' || tokens[pos] === '/')) {
			const operator = tokens[pos] as '*' | '/';
			pos++;
			const right = parseFactor();
			left = {
				type: 'binaryOp',
				operator,
				left,
				right
			};
		}

		return left;
	}

	function parseFactor(): MathNode {
		if (tokens[pos] === '(') {
			pos++; // Skip '('
			const expr = parseExpression();
			pos++; // Skip ')'
			return expr;
		} else {
			// Must be a number
			const value = parseFloat(tokens[pos]);
			pos++;
			return { type: 'number', value };
		}
	}

	return parseExpression();
}

// Simple tokenizer for mathematical expressions
function tokenize(expression: string): string[] {
	const tokens: string[] = [];
	let i = 0;

	while (i < expression.length) {
		const char = expression[i];

		if (/\s/.test(char)) {
			// Skip whitespace
			i++;
		} else if (/\d/.test(char)) {
			// Parse number (integer or decimal)
			let number = '';
			while (i < expression.length && (/\d/.test(expression[i]) || expression[i] === '.')) {
				number += expression[i];
				i++;
			}
			tokens.push(number);
		} else if (['+', '-', '*', '/', '(', ')'].includes(char)) {
			// Operators and parentheses
			tokens.push(char);
			i++;
		} else {
			// Skip invalid characters
			i++;
		}
	}

	return tokens;
}

// For testing - evaluate the AST to get a result
export function evaluateMathAST(node: MathNode): number {
	if (node.type === 'number') {
		return node.value;
	} else if (node.type === 'binaryOp') {
		const left = evaluateMathAST(node.left);
		const right = evaluateMathAST(node.right);

		switch (node.operator) {
			case '+': return left + right;
			case '-': return left - right;
			case '*': return left * right;
			case '/': return left / right;
			default: throw new Error(`Unknown operator: ${node.operator}`);
		}
	}

	throw new Error(`Unknown node type: ${(node as any).type}`);
} 