"use client";

interface Example {
	name: string;
	expression: string;
	description: string;
	category: 'math' | 'lambda';
}

const EXAMPLES: Example[] = [
	// Math expression examples
	{
		name: "Addition",
		expression: "3 + 5",
		description: "Simple addition of two numbers",
		category: "math"
	},
	{
		name: "Subtraction",
		expression: "10 - 4",
		description: "Simple subtraction of two numbers",
		category: "math"
	},
	{
		name: "Multiplication",
		expression: "3 * 4",
		description: "Simple multiplication of two numbers",
		category: "math"
	},
	{
		name: "Division",
		expression: "8 / 2",
		description: "Simple division of two numbers",
		category: "math"
	},
	{
		name: "Complex Expression",
		expression: "(3 + 5) * 2",
		description: "A more complex expression with parentheses",
		category: "math"
	},
	{
		name: "Nested Expression",
		expression: "((4 + 2) * 3) / (2 + 1)",
		description: "A nested expression with multiple operations",
		category: "math"
	},

	// Lambda calculus examples
	{
		name: "Identity",
		expression: "λx.x",
		description: "The identity function: returns its argument unchanged",
		category: "lambda"
	},
	{
		name: "Self-application",
		expression: "λs.(s s)",
		description: "Applies a function to itself",
		category: "lambda"
	},
	{
		name: "Church true",
		expression: "λt.λf.t",
		description: "Church encoding of boolean true: selects the first of two arguments",
		category: "lambda"
	},
	{
		name: "Church false",
		expression: "λt.λf.f",
		description: "Church encoding of boolean false: selects the second of two arguments",
		category: "lambda"
	},
	{
		name: "Church 0",
		expression: "λf.λx.x",
		description: "Church encoding of number 0",
		category: "lambda"
	},
	{
		name: "Church 1",
		expression: "λf.λx.(f x)",
		description: "Church encoding of number 1",
		category: "lambda"
	},
	{
		name: "Church 2",
		expression: "λf.λx.(f (f x))",
		description: "Church encoding of number 2",
		category: "lambda"
	},
	{
		name: "Y combinator",
		expression: "λf.(λx.(f (x x)) λx.(f (x x)))",
		description: "Fixed-point combinator for recursion",
		category: "lambda"
	}
];

interface ExamplesListProps {
	onSelectExample: (expression: string) => void;
}

export function ExamplesList({ onSelectExample }: ExamplesListProps) {
	return (
		<div>
			<div className="mb-4">
				<h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
					Math Expressions
				</h3>
				<div className="space-y-0.5">
					{EXAMPLES.filter(ex => ex.category === 'math').map((example) => (
						<button
							key={example.name}
							className="w-full text-left p-2.5 rounded-md hover:bg-gray-100 transition-colors group flex flex-col"
							onClick={() => onSelectExample(example.expression)}
						>
							<div className="flex items-center justify-between">
								<span className="font-medium text-gray-800">{example.name}</span>
								<span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
									Use →
								</span>
							</div>
							<code className="mt-1 block font-mono text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
								{example.expression}
							</code>
							<span className="text-xs text-gray-500 mt-1">{example.description}</span>
						</button>
					))}
				</div>
			</div>

			<div>
				<h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
					Lambda Calculus
				</h3>
				<div className="space-y-0.5">
					{EXAMPLES.filter(ex => ex.category === 'lambda').map((example) => (
						<button
							key={example.name}
							className="w-full text-left p-2.5 rounded-md hover:bg-gray-100 transition-colors group flex flex-col"
							onClick={() => onSelectExample(example.expression)}
						>
							<div className="flex items-center justify-between">
								<span className="font-medium text-gray-800">{example.name}</span>
								<span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
									Use →
								</span>
							</div>
							<code className="mt-1 block font-mono text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
								{example.expression}
							</code>
							<span className="text-xs text-gray-500 mt-1">{example.description}</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}