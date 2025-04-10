import { LambdaExpr, createVariable, createAbstraction, createApplication } from '@/types/lambda';
import { lambdaParser } from '@/lib/lambda/parser';

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
    
    return this.createChurchNumeral(Math.floor(num));
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
   * Create a Church numeral for a given number
   */
  private createChurchNumeral(n: number): LambdaExpr {
    // Church numeral: λf.λx.f^n(x)
    // For example, 3 = λf.λx.f(f(f(x)))
    
    // Create the innermost application (x)
    let expr: LambdaExpr = createVariable('x');
    
    // Apply f n times
    for (let i = 0; i < n; i++) {
      expr = createApplication(createVariable('f'), expr);
    }
    
    // Wrap with the abstractions
    expr = createAbstraction('x', expr);
    expr = createAbstraction('f', expr);
    
    return expr;
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
