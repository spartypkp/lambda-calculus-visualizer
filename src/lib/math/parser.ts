import { lambdaParser } from '@/lib/lambda/parser';
import { LambdaExpr, createAbstraction, createApplication, createVariable } from '@/types/lambda';

/**
 * Create a Church numeral for a given number with the correct vertical line ordering
 * @param n The number to convert to a Church numeral
 * @returns Lambda expression representing the Church numeral
 */
function createChurchNumeral(n: number): LambdaExpr {
	// Church numeral n is λf.λx.f^n(x) where f^n means f applied n times
	// We need to build it so the leftmost application has the longest vertical line
	// and each subsequent application has a shorter line

	// The abstraction structure (λf.λx.body)
	const createBody = (times: number): LambdaExpr => {
		if (times === 0) {
			// Base case, just x
			return createVariable('x');
		} else {
			// For each application, apply f to the previous result
			const innerExpr = createBody(times - 1);
			// Each application puts a longer vertical line to the left
			return createApplication(createVariable('f'), innerExpr);
		}
	};

	// Create the body with n applications
	const body = createBody(n);

	// Wrap with the abstractions - λx comes first in binding but is written second
	const withX = createAbstraction('x', body);
	const withF = createAbstraction('f', withX);

	return withF;
}

/**
 * Parser for mathematical expressions
 * Converts math expressions to lambda calculus using Church encodings
 */
export class MathParser {
	private pos = 0;
	private input = '';

	/**
	 * Parse a mathematical expression and convert it to lambda calculus
	 */
	parse(input: string): LambdaExpr {
		this.input = input.trim();
		this.pos = 0;

		try {
			// Try to parse as a simple number first (direct Church numeral)
			if (/^\d+$/.test(this.input)) {
				const num = parseInt(this.input, 10);
				return createChurchNumeral(num);
			}

			// Otherwise parse as a more complex expression
			const expr = this.parseExpression();
			return expr;
		} catch (err) {
			throw new Error(`Error parsing math expression: ${(err as Error).message}`);
		}
	}

	private parseExpression(): LambdaExpr {
		return this.parseAddSubtract();
	}

	private parseAddSubtract(): LambdaExpr {
		let left = this.parseMultiplyDivide();

		while (this.pos < this.input.length) {
			this.skipWhitespace();

			if (this.currentChar() === '+') {
				this.pos++;
				const right = this.parseMultiplyDivide();
				left = this.createAddition(left, right);
			} else if (this.currentChar() === '-') {
				this.pos++;
				const right = this.parseMultiplyDivide();
				left = this.createSubtraction(left, right);
			} else {
				break;
			}
		}

		return left;
	}

	private parseMultiplyDivide(): LambdaExpr {
		let left = this.parsePrimary();

		while (this.pos < this.input.length) {
			this.skipWhitespace();

			if (this.currentChar() === '*') {
				this.pos++;
				const right = this.parsePrimary();
				left = this.createMultiplication(left, right);
			} else if (this.currentChar() === '/') {
				this.pos++;
				const right = this.parsePrimary();
				left = this.createDivision(left, right);
			} else {
				break;
			}
		}

		return left;
	}

	private parsePrimary(): LambdaExpr {
		this.skipWhitespace();

		// Handle parenthesized expressions
		if (this.currentChar() === '(') {
			this.pos++;
			const expr = this.parseExpression();
			this.skipWhitespace();

			if (this.currentChar() !== ')') {
				throw new Error(`Expected ')' at position ${this.pos}`);
			}
			this.pos++;

			return expr;
		}

		// Handle numbers
		if (this.isDigit(this.currentChar())) {
			return this.parseNumber();
		}

		throw new Error(`Unexpected character at position ${this.pos}: ${this.currentChar()}`);
	}

	private parseNumber(): LambdaExpr {
		this.skipWhitespace();

		const start = this.pos;
		while (this.pos < this.input.length && this.isDigit(this.currentChar())) {
			this.pos++;
		}

		// Check for decimal point
		if (this.currentChar() === '.') {
			this.pos++;
			while (this.pos < this.input.length && this.isDigit(this.currentChar())) {
				this.pos++;
			}
		}

		const numStr = this.input.substring(start, this.pos);
		const num = parseFloat(numStr);

		if (isNaN(num)) {
			throw new Error(`Invalid number at position ${start}`);
		}

		return createChurchNumeral(Math.floor(num));
	}

	private isDigit(char: string): boolean {
		return /[0-9]/.test(char);
	}

	private currentChar(): string {
		return this.input[this.pos] || '';
	}

	private skipWhitespace(): void {
		while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
			this.pos++;
		}
	}

	/**
	 * Create a lambda expression for addition
	 */
	private createAddition(left: LambdaExpr, right: LambdaExpr): LambdaExpr {
		// Addition: λm.λn.λf.λx.m f (n f x)
		// We'll use the Church encoding directly
		const additionStr = "\\m.\\n.\\f.\\x.m f (n f x)";
		const addition = lambdaParser.parse(additionStr);

		// Apply to the left and right operands
		return createApplication(createApplication(addition, left), right);
	}

	/**
	 * Create a lambda expression for subtraction
	 */
	private createSubtraction(left: LambdaExpr, right: LambdaExpr): LambdaExpr {
		// Subtraction: λm.λn.n (λn.λf.λx.n (λg.λh.h (g f)) (λu.x) (λu.u)) m
		// We'll use the Church encoding directly
		const subtractionStr = "\\m.\\n.n (\\n.\\f.\\x.n (\\g.\\h.h (g f)) (\\u.x) (\\u.u)) m";
		const subtraction = lambdaParser.parse(subtractionStr);

		// Apply to the left and right operands
		return createApplication(createApplication(subtraction, left), right);
	}

	/**
	 * Create a lambda expression for multiplication
	 */
	private createMultiplication(left: LambdaExpr, right: LambdaExpr): LambdaExpr {
		// Multiplication: λm.λn.λf.m (n f)
		// We'll use the Church encoding directly
		const multiplicationStr = "\\m.\\n.\\f.m (n f)";
		const multiplication = lambdaParser.parse(multiplicationStr);

		// Apply to the left and right operands
		return createApplication(createApplication(multiplication, left), right);
	}

	/**
	 * Create a lambda expression for division
	 * Note: This is integer division and is more complex
	 */
	private createDivision(left: LambdaExpr, right: LambdaExpr): LambdaExpr {
		// Division is complex in lambda calculus
		// For simplicity, we'll use a predefined Church encoding
		// This is a simplified version that works for small integers
		const divisionStr = "\\m.\\n.\\f.\\x.(\\r.(\\rx.r (\\n.\\th.\\el.th) (\\n.\\th.\\el.el)) (\\c.\\n.n (\\x.\\a.\\b.b) (\\a.\\b.a) (\\n.c (r n)) (\\x.x)) (\\n.\\s.\\z.n (\\p.\\z.z (s (p z)) (\\z.z z z)) (\\z.z z) (\\z.z))) m n f x";
		const division = lambdaParser.parse(divisionStr);

		// Apply to the left and right operands
		return createApplication(createApplication(division, left), right);
	}
}

// Export a singleton instance for convenience
export const mathParser = new MathParser();

/**
 * Convenience function to parse math expressions to lambda calculus
 * @param expression The mathematical expression as a string
 * @returns Lambda calculus representation or null if parsing failed
 */
export function parseMathToLambda(expression: string): LambdaExpr | null {
	try {
		return mathParser.parse(expression);
	} catch (error) {
		console.error('Error parsing math expression:', error);
		return null;
	}
}
