"use client";

import { useState, useCallback } from 'react';
import { LambdaExpr } from '@/types/lambda';
import { lambdaParser } from '@/lib/lambda/parser';
import { lambdaEvaluator } from '@/lib/lambda/evaluator';
import { mathParser } from '@/lib/math/parser';
import { ExpressionInput } from './ExpressionInput';
import { ControlPanel } from './ControlPanel';
import { InfoPanel } from './InfoPanel';
import { ExamplesList } from './ExamplesList';
import { TrompDiagramInfo } from './TrompDiagramInfo';
import ReductionSequence from './ReductionSequence';
import TrompDiagram from './TrompDiagram';

export function Visualizer() {
  const [inputExpression, setInputExpression] = useState('');
  const [parsedExpression, setParsedExpression] = useState<LambdaExpr | null>(null);
  const [currentExpression, setCurrentExpression] = useState<LambdaExpr | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState(0);
  const [canReduce, setCanReduce] = useState(false);
  const [showReductionSequence, setShowReductionSequence] = useState(false);

  // Parse the input expression
  const parseExpression = useCallback((input: string) => {
    if (!input.trim()) {
      setParsedExpression(null);
      setCurrentExpression(null);
      setError(null);
      setSteps(0);
      setCanReduce(false);
      return;
    }

    try {
      // First parse the math expression to lambda calculus
      const parsed = mathParser.parse(input);
      setParsedExpression(parsed);
      setCurrentExpression(parsed);
      setError(null);
      setSteps(0);
      setCanReduce(lambdaEvaluator.betaReduce(parsed) !== null);
    } catch (err) {
      // If math parsing fails, try direct lambda parsing as fallback
      try {
        const parsed = lambdaParser.parse(input);
        setParsedExpression(parsed);
        setCurrentExpression(parsed);
        setError(null);
        setSteps(0);
        setCanReduce(lambdaEvaluator.betaReduce(parsed) !== null);
      } catch (lambdaErr) {
        // Both parsers failed
        setError((err as Error).message);
        setParsedExpression(null);
        setCurrentExpression(null);
        setCanReduce(false);
      }
    }
  }, []);

  // Handle expression input changes
  const handleExpressionChange = useCallback((expression: string) => {
    setInputExpression(expression);
    parseExpression(expression);
  }, [parseExpression]);

  // Handle example selection
  const handleSelectExample = useCallback((expression: string) => {
    setInputExpression(expression);
    parseExpression(expression);
  }, [parseExpression]);

  // Perform a single beta reduction step
  const handleReduce = useCallback(() => {
    if (!currentExpression) return;

    const reduced = lambdaEvaluator.betaReduce(currentExpression);
    if (reduced) {
      setCurrentExpression(reduced);
      setSteps(steps + 1);
      setCanReduce(lambdaEvaluator.betaReduce(reduced) !== null);
    }
  }, [currentExpression, steps]);

  // Reset to the original expression
  const handleReset = useCallback(() => {
    if (parsedExpression) {
      setCurrentExpression(parsedExpression);
      setSteps(0);
      setCanReduce(lambdaEvaluator.betaReduce(parsedExpression) !== null);
    }
  }, [parsedExpression]);

  // Reduce to normal form
  const handleNormalForm = useCallback(() => {
    if (!currentExpression) return;

    const normalForm = lambdaEvaluator.reduceToNormalForm(currentExpression);
    setCurrentExpression(normalForm);
    
    // Count the steps
    let count = 0;
    let expr = currentExpression;
    while (true) {
      const reduced = lambdaEvaluator.betaReduce(expr);
      if (!reduced) break;
      expr = reduced;
      count++;
    }
    
    setSteps(steps + count);
    setCanReduce(false);
  }, [currentExpression, steps]);

  // Toggle between single diagram and reduction sequence
  const toggleReductionSequence = useCallback(() => {
    setShowReductionSequence(!showReductionSequence);
  }, [showReductionSequence]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Lambda Calculus Visualizer</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ExpressionInput 
            initialValue={inputExpression} 
            onExpressionChange={handleExpressionChange} 
          />
          
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <TrompDiagramInfo />
              <button
                onClick={toggleReductionSequence}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                {showReductionSequence ? "Show Single Diagram" : "Show Reduction Sequence"}
              </button>
            </div>
            
            {currentExpression && (
              showReductionSequence ? (
                <ReductionSequence 
                  initialExpr={parsedExpression || currentExpression} 
                  width={800} 
                  height={400} 
                />
              ) : (
                <TrompDiagram 
                  expr={currentExpression} 
                  width={800} 
                  height={400} 
                />
              )
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <ControlPanel 
            onReduce={handleReduce}
            onReset={handleReset}
            onNormalForm={handleNormalForm}
            canReduce={canReduce}
          />
          
          <InfoPanel 
            expression={currentExpression}
            originalExpression={inputExpression}
            steps={steps}
          />
          
          <ExamplesList onSelectExample={handleSelectExample} />
        </div>
      </div>
    </div>
  );
}