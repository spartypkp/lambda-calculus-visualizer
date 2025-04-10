import { LambdaExpr, Variable, Abstraction, Application, createVariable, createAbstraction, createApplication } from '@/types/lambda';

/**
 * Evaluator for lambda calculus expressions
 */
export class LambdaEvaluator {
  /**
   * Perform a single beta reduction step on the expression
   * Returns null if no reduction is possible
   */
  betaReduce(expr: LambdaExpr): LambdaExpr | null {
    if (expr.type === 'application') {
      // Case 1: The left side is an abstraction (this is a redex)
      if (expr.left.type === 'abstraction') {
        // Perform the substitution
        return this.substitute(expr.left.body, expr.left.param, expr.right);
      }
      
      // Case 2: Try to reduce the left side
      const reducedLeft = this.betaReduce(expr.left);
      if (reducedLeft) {
        return createApplication(reducedLeft, expr.right);
      }
      
      // Case 3: Try to reduce the right side
      const reducedRight = this.betaReduce(expr.right);
      if (reducedRight) {
        return createApplication(expr.left, reducedRight);
      }
    } else if (expr.type === 'abstraction') {
      // Try to reduce the body of the abstraction
      const reducedBody = this.betaReduce(expr.body);
      if (reducedBody) {
        return createAbstraction(expr.param, reducedBody);
      }
    }
    
    // No reduction possible
    return null;
  }

  /**
   * Substitute all free occurrences of variable with name 'param' in 'expr' with 'replacement'
   */
  substitute(expr: LambdaExpr, param: string, replacement: LambdaExpr): LambdaExpr {
    switch (expr.type) {
      case 'variable':
        // If this is the variable we're replacing, return the replacement
        if (expr.name === param) {
          return replacement;
        }
        // Otherwise, keep the variable as is
        return expr;
        
      case 'application':
        // Substitute in both parts of the application
        return createApplication(
          this.substitute(expr.left, param, replacement),
          this.substitute(expr.right, param, replacement)
        );
        
      case 'abstraction':
        // If the abstraction binds the same variable, don't substitute in its body
        if (expr.param === param) {
          return expr;
        }
        
        // If the parameter of this abstraction appears free in the replacement,
        // we need to perform alpha conversion to avoid variable capture
        if (this.containsFreeVariable(replacement, expr.param)) {
          const newParam = this.generateFreshVariable(expr.param, [expr, replacement]);
          const newBody = this.substitute(expr.body, expr.param, createVariable(newParam));
          return createAbstraction(
            newParam,
            this.substitute(newBody, param, replacement)
          );
        }
        
        // Otherwise, substitute in the body
        return createAbstraction(
          expr.param,
          this.substitute(expr.body, param, replacement)
        );
    }
  }

  /**
   * Check if an expression contains a free variable with the given name
   */
  containsFreeVariable(expr: LambdaExpr, name: string): boolean {
    switch (expr.type) {
      case 'variable':
        return expr.name === name;
        
      case 'application':
        return this.containsFreeVariable(expr.left, name) || 
               this.containsFreeVariable(expr.right, name);
        
      case 'abstraction':
        // If the abstraction binds this variable, it's not free in the body
        if (expr.param === name) {
          return false;
        }
        return this.containsFreeVariable(expr.body, name);
    }
  }

  /**
   * Generate a fresh variable name that doesn't conflict with existing ones
   */
  generateFreshVariable(base: string, exprs: LambdaExpr[]): string {
    let counter = 1;
    let newName = `${base}${counter}`;
    
    while (exprs.some(expr => this.containsFreeVariable(expr, newName))) {
      counter++;
      newName = `${base}${counter}`;
    }
    
    return newName;
  }

  /**
   * Reduce an expression to normal form (if possible)
   * Returns the original expression if it's already in normal form
   */
  reduceToNormalForm(expr: LambdaExpr, maxSteps = 1000): LambdaExpr {
    let current = expr;
    let steps = 0;
    
    while (steps < maxSteps) {
      const reduced = this.betaReduce(current);
      if (!reduced) {
        // No more reductions possible
        break;
      }
      current = reduced;
      steps++;
    }
    
    return current;
  }

  /**
   * Convert a lambda expression to a string representation
   */
  toString(expr: LambdaExpr): string {
    switch (expr.type) {
      case 'variable':
        return expr.name;
        
      case 'abstraction':
        return `λ${expr.param}.${this.toString(expr.body)}`;
        
      case 'application':
        const left = expr.left.type === 'abstraction' ? 
          `(${this.toString(expr.left)})` : this.toString(expr.left);
        const right = expr.right.type === 'application' || expr.right.type === 'abstraction' ? 
          `(${this.toString(expr.right)})` : this.toString(expr.right);
        return `${left} ${right}`;
    }
  }
}

// Export a singleton instance for convenience
export const lambdaEvaluator = new LambdaEvaluator();
