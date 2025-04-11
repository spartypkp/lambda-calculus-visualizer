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
	// Handle empty expressions
	if (!expression.trim()) {
		throw new Error("Empty expression");
	}

	let pos = 0;
	const tokens = tokenize(expression);

	// If there are no tokens, throw an error
	if (tokens.length === 0) {
		throw new Error("No valid tokens found");
	}

	function parseExpression(): MathNode {
		let left = parseTerm();

		while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
			const operator = tokens[pos] as '+' | '-';
			pos++;

			// Handle partial expressions like "1+"
			if (pos >= tokens.length) {
				// For live visualization, treat missing right operand as 0
				return {
					type: 'binaryOp',
					operator,
					left,
					right: { type: 'number', value: 0 }
				};
			}

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

			// Handle partial expressions like "1*"
			if (pos >= tokens.length) {
				// For live visualization, treat missing right operand as 1
				// (this makes sense for * and /, since x*1=x and x/1=x)
				return {
					type: 'binaryOp',
					operator,
					left,
					right: { type: 'number', value: 1 }
				};
			}

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
		if (pos >= tokens.length) {
			throw new Error("Unexpected end of expression");
		}

		if (tokens[pos] === '(') {
			pos++; // Skip '('

			// Handle case where we have "(" but no closing ")"
			if (pos >= tokens.length) {
				return { type: 'number', value: 0 };
			}

			const expr = parseExpression();

			// Check if we have a closing parenthesis
			if (pos < tokens.length && tokens[pos] === ')') {
				pos++; // Skip ')'
			}

			return expr;
		} else {
			// Must be a number
			// Handle case where token isn't a valid number
			try {
				const value = parseFloat(tokens[pos]);
				if (isNaN(value)) {
					throw new Error(`Invalid number: ${tokens[pos]}`);
				}
				pos++;
				return { type: 'number', value };
			} catch (e) {
				// For live visualization, return 0 for invalid numbers
				pos++;
				return { type: 'number', value: 0 };
			}
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