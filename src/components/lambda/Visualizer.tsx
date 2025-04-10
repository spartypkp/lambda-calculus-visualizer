"use client";

import { useState, useCallback, useEffect } from 'react';
import { LambdaExpr } from '@/types/lambda';
import { lambdaParser } from '@/lib/lambda/parser';
import { lambdaEvaluator } from '@/lib/lambda/evaluator';
import { trompDiagramGenerator, TrompDiagram } from '@/lib/lambda/trompDiagram';
import { mathParser } from '@/lib/math/parser';
import { ExpressionInput } from './ExpressionInput';
import { DiagramViewer } from './DiagramViewer';
import { ControlPanel } from './ControlPanel';
import { InfoPanel } from './InfoPanel';
import { ExamplesList } from './ExamplesList';
import { TrompDiagramInfo } from './TrompDiagramInfo';

export function Visualizer() {
  const [inputExpression, setInputExpression] = useState('');
  const [parsedExpression, setParsedExpression] = useState<LambdaExpr | null>(null);
  const [currentExpression, setCurrentExpression] = useState<LambdaExpr | null>(null);
  const [diagram, setDiagram] = useState<TrompDiagram | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState(0);
  const [canReduce, setCanReduce] = useState(false);
  const [alternativeStyle, setAlternativeStyle] = useState(false);

  // Parse the input expression
  const parseExpression = useCallback((input: string) => {
    if (!input.trim()) {
      setParsedExpression(null);
      setCurrentExpression(null);
      setDiagram(null);
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
      setDiagram(trompDiagramGenerator.generateDiagram(parsed, alternativeStyle));
      setError(null);
      setSteps(0);
      setCanReduce(lambdaEvaluator.betaReduce(parsed) !== null);
    } catch (err) {
      // If math parsing fails, try direct lambda parsing as fallback
      try {
        const parsed = lambdaParser.parse(input);
        setParsedExpression(parsed);
        setCurrentExpression(parsed);
        setDiagram(trompDiagramGenerator.generateDiagram(parsed, alternativeStyle));
        setError(null);
        setSteps(0);
        setCanReduce(lambdaEvaluator.betaReduce(parsed) !== null);
      } catch (lambdaErr) {
        // Both parsers failed
        setError((err as Error).message);
        setParsedExpression(null);
        setCurrentExpression(null);
        setDiagram(null);
        setCanReduce(false);
      }
    }
  }, [alternativeStyle]);

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
      setDiagram(trompDiagramGenerator.generateDiagram(reduced, alternativeStyle));
      setSteps(steps + 1);
      setCanReduce(lambdaEvaluator.betaReduce(reduced) !== null);
    }
  }, [currentExpression, steps, alternativeStyle]);

  // Reset to the original expression
  const handleReset = useCallback(() => {
    if (parsedExpression) {
      setCurrentExpression(parsedExpression);
      setDiagram(trompDiagramGenerator.generateDiagram(parsedExpression, alternativeStyle));
      setSteps(0);
      setCanReduce(lambdaEvaluator.betaReduce(parsedExpression) !== null);
    }
  }, [parsedExpression, alternativeStyle]);

  // Reduce to normal form
  const handleNormalForm = useCallback(() => {
    if (!currentExpression) return;

    const normalForm = lambdaEvaluator.reduceToNormalForm(currentExpression);
    setCurrentExpression(normalForm);
    setDiagram(trompDiagramGenerator.generateDiagram(normalForm, alternativeStyle));
    
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
  }, [currentExpression, steps, alternativeStyle]);

  // Toggle alternative style
  const toggleStyle = useCallback(() => {
    setAlternativeStyle(!alternativeStyle);
    if (currentExpression) {
      setDiagram(trompDiagramGenerator.generateDiagram(currentExpression, !alternativeStyle));
    }
  }, [alternativeStyle, currentExpression]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Math to Lambda Calculus Visualizer</h1>
      
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
          
          <div className="mt-6 h-[400px]">
            <div className="flex justify-between mb-2">
              <TrompDiagramInfo />
              <button
                onClick={toggleStyle}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                {alternativeStyle ? "Standard Style" : "Alternative Style"}
              </button>
            </div>
            <DiagramViewer 
              diagram={diagram} 
              height={400} 
              alternativeStyle={alternativeStyle} 
            />
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