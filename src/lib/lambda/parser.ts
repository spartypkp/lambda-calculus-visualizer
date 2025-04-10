import { LambdaExpr, createVariable, createAbstraction, createApplication } from '@/types/lambda';

/**
 * Parser for lambda calculus expressions
 * Supports both λ and \ notations for lambda
 */
export class LambdaParser {
  private pos = 0;
  private input = '';

  /**
   * Parse a lambda calculus expression string into an AST
   */
  parse(input: string): LambdaExpr {
    this.input = input.trim();
    this.pos = 0;
    return this.parseExpr();
  }

  private parseExpr(): LambdaExpr {
    this.skipWhitespace();
    
    // Check for abstraction (λx.M or \x.M)
    if (this.currentChar() === 'λ' || this.currentChar() === '\\') {
      return this.parseAbstraction();
    }
    
    // Parse application or variable
    return this.parseApplication();
  }

  private parseAbstraction(): LambdaExpr {
    // Skip the lambda symbol (λ or \)
    this.pos++;
    this.skipWhitespace();
    
    // Parse parameter name
    const param = this.parseIdentifier();
    this.skipWhitespace();
    
    // Expect a dot after parameter
    if (this.currentChar() !== '.') {
      throw new Error(`Expected '.' after parameter at position ${this.pos}`);
    }
    this.pos++;
    
    // Parse the body of the abstraction
    const body = this.parseExpr();
    
    return createAbstraction(param, body);
  }

  private parseApplication(): LambdaExpr {
    let left = this.parseAtom();
    
    this.skipWhitespace();
    
    // Keep applying as long as there are expressions to apply
    while (this.pos < this.input.length && 
           this.currentChar() !== ')' && 
           this.currentChar() !== '.') {
      
      const right = this.parseAtom();
      left = createApplication(left, right);
      
      this.skipWhitespace();
    }
    
    return left;
  }

  private parseAtom(): LambdaExpr {
    this.skipWhitespace();
    
    // Handle parenthesized expressions
    if (this.currentChar() === '(') {
      this.pos++;
      const expr = this.parseExpr();
      this.skipWhitespace();
      
      if (this.currentChar() !== ')') {
        throw new Error(`Expected ')' at position ${this.pos}`);
      }
      this.pos++;
      
      return expr;
    }
    
    // Handle abstractions
    if (this.currentChar() === 'λ' || this.currentChar() === '\\') {
      return this.parseAbstraction();
    }
    
    // Handle variables
    const name = this.parseIdentifier();
    return createVariable(name);
  }

  private parseIdentifier(): string {
    this.skipWhitespace();
    
    const start = this.pos;
    while (this.pos < this.input.length && this.isIdentifierChar(this.currentChar())) {
      this.pos++;
    }
    
    if (start === this.pos) {
      throw new Error(`Expected identifier at position ${this.pos}`);
    }
    
    return this.input.substring(start, this.pos);
  }

  private isIdentifierChar(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  private currentChar(): string {
    return this.input[this.pos] || '';
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }
}

// Export a singleton instance for convenience
export const lambdaParser = new LambdaParser();
