"use client";

import { useState } from "react";

interface CalculatorProps {
	onEvaluate: (expression: string) => void;
}

export default function Calculator({ onEvaluate }: CalculatorProps) {
	const [display, setDisplay] = useState<string>("");
	const [history, setHistory] = useState<string[]>([]);

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

	return (
		<div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
			<div className="mb-4">
				<input
					type="text"
					value={display}
					onChange={(e) => setDisplay(e.target.value)}
					className="w-full p-2 text-right text-xl bg-gray-100 rounded"
					placeholder="0"
				/>
			</div>

			<div className="grid grid-cols-4 gap-2">
				<button
					className="p-3 bg-gray-200 rounded hover:bg-gray-300"
					onClick={() => handleClear()}
				>
					C
				</button>
				<button
					className="p-3 bg-gray-200 rounded hover:bg-gray-300"
					onClick={() => handleDelete()}
				>
					←
				</button>
				<button
					className="p-3 bg-gray-200 rounded hover:bg-gray-300"
					onClick={() => handleOperatorClick("(")}
				>
					(
				</button>
				<button
					className="p-3 bg-gray-200 rounded hover:bg-gray-300"
					onClick={() => handleOperatorClick(")")}
				>
					)
				</button>

				{[7, 8, 9].map((num) => (
					<button
						key={num}
						className="p-3 bg-gray-100 rounded hover:bg-gray-200"
						onClick={() => handleNumberClick(num)}
					>
						{num}
					</button>
				))}
				<button
					className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
					onClick={() => handleOperatorClick("/")}
				>
					÷
				</button>

				{[4, 5, 6].map((num) => (
					<button
						key={num}
						className="p-3 bg-gray-100 rounded hover:bg-gray-200"
						onClick={() => handleNumberClick(num)}
					>
						{num}
					</button>
				))}
				<button
					className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
					onClick={() => handleOperatorClick("*")}
				>
					×
				</button>

				{[1, 2, 3].map((num) => (
					<button
						key={num}
						className="p-3 bg-gray-100 rounded hover:bg-gray-200"
						onClick={() => handleNumberClick(num)}
					>
						{num}
					</button>
				))}
				<button
					className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
					onClick={() => handleOperatorClick("-")}
				>
					−
				</button>

				<button
					className="p-3 bg-gray-100 rounded hover:bg-gray-200"
					onClick={() => handleNumberClick(0)}
				>
					0
				</button>
				<button
					className="p-3 bg-gray-100 rounded hover:bg-gray-200"
					onClick={() => handleOperatorClick(".")}
				>
					.
				</button>
				<button
					className="p-3 bg-green-500 text-white rounded hover:bg-green-600"
					onClick={() => handleEvaluate()}
				>
					=
				</button>
				<button
					className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
					onClick={() => handleOperatorClick("+")}
				>
					+
				</button>
			</div>

			{history.length > 0 && (
				<div className="mt-4 border-t pt-2">
					<h3 className="text-sm font-medium text-gray-700">History</h3>
					<ul className="mt-1 text-sm text-gray-600">
						{history.slice(-5).map((expr, index) => (
							<li
								key={index}
								className="cursor-pointer hover:bg-gray-100 p-1"
								onClick={() => setDisplay(expr)}
							>
								{expr}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
} 