"use client";

export function TrompDiagramInfo() {
	return (
		<div className="text-sm text-gray-700">
			<p className="mb-4">
				Tromp Diagrams are a graphical notation for lambda calculus expressions, invented by John Tromp.
			</p>

			<h3 className="font-semibold mb-2 text-gray-800">Diagram Elements</h3>

			<ul className="space-y-2 mb-4">
				<li className="flex items-start">
					<div className="w-4 h-0.5 bg-black mt-2.5 mr-2"></div>
					<div>
						<span className="font-medium">Abstractions (λx.)</span>
						<p className="text-gray-600 text-xs mt-0.5">Represented by horizontal lines</p>
					</div>
				</li>
				<li className="flex items-start">
					<div className="w-0.5 h-4 bg-black mr-2 ml-1.5"></div>
					<div>
						<span className="font-medium">Variables (x)</span>
						<p className="text-gray-600 text-xs mt-0.5">Represented by vertical lines emanating down from their binding lambda</p>
					</div>
				</li>
				<li className="flex items-start">
					<div className="w-4 h-0.5 bg-black mt-2.5 mr-2"></div>
					<div>
						<span className="font-medium">Applications (M N)</span>
						<p className="text-gray-600 text-xs mt-0.5">Represented by horizontal connections between variables</p>
					</div>
				</li>
			</ul>

			<h3 className="font-semibold mb-2 text-gray-800">Diagram Styles</h3>
			<div className="space-y-1 mb-4">
				<div className="border-l-2 border-gray-300 pl-2 mb-2">
					<p className="text-xs font-medium">Standard Style</p>
					<p className="text-xs text-gray-600">Applications connect the leftmost variables</p>
				</div>
				<div className="border-l-2 border-gray-300 pl-2">
					<p className="text-xs font-medium">Alternative Style</p>
					<p className="text-xs text-gray-600">Applications connect the nearest deepest variables, creating a more stylistic appearance</p>
				</div>
			</div>

			<h3 className="font-semibold mb-2 text-gray-800">Common Examples</h3>
			<div className="space-y-1 mb-4">
				<p className="text-xs flex items-center">
					<span className="inline-block w-2 h-2 bg-gray-300 rounded-full mr-1.5"></span>
					<strong>Identity (I):</strong> <code className="bg-gray-100 px-1 rounded ml-1">λx.x</code> - Appears as a simple "T" shape
				</p>
				<p className="text-xs flex items-center">
					<span className="inline-block w-2 h-2 bg-gray-300 rounded-full mr-1.5"></span>
					<strong>True (K):</strong> <code className="bg-gray-100 px-1 rounded ml-1">λx.λy.x</code> - Two horizontal lines with a vertical connection
				</p>
				<p className="text-xs flex items-center">
					<span className="inline-block w-2 h-2 bg-gray-300 rounded-full mr-1.5"></span>
					<strong>False:</strong> <code className="bg-gray-100 px-1 rounded ml-1">λx.λy.y</code> - Two horizontal lines with a vertical connection to the second lambda
				</p>
				<p className="text-xs flex items-center">
					<span className="inline-block w-2 h-2 bg-gray-300 rounded-full mr-1.5"></span>
					<strong>Church numerals:</strong> <code className="bg-gray-100 px-1 rounded ml-1">λf.λx.f(f x)</code> - Distinctive nested pattern
				</p>
			</div>

			<h3 className="font-semibold mb-2 text-gray-800">Beta Reduction</h3>
			<p className="text-xs mb-4">
				When you click "Step", the diagram transforms to show how a beta reduction substitutes variables.
				This visually demonstrates the execution of lambda expressions.
			</p>

			<p className="text-xs text-gray-500 italic border-t pt-2">
				Learn more at <a href="https://tromp.github.io/cl/diagrams.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">tromp.github.io/cl/diagrams.html</a>
			</p>
		</div>
	);
}
