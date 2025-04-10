import { LambdaExpr, createAbstraction, createApplication, createVariable } from '@/types/lambda';

/**
 * Parser for lambda calculus expressions
 */
export class LambdaParser {
	private pos = 0;
	private input = '';

	/**
	 * Parse a lambda calculus expression string into an abstract syntax tree
	 */
	parse(input: string): LambdaExpr {
		this.input = input.trim();
		this.pos = 0;

		try {
			const expr = this.parseExpr();
			this.skipWhitespace();

			if (this.pos < this.input.length) {
				throw new Error(`Unexpected character at position ${this.pos}: ${this.input[this.pos]}`);
			}

			return expr;
		} catch (err) {
			throw new Error(`Error parsing lambda expression: ${(err as Error).message}`);
		}
	}

	/**
	 * Parse a lambda expression
	 */
	private parseExpr(): LambdaExpr {
		this.skipWhitespace();

		// Case 1: Lambda abstraction
		if (this.currentChar() === '\\' || this.currentChar() === 'λ') {
			this.pos++; // Consume the lambda symbol
			return this.parseAbstraction();
		}

		// Otherwise, parse an application or atom
		return this.parseApplication();
	}

	/**
	 * Parse a lambda abstraction (e.g., λx.M or \x.M)
	 */
	private parseAbstraction(): LambdaExpr {
		this.skipWhitespace();

		// Parse the parameter
		if (!this.isValidVarChar(this.currentChar())) {
			throw new Error(`Expected variable name at position ${this.pos}, found '${this.currentChar()}'`);
		}

		const param = this.parseVariableName();
		this.skipWhitespace();

		// Check for the dot
		if (this.currentChar() !== '.') {
			throw new Error(`Expected '.' after parameter at position ${this.pos}`);
		}
		this.pos++; // Consume the dot

		// Parse the body
		const body = this.parseExpr();

		return createAbstraction(param, body);
	}

	/**
	 * Parse an application (e.g., M N)
	 */
	private parseApplication(): LambdaExpr {
		let left = this.parseAtom();

		this.skipWhitespace();
		while (this.pos < this.input.length &&
			this.currentChar() !== ')' &&
			this.currentChar() !== '.') {

			const right = this.parseAtom();
			left = createApplication(left, right);
			this.skipWhitespace();
		}

		return left;
	}

	/**
	 * Parse an atomic expression (variable or parenthesized expression)
	 */
	private parseAtom(): LambdaExpr {
		this.skipWhitespace();

		// Case 1: Parenthesized expression
		if (this.currentChar() === '(') {
			this.pos++; // Consume the opening parenthesis
			const expr = this.parseExpr();
			this.skipWhitespace();

			// Check for closing parenthesis
			if (this.currentChar() !== ')') {
				throw new Error(`Expected ')' at position ${this.pos}`);
			}
			this.pos++; // Consume the closing parenthesis

			return expr;
		}

		// Case 2: Variable
		if (this.isValidVarChar(this.currentChar())) {
			const name = this.parseVariableName();
			return createVariable(name);
		}

		throw new Error(`Unexpected character at position ${this.pos}: ${this.currentChar()}`);
	}

	/**
	 * Parse a variable name
	 */
	private parseVariableName(): string {
		const start = this.pos;
		while (this.pos < this.input.length && this.isValidVarChar(this.input[this.pos])) {
			this.pos++;
		}
		return this.input.substring(start, this.pos);
	}

	/**
	 * Check if a character is valid in a variable name
	 */
	private isValidVarChar(char: string): boolean {
		return /[a-zA-Z0-9_]/.test(char);
	}

	/**
	 * Get the current character
	 */
	private currentChar(): string {
		return this.input[this.pos] || '';
	}

	/**
	 * Skip whitespace characters
	 */
	private skipWhitespace(): void {
		while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
			this.pos++;
		}
	}
}

// Export a singleton instance
export const lambdaParser = new LambdaParser();
