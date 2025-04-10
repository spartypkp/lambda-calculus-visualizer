"use client";

import { useState, useCallback } from 'react';

interface ExpressionInputProps {
  initialValue?: string;
  onExpressionChange: (expression: string) => void;
}

export function ExpressionInput({ initialValue = '', onExpressionChange }: ExpressionInputProps) {
  const [expression, setExpression] = useState(initialValue);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setExpression(newValue);
    onExpressionChange(newValue);
  }, [onExpressionChange]);

  return (
    <div className="w-full">
      <label htmlFor="expression-input" className="block text-sm font-medium mb-2">
        Math Expression
      </label>
      <div className="relative">
        <textarea
          id="expression-input"
          value={expression}
          onChange={handleChange}
          placeholder="Enter a math expression (e.g., 3+5 or (2*4)/2)"
          className="w-full h-24 p-3 border border-gray-300 rounded-md font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Use standard math notation: +, -, *, / and parentheses. Example: (3+5)*2
      </p>
    </div>
  );
}