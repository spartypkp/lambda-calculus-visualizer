"use client";

import { LambdaExpr } from '@/types/lambda';
import { lambdaEvaluator } from '@/lib/lambda/evaluator';

interface InfoPanelProps {
  expression: LambdaExpr | null;
  originalExpression: string;
  steps: number;
}

export function InfoPanel({ expression, originalExpression, steps }: InfoPanelProps) {
  return (
    <div className="p-4 border border-gray-300 rounded-md">
      <h3 className="text-lg font-semibold mb-2">Expression Information</h3>
      
      <div className="space-y-2">
        <div>
          <span className="font-medium">Original:</span>
          <code className="ml-2 p-1 bg-gray-100 rounded font-mono">
            {originalExpression || 'None'}
          </code>
        </div>
        
        <div>
          <span className="font-medium">Current:</span>
          <code className="ml-2 p-1 bg-gray-100 rounded font-mono">
            {expression ? lambdaEvaluator.toString(expression) : 'None'}
          </code>
        </div>
        
        <div>
          <span className="font-medium">Reduction Steps:</span>
          <span className="ml-2">{steps}</span>
        </div>
        
        {expression && (
          <div>
            <span className="font-medium">In Normal Form:</span>
            <span className="ml-2">
              {lambdaEvaluator.betaReduce(expression) === null ? 'Yes' : 'No'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
