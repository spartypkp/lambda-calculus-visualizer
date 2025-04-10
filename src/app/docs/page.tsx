"use client";

import Link from "next/link";

export default function DocumentationPage() {
	return (
		<main className="min-h-screen bg-gray-50 pb-16">
			<div className="container mx-auto px-4 py-8">
				<header className="mb-8">
					<div className="flex justify-between items-center">
						<h1 className="text-3xl font-bold text-gray-800">
							Documentation
						</h1>
						<Link href="/" className="text-blue-600 hover:text-blue-800">
							Back to Visualizer
						</Link>
					</div>
					<p className="text-gray-600 mt-2">
						Learn how to use the Lambda Calculus Visualizer
					</p>
				</header>

				<div className="bg-white p-6 rounded-lg shadow-md">
					<nav className="mb-8">
						<ul className="flex space-x-4 border-b">
							<li className="pb-2 border-b-2 border-blue-600 font-medium text-blue-600">
								<a href="#getting-started">Getting Started</a>
							</li>
							<li className="pb-2 text-gray-700 hover:text-gray-900">
								<a href="#lambda-calculus">Lambda Calculus</a>
							</li>
							<li className="pb-2 text-gray-700 hover:text-gray-900">
								<a href="#visualization">Visualization Guide</a>
							</li>
							<li className="pb-2 text-gray-700 hover:text-gray-900">
								<a href="#examples">Examples</a>
							</li>
						</ul>
					</nav>

					<div className="space-y-12">
						{/* Getting Started Section */}
						<section id="getting-started">
							<h2 className="text-2xl font-bold text-gray-800 mb-4">Getting Started</h2>

							<div className="mb-6">
								<h3 className="text-xl font-semibold text-gray-700 mb-2">What is the Lambda Calculus Visualizer?</h3>
								<p className="text-gray-600 mb-4">
									The Lambda Calculus Visualizer is an interactive tool that helps you understand
									how lambda calculus works by visualizing mathematical expressions. It shows
									how familiar arithmetic operations can be represented and evaluated using lambda calculus.
								</p>
							</div>

							<div className="mb-6">
								<h3 className="text-xl font-semibold text-gray-700 mb-2">Basic Usage</h3>
								<ol className="list-decimal list-inside space-y-2 text-gray-600">
									<li>Enter a mathematical expression in the calculator (e.g., <code className="bg-gray-100 px-1 rounded">3+2</code>)</li>
									<li>Click "=" or press Enter to evaluate</li>
									<li>The expression will be converted to lambda calculus and visualized</li>
									<li>Use the animation controls to step through the evaluation process</li>
									<li>Read the explanations in the educational panel to understand each step</li>
								</ol>
							</div>

							<div className="mb-6">
								<h3 className="text-xl font-semibold text-gray-700 mb-2">Supported Operations</h3>
								<p className="text-gray-600 mb-2">
									The calculator currently supports:
								</p>
								<ul className="list-disc list-inside space-y-1 text-gray-600">
									<li>Addition (<code className="bg-gray-100 px-1 rounded">+</code>)</li>
									<li>Subtraction (<code className="bg-gray-100 px-1 rounded">-</code>)</li>
									<li>Multiplication (<code className="bg-gray-100 px-1 rounded">*</code>)</li>
									<li>Parentheses for expression grouping</li>
								</ul>
							</div>
						</section>

						{/* Lambda Calculus Section */}
						<section id="lambda-calculus">
							<h2 className="text-2xl font-bold text-gray-800 mb-4">Lambda Calculus</h2>

							<div className="mb-6">
								<h3 className="text-xl font-semibold text-gray-700 mb-2">What is Lambda Calculus?</h3>
								<p className="text-gray-600 mb-4">
									Lambda calculus is a formal system in mathematical logic developed by Alonzo Church
									in the 1930s. It provides a mathematical foundation for functional programming
									and serves as a theoretical basis for computation.
								</p>
							</div>

							<div className="mb-6">
								<h3 className="text-xl font-semibold text-gray-700 mb-2">Core Concepts</h3>
								<div className="space-y-4">
									<div className="bg-gray-50 p-4 rounded">
										<h4 className="font-medium text-gray-800 mb-1">Variables</h4>
										<p className="text-gray-600">
											Represented as circles in the visualization. Variables are placeholders for values.
										</p>
									</div>

									<div className="bg-gray-50 p-4 rounded">
										<h4 className="font-medium text-gray-800 mb-1">Abstractions (Functions)</h4>
										<p className="text-gray-600">
											Represented as diamonds in the visualization. An abstraction <code className="bg-gray-100 px-1 rounded">λx.M</code> defines
											a function with parameter <code className="bg-gray-100 px-1 rounded">x</code> and body <code className="bg-gray-100 px-1 rounded">M</code>.
										</p>
									</div>

									<div className="bg-gray-50 p-4 rounded">
										<h4 className="font-medium text-gray-800 mb-1">Applications</h4>
										<p className="text-gray-600">
											Represented as rectangles in the visualization. An application <code className="bg-gray-100 px-1 rounded">(M N)</code> applies
											function <code className="bg-gray-100 px-1 rounded">M</code> to argument <code className="bg-gray-100 px-1 rounded">N</code>.
										</p>
									</div>

									<div className="bg-gray-50 p-4 rounded">
										<h4 className="font-medium text-gray-800 mb-1">Beta Reduction</h4>
										<p className="text-gray-600">
											The fundamental computation step in lambda calculus. When a function is applied to an argument,
											the parameter in the function body is replaced with the argument:
											<code className="bg-gray-100 px-1 rounded">(λx.M) N → M[x := N]</code>
										</p>
									</div>
								</div>
							</div>

							<div className="mb-6">
								<h3 className="text-xl font-semibold text-gray-700 mb-2">Church Encodings</h3>
								<p className="text-gray-600 mb-4">
									Church encodings allow us to represent data (like numbers) and operations (like addition)
									using only functions. This visualizer uses Church numerals to represent numbers.
								</p>
								<div className="bg-gray-50 p-4 rounded">
									<h4 className="font-medium text-gray-800 mb-1">Church Numerals</h4>
									<p className="text-gray-600 mb-2">
										A Church numeral represents a number <code className="bg-gray-100 px-1 rounded">n</code> as a function that applies
										another function <code className="bg-gray-100 px-1 rounded">n</code> times:
									</p>
									<pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
										0 = λf.λx.x
										1 = λf.λx.f x
										2 = λf.λx.f (f x)
										3 = λf.λx.f (f (f x))
										...and so on
									</pre>
								</div>
							</div>
						</section>

						{/* Visualization Guide Section */}
						<section id="visualization">
							<h2 className="text-2xl font-bold text-gray-800 mb-4">Visualization Guide</h2>

							<div className="mb-6">
								<h3 className="text-xl font-semibold text-gray-700 mb-2">Understanding Tromp Diagrams</h3>
								<p className="text-gray-600 mb-4">
									The visualizer uses Tromp diagrams to represent lambda expressions. These diagrams
									provide a visual representation of the structure of lambda terms.
								</p>
								<div className="space-y-2">
									<div className="flex items-center">
										<div className="w-8 h-8 rounded-full bg-[#a8dadc] flex items-center justify-center mr-3"></div>
										<span className="text-gray-700">Variables (x, y, z) are shown as circles</span>
									</div>
									<div className="flex items-center">
										<div className="w-8 h-8 transform rotate-45 bg-[#e63946] mr-3"></div>
										<span className="text-gray-700">Abstractions (λx.body) are shown as diamonds</span>
									</div>
									<div className="flex items-center">
										<div className="w-8 h-8 bg-[#457b9d] mr-3"></div>
										<span className="text-gray-700">Applications (func arg) are shown as rectangles</span>
									</div>
								</div>
							</div>

							<div className="mb-6">
								<h3 className="text-xl font-semibold text-gray-700 mb-2">Animation Controls</h3>
								<p className="text-gray-600 mb-2">
									The animation controls allow you to navigate through the steps of beta reduction:
								</p>
								<ul className="list-disc list-inside space-y-1 text-gray-600">
									<li>Use the play/pause button to start or stop the automatic animation</li>
									<li>Use the previous/next buttons to navigate steps manually</li>
									<li>Adjust the speed slider to control how fast the animation plays</li>
									<li>Use the step slider to jump to a specific reduction step</li>
								</ul>
							</div>

							<div className="mb-6">
								<h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Features</h3>
								<ul className="list-disc list-inside space-y-1 text-gray-600">
									<li>You can zoom and pan the diagram to explore larger expressions</li>
									<li>Nodes being reduced are highlighted with a glowing effect</li>
									<li>For complex expressions, a minimap appears to help with navigation</li>
									<li>Toggle "Show Lambda Notation" to see the textual representation</li>
								</ul>
							</div>
						</section>

						{/* Examples Section */}
						<section id="examples">
							<h2 className="text-2xl font-bold text-gray-800 mb-4">Examples</h2>

							<div className="mb-6">
								<h3 className="text-xl font-semibold text-gray-700 mb-2">Basic Addition</h3>
								<p className="text-gray-600 mb-2">
									Try entering <code className="bg-gray-100 px-1 rounded">2+3</code> in the calculator.
								</p>
								<p className="text-gray-600">
									This will be converted to a lambda expression applying the Church addition function to
									Church numerals 2 and 3. The visualization will show how the expression reduces to 5.
								</p>
							</div>

							<div className="mb-6">
								<h3 className="text-xl font-semibold text-gray-700 mb-2">Multiplication</h3>
								<p className="text-gray-600 mb-2">
									Try entering <code className="bg-gray-100 px-1 rounded">3*2</code> in the calculator.
								</p>
								<p className="text-gray-600">
									This will demonstrate how multiplication works in lambda calculus, showing the
									repeated application of addition.
								</p>
							</div>

							<div className="mb-6">
								<h3 className="text-xl font-semibold text-gray-700 mb-2">Complex Expressions</h3>
								<p className="text-gray-600 mb-2">
									Try entering <code className="bg-gray-100 px-1 rounded">2*(3+1)</code> in the calculator.
								</p>
								<p className="text-gray-600">
									This will show how parenthesized expressions are evaluated, first computing the
									inner expression <code className="bg-gray-100 px-1 rounded">3+1</code> and then multiplying the result by 2.
								</p>
							</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	);
} 