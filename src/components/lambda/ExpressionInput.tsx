"use client";

import { useCallback, useState } from 'react';

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
			<div className="flex justify-between items-center mb-2">
				<label htmlFor="expression-input" className="text-sm font-medium text-gray-700">
					Enter Expression
				</label>
				<div className="flex space-x-1 text-xs">
					<span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">λ</span>
					<span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">+</span>
					<span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">*</span>
				</div>
			</div>
			<div className="relative">
				<textarea
					id="expression-input"
					value={expression}
					onChange={handleChange}
					placeholder="Enter a lambda calculus expression (λx.x) or math expression (3+5)"
					className="w-full h-20 p-3 border border-gray-200 bg-gray-50 rounded-md font-mono text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
					spellCheck="false"
				/>
			</div>
			<div className="mt-1.5 flex justify-between items-center text-xs text-gray-500">
				<span>Examples: <code className="bg-gray-100 px-1 rounded">λx.λy.x y</code> or <code className="bg-gray-100 px-1 rounded">2*3+1</code></span>
				<span className="text-gray-400">{expression.length} chars</span>
			</div>
		</div>
	);
}