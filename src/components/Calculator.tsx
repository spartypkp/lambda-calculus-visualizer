"use client";

import { useEffect, useState } from "react";

interface CalculatorProps {
	onEvaluate: (expression: string) => void;
	onExpressionChange?: (expression: string) => void;
}

export default function Calculator({ onEvaluate, onExpressionChange }: CalculatorProps) {
	const [display, setDisplay] = useState<string>("");
	const [history, setHistory] = useState<string[]>([]);

	// Send updates to parent component whenever display changes
	useEffect(() => {
		if (onExpressionChange) {
			onExpressionChange(display);
		}
	}, [display, onExpressionChange]);

	const handleNumberClick = (num: number) => {
		setDisplay((prev) => prev + num);
	};

	const handleOperatorClick = (operator: string) => {
		setDisplay((prev) => prev + operator);
	};

	const handleClear = () => {
		setDisplay("");
	};

	const handleDelete = () => {
		setDisplay((prev) => prev.slice(0, -1));
	};

	const handleEvaluate = () => {
		if (display.trim() === "") return;

		onEvaluate(display);
		setHistory((prev) => [...prev, display]);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDisplay(e.target.value);
	};

	return (
		<div className="w-full max-w-sm">
			<div className="mb-2">
				<input
					type="text"
					value={display}
					onChange={handleInputChange}
					className="w-full p-2 text-right text-lg bg-gray-100 border border-gray-200 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
					placeholder="Enter expression..."
				/>
			</div>

			<div className="grid grid-cols-4 gap-1.5">
				<button
					className="p-2 bg-red-100 text-red-700 font-medium rounded-md hover:bg-red-200 active:bg-red-300 transition-colors text-sm shadow-sm"
					onClick={() => handleClear()}
				>
					C
				</button>
				<button
					className="p-2 bg-amber-100 text-amber-700 font-medium rounded-md hover:bg-amber-200 active:bg-amber-300 transition-colors text-sm shadow-sm"
					onClick={() => handleDelete()}
				>
					←
				</button>
				<button
					className="p-2 bg-indigo-100 text-indigo-700 font-medium rounded-md hover:bg-indigo-200 active:bg-indigo-300 transition-colors text-sm shadow-sm"
					onClick={() => handleOperatorClick("(")}
				>
					(
				</button>
				<button
					className="p-2 bg-indigo-100 text-indigo-700 font-medium rounded-md hover:bg-indigo-200 active:bg-indigo-300 transition-colors text-sm shadow-sm"
					onClick={() => handleOperatorClick(")")}
				>
					)
				</button>

				{[7, 8, 9].map((num) => (
					<button
						key={num}
						className="p-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm shadow-sm"
						onClick={() => handleNumberClick(num)}
					>
						{num}
					</button>
				))}
				<button
					className="p-2 bg-blue-100 text-blue-700 font-medium rounded-md hover:bg-blue-200 active:bg-blue-300 transition-colors text-sm shadow-sm"
					onClick={() => handleOperatorClick("/")}
				>
					÷
				</button>

				{[4, 5, 6].map((num) => (
					<button
						key={num}
						className="p-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm shadow-sm"
						onClick={() => handleNumberClick(num)}
					>
						{num}
					</button>
				))}
				<button
					className="p-2 bg-blue-100 text-blue-700 font-medium rounded-md hover:bg-blue-200 active:bg-blue-300 transition-colors text-sm shadow-sm"
					onClick={() => handleOperatorClick("*")}
				>
					×
				</button>

				{[1, 2, 3].map((num) => (
					<button
						key={num}
						className="p-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm shadow-sm"
						onClick={() => handleNumberClick(num)}
					>
						{num}
					</button>
				))}
				<button
					className="p-2 bg-blue-100 text-blue-700 font-medium rounded-md hover:bg-blue-200 active:bg-blue-300 transition-colors text-sm shadow-sm"
					onClick={() => handleOperatorClick("-")}
				>
					−
				</button>

				<button
					className="p-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm shadow-sm"
					onClick={() => handleNumberClick(0)}
				>
					0
				</button>
				<button
					className="p-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm shadow-sm"
					onClick={() => handleOperatorClick(".")}
				>
					.
				</button>
				<button
					className="p-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 active:bg-green-700 transition-colors text-sm shadow-sm"
					onClick={() => handleEvaluate()}
				>
					=
				</button>
				<button
					className="p-2 bg-blue-100 text-blue-700 font-medium rounded-md hover:bg-blue-200 active:bg-blue-300 transition-colors text-sm shadow-sm"
					onClick={() => handleOperatorClick("+")}
				>
					+
				</button>
			</div>

			{history.length > 0 && (
				<div className="mt-2 border-t pt-1">
					<h3 className="text-xs font-medium text-gray-700 flex items-center">
						<svg className="h-3 w-3 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						History
					</h3>
					<ul className="mt-1 text-xs text-gray-600 max-h-16 overflow-y-auto">
						{history.slice(-3).map((expr, index) => (
							<li
								key={index}
								className="cursor-pointer hover:bg-blue-50 py-0.5 px-1 rounded flex items-center"
								onClick={() => setDisplay(expr)}
							>
								<span className="text-blue-500 mr-1">→</span>
								{expr}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
} 