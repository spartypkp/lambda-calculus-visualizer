"use client";

import Visualizer from '@/components/lambda/Visualizer';

export default function Home() {
	return (
		<main className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8">
				<header className="mb-8">
					<h1 className="text-3xl font-bold text-gray-800">
						Lambda Calculus Visualizer
					</h1>
					<p className="text-gray-600 mt-2">
						Interactively explore lambda calculus expressions with Tromp diagrams
					</p>
				</header>

				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-100">
						<h2 className="text-lg font-semibold text-blue-800 mb-2">How to Use</h2>
						<ol className="list-decimal pl-5 space-y-1 text-blue-700">
							<li>Enter a simple mathematical expression (e.g., <code className="bg-blue-100 px-1 rounded">1+3</code> or <code className="bg-blue-100 px-1 rounded">2*5</code>)</li>
							<li>Click "Visualize" to see the lambda calculus representation</li>
							<li>The Tromp diagram will show the structure of your expression</li>
							<li>Use the controls below to see the step-by-step evaluation</li>
						</ol>
					</div>

					<div className="min-h-[70vh]">
						<Visualizer />
					</div>
				</div>

				<footer className="mt-8 text-center text-gray-500 text-sm">
					<p>
						Built with Next.js and TypeScript
					</p>
				</footer>
			</div>
		</main>
	);
}