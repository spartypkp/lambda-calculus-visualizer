"use client";

import { useState } from 'react';

export function TrompDiagramInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center"
      >
        {isOpen ? "Hide Diagram Information" : "What are Lambda Diagrams?"}
      </button>
      
      {isOpen && (
        <div className="mt-2 p-4 bg-gray-50 rounded-md text-sm">
          <h3 className="font-bold text-base mb-2">Lambda Diagrams (Tromp Diagrams)</h3>
          
          <p className="mb-2">
            Lambda Diagrams are a graphical notation for closed lambda terms, where:
          </p>
          
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>
              <span className="font-medium text-[#e07a5f]">Abstractions (lambdas)</span> are represented by horizontal lines
            </li>
            <li>
              <span className="font-medium text-[#4ecdc4]">Variables</span> are shown as vertical lines emanating down from their binding lambda
            </li>
            <li>
              <span className="font-medium text-[#ff9f1c]">Applications</span> are horizontal links connecting variables
            </li>
          </ul>
          
          <p className="mb-3">
            In the standard style, applications link the leftmost variables. In the alternative style, 
            applications link the nearest deepest variables, creating a more stylistic look.
          </p>
          
          <h4 className="font-semibold mt-3 mb-2">Examples:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Identity function (λx.x): A horizontal line with a single vertical line</li>
            <li>Church numerals (e.g., λf.λx.f(f x)): Nested horizontal lines with vertical connections</li>
            <li>Y combinator: A complex structure with multiple connections</li>
          </ul>
          
          <h4 className="font-semibold mt-3 mb-2">Beta Reduction:</h4>
          <p>
            When you click "Step (β-reduce)", the diagram transforms to show the substitution process.
            This helps visualize how variables are replaced during evaluation.
          </p>
          
          <div className="mt-3 text-xs text-gray-500">
            Based on John Tromp's lambda diagrams notation.
          </div>
        </div>
      )}
    </div>
  );
}
