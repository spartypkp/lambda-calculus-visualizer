"use client";

import AnimationController from "@/components/AnimationController";
import Calculator from "@/components/Calculator";
import EducationalPanel from "@/components/EducationalPanel";
import TrompDiagram from "@/components/TrompDiagram";
import { LambdaNode } from "@/lib/lambdaCalculus";
import { parseMathExpression } from "@/lib/mathParser";
import { evaluateMathAsLambda } from "@/lib/mathToLambda";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
	// State for calculator input and evaluation
	const [calculationResult, setCalculationResult] = useState<number | null>(null);
	const [steps, setSteps] = useState<LambdaNode[]>([]);

	// State for animation and visualization
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [speed, setSpeed] = useState<number>(2); // Default speed
	const [showLambdaNotation, setShowLambdaNotation] = useState<boolean>(false);

	// State for UI/layout
	const [isMobile, setIsMobile] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState<'calculator' | 'visualization'>('calculator');

	// Detect screen size for responsive layout
	useEffect(() => {
		const checkScreenSize = () => {
			setIsMobile(window.innerWidth < 1024);
		};

		// Initial check
		checkScreenSize();

		// Add event listener
		window.addEventListener('resize', checkScreenSize);

		// Cleanup
		return () => window.removeEventListener('resize', checkScreenSize);
	}, []);

	// Handle input from calculator
	const handleCalculatorInput = (expression: string) => {
		try {
			// Parse the expression into an AST
			const mathAst = parseMathExpression(expression);

			// Convert to lambda calculus and evaluate
			const { lambdaExpr, steps, result } = evaluateMathAsLambda(mathAst);

			// Update state with the results
			setCalculationResult(result);
			setSteps(steps);
			setCurrentStep(0);
			setIsPlaying(true);

			// On mobile, automatically switch to visualization tab
			if (isMobile) {
				setActiveTab('visualization');
			}
		} catch (error) {
			console.error("Error evaluating expression:", error);
			setCalculationResult(null);
			setSteps([]);
		}
	};

	// Toggle play/pause of animation
	const handlePlayPauseToggle = () => {
		setIsPlaying(!isPlaying);
	};

	// Toggle lambda notation display
	const handleToggleLambdaNotation = () => {
		setShowLambdaNotation(!showLambdaNotation);
	};

	// Render mobile tabs
	const renderMobileTabs = () => (
		<div className="flex border-b mb-4">
			<button
				className={`flex-1 py-2 px-4 font-medium ${activeTab === 'calculator'
					? 'text-blue-600 border-b-2 border-blue-600'
					: 'text-gray-500'
					}`}
				onClick={() => setActiveTab('calculator')}
			>
				Calculator
			</button>
			<button
				className={`flex-1 py-2 px-4 font-medium ${activeTab === 'visualization'
					? 'text-blue-600 border-b-2 border-blue-600'
					: 'text-gray-500'
					}`}
				onClick={() => setActiveTab('visualization')}
			>
				Visualization
				{calculationResult !== null && (
					<span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-600 rounded-full">
						{calculationResult}
					</span>
				)}
			</button>
		</div>
	);

	// Calculator section
	const renderCalculator = () => (
		<div className={`${isMobile && activeTab !== 'calculator' ? 'hidden' : ''} bg-white p-3 rounded-lg shadow-md`}>
			<div className="flex justify-between items-center mb-2">
				<h2 className="text-lg font-semibold text-gray-700">Calculator</h2>
				{calculationResult !== null && (
					<div className="flex items-center">
						<span className="text-gray-600 mr-1">Result:</span>
						<span className="text-xl font-bold">{calculationResult}</span>
					</div>
				)}
			</div>
			<div className="flex-shrink-0">
				<Calculator onEvaluate={handleCalculatorInput} />
			</div>
		</div>
	);

	// Visualization section
	const renderVisualization = () => (
		<div className={`${isMobile && activeTab !== 'visualization' ? 'hidden' : ''} bg-white p-4 rounded-lg shadow-md`}>
			<h2 className="text-xl font-semibold text-gray-700 mb-3">Visualization</h2>

			{steps.length > 0 ? (
				<>
					<div className="h-[400px]">
						<TrompDiagram steps={steps} currentStep={currentStep} />
					</div>

					<div className="mt-3">
						<AnimationController
							totalSteps={steps.length}
							currentStep={currentStep}
							onStepChange={setCurrentStep}
							isPlaying={isPlaying}
							onPlayPauseToggle={handlePlayPauseToggle}
							speed={speed}
							onSpeedChange={setSpeed}
						/>
					</div>

					<div className="mt-4">
						<EducationalPanel
							steps={steps}
							currentStep={currentStep}
							showLambdaNotation={showLambdaNotation}
							onToggleLambdaNotation={handleToggleLambdaNotation}
						/>
					</div>
				</>
			) : (
				<div className="p-6 text-center">
					<p className="text-gray-600">
						Enter an expression in the calculator to visualize its lambda calculus representation.
					</p>

					{isMobile && (
						<button
							className="mt-3 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
							onClick={() => setActiveTab('calculator')}
						>
							Go to Calculator
						</button>
					)}
				</div>
			)}
		</div>
	);

	return (
		<main className="min-h-screen bg-gray-50 pb-16">
			<div className="container mx-auto px-4 py-8">
				<header className="mb-8">
					<div className="flex justify-between items-center">
						<h1 className="text-3xl font-bold text-gray-800">
							Lambda Calculus Visualizer
						</h1>
						<Link href="/docs" className="text-blue-600 hover:text-blue-800">
							Documentation
						</Link>
					</div>
					<p className="text-gray-600 mt-2">
						Interactively explore lambda calculus expressions with Tromp diagrams
					</p>
				</header>

				{isMobile && renderMobileTabs()}

				<div className="grid grid-cols-1 gap-4">
					{/* Calculator Section - more compact */}
					<div className="max-h-[250px]">
						{renderCalculator()}
					</div>

					{/* Visualization Section - more prominent */}
					<div className="min-h-[500px]">
						{renderVisualization()}
					</div>
				</div>

				{/* Footer with helpful information */}
				<footer className="mt-16 pt-8 border-t border-gray-200">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div>
							<h3 className="text-lg font-semibold mb-4">About Lambda Calculus</h3>
							<p className="text-gray-600">
								Lambda calculus is a formal system in mathematical logic for
								expressing computation based on function abstraction and
								application. It forms the theoretical foundation of functional programming.
							</p>
						</div>

						<div>
							<h3 className="text-lg font-semibold mb-4">How To Use</h3>
							<ol className="list-decimal list-inside text-gray-600">
								<li className="mb-2">Enter a mathematical expression in the calculator</li>
								<li className="mb-2">Watch the expression transform to lambda calculus</li>
								<li className="mb-2">Use the animation controls to step through the evaluation</li>
								<li>See the final result in standard notation</li>
							</ol>
						</div>

						<div>
							<h3 className="text-lg font-semibold mb-4">Resources</h3>
							<ul className="space-y-2 text-gray-600">
								<li>
									<a
										href="https://en.wikipedia.org/wiki/Lambda_calculus"
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:underline"
									>
										Wikipedia: Lambda Calculus
									</a>
								</li>
								<li>
									<a
										href="https://plato.stanford.edu/entries/lambda-calculus/"
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:underline"
									>
										Stanford Encyclopedia: Lambda Calculus
									</a>
								</li>
								<li>
									<a
										href="https://en.wikipedia.org/wiki/Church_encoding"
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:underline"
									>
										Wikipedia: Church Encodings
									</a>
								</li>
							</ul>
						</div>
					</div>

					<div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
						© {new Date().getFullYear()} Lambda Calculus Visualizer
					</div>
				</footer>
			</div>
		</main>
	);
}