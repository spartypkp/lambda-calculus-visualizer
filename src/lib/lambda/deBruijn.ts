import { LambdaExpr, createVariable, createAbstraction, createApplication } from '@/types/lambda';

/**
 * De Bruijn term representation for lambda calculus
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

function toDeBruijnWithContext(expr: LambdaExpr, context: string[]): DeBruijnTerm {
  switch (expr.type) {
    case 'variable': {
      const index = context.indexOf(expr.name);
      if (index === -1) {
        throw new Error(`Free variable: ${expr.name}`);
      }
      return { type: 'var', index };
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

function fromDeBruijnWithContext(term: DeBruijnTerm, context: string[]): LambdaExpr {
  switch (term.type) {
    case 'var': {
      if (term.index === undefined || term.index >= context.length) {
        throw new Error(`Invalid de Bruijn index: ${term.index}`);
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
 * Convert a lambda expression to de Bruijn representation, handling free variables
 * by adding them to the context
 */
export function toDeBruijnWithFreeVars(expr: LambdaExpr): { term: DeBruijnTerm, freeVars: string[] } {
  const freeVars = collectFreeVariables(expr);
  return {
    term: toDeBruijnWithContext(expr, freeVars),
    freeVars
  };
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
