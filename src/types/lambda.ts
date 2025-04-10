/**
 * Types for lambda calculus expressions
 */

// Base type for all lambda expressions
export type LambdaExpr = Variable | Abstraction | Application;

// Variable expression (e.g., x, y)
export interface Variable {
  type: 'variable';
  name: string;
}

// Abstraction expression (e.g., λx.M)
export interface Abstraction {
  type: 'abstraction';
  param: string;
  body: LambdaExpr;
}

// Application expression (e.g., M N)
export interface Application {
  type: 'application';
  left: LambdaExpr;
  right: LambdaExpr;
}

// Helper functions to create lambda expressions
export const createVariable = (name: string): Variable => ({
  type: 'variable',
  name,
});

export const createAbstraction = (param: string, body: LambdaExpr): Abstraction => ({
  type: 'abstraction',
  param,
  body,
});

export const createApplication = (left: LambdaExpr, right: LambdaExpr): Application => ({
  type: 'application',
  left,
  right,
});
