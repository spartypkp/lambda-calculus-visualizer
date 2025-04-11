"use client";

import AnimationController from "@/components/AnimationController";
import Calculator from "@/components/Calculator";
import EducationalPanel from "@/components/EducationalPanel";
import TrompDiagram from "@/components/TrompDiagram";
import { LambdaNode } from "@/lib/lambdaCalculus";
import { parseMathExpression } from "@/lib/mathParser";
import { evaluateMathAsLambda } from "@/lib/mathToLambda";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
	// State for calculator input and evaluation
	const [calculationResult, setCalculationResult] = useState<number | null>(null);
	const [steps, setSteps] = useState<LambdaNode[]>([]);
	const [currentExpression, setCurrentExpression] = useState<string>("");
	const [liveVisualization, setLiveVisualization] = useState<boolean>(true);

	// State for animation and visualization
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [speed, setSpeed] = useState<number>(2); // Default speed
	const [showLambdaNotation, setShowLambdaNotation] = useState<boolean>(false);

	// State for UI/layout
	const [isMobile, setIsMobile] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState<'calculator' | 'visualization'>('calculator');
	const [showCalculator, setShowCalculator] = useState<boolean>(true);

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

	// Process an expression for visualization
	const processExpression = useCallback((expression: string) => {
		if (!expression.trim()) {
			setSteps([]);
			setCalculationResult(null);
			return;
		}

		try {
			// Parse the expression into an AST
			const mathAst = parseMathExpression(expression);

			// Convert to lambda calculus and evaluate
			const { lambdaExpr, steps, result } = evaluateMathAsLambda(mathAst);

			// Update state with the results
			setSteps(steps);
			setCalculationResult(result);
			setCurrentStep(0);
		} catch (error) {
			// Silently ignore errors for real-time visualization
			// This allows for partial expressions while typing
			console.debug("Expression processing error (ignored for live update):", error);
		}
	}, []);

	// Handle expression changes for live visualization
	const handleExpressionChange = useCallback((expression: string) => {
		setCurrentExpression(expression);

		if (liveVisualization) {
			processExpression(expression);
		}
	}, [liveVisualization, processExpression]);

	// Handle final evaluation from calculator
	const handleCalculatorInput = useCallback((expression: string) => {
		setCurrentExpression(expression);

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
	}, [isMobile]);

	// Toggle play/pause of animation
	const handlePlayPauseToggle = () => {
		setIsPlaying(!isPlaying);
	};

	// Toggle lambda notation display
	const handleToggleLambdaNotation = () => {
		setShowLambdaNotation(!showLambdaNotation);
	};

	// Toggle live visualization
	const handleToggleLiveVisualization = () => {
		setLiveVisualization(!liveVisualization);

		// If turning on live visualization, process the current expression
		if (!liveVisualization && currentExpression) {
			processExpression(currentExpression);
		}
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
		<div className={`${isMobile && activeTab !== 'calculator' ? 'hidden' : ''} bg-white p-3 rounded-lg shadow-md backdrop-blur-sm bg-opacity-95`}>
			<div className="flex justify-between items-center mb-2">
				<div className="flex items-center">
					<h2 className="text-lg font-semibold text-blue-700 mr-3 flex items-center">
						<svg className="h-5 w-5 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
						</svg>
						Calculator
					</h2>
					<button
						onClick={handleToggleLiveVisualization}
						className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${liveVisualization
							? "bg-blue-100 text-blue-800 border border-blue-200"
							: "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
							}`}
						title={liveVisualization ? "Turn off live visualization" : "Turn on live visualization"}
					>
						<span className={`w-2 h-2 rounded-full ${liveVisualization ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></span>
						<span>Live Preview</span>
					</button>
				</div>
				{calculationResult !== null && (
					<div className="flex items-center bg-green-50 px-2 py-1 rounded-lg">
						<span className="text-gray-600 mr-1 text-xs">Result:</span>
						<span className="text-xl font-bold text-green-700">{calculationResult}</span>
					</div>
				)}
			</div>
			<div className="flex-shrink-0">
				<Calculator
					onEvaluate={handleCalculatorInput}
					onExpressionChange={handleExpressionChange}
				/>
			</div>
		</div>
	);

	// Calculator toggle button for desktop
	const renderCalculatorToggle = () => (
		<button
			onClick={() => setShowCalculator(!showCalculator)}
			className="absolute bottom-4 left-4 z-20 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
			title={showCalculator ? "Hide Calculator" : "Show Calculator"}
		>
			<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				{showCalculator ? (
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
				) : (
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm5.69 0H14v.008h.008V12zm.697 0h.007v.008h-.007V12zm-7.5 0h.008v.008H6.25v-.008zm5.69 0h.007v.008h-.007V12zm-5.69-5.25h.008v.008H6.25v-.008zm5.69 0h.007v.008h-.007V6.75zm5.69 0h.007v.008h-.007V6.75zm-1.37-3.75h.01v.008h-.01V3H8.25v.008h.01V3h7.5z" />
				)}
			</svg>
		</button>
	);

	// Visualization section
	const renderVisualization = () => (
		<div className={`${isMobile && activeTab !== 'visualization' ? 'hidden' : ''} bg-white p-4 rounded-lg shadow-md h-full flex flex-col`}>
			<div className="flex justify-between items-center mb-3">
				<h2 className="text-xl font-semibold text-blue-700 flex items-center">
					<svg className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
					</svg>
					Visualization
				</h2>
				{liveVisualization && currentExpression && (
					<div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium flex items-center truncate max-w-[180px] md:max-w-xs">
						<span className="inline-block h-2 w-2 rounded-full bg-blue-500 mr-2 flex-shrink-0 animate-pulse"></span>
						<span className="truncate">Visualizing: {currentExpression}</span>
					</div>
				)}
			</div>

			{steps.length > 0 ? (
				<>
					<div className="flex-grow h-[calc(100%-220px)] min-h-[250px] bg-gray-50 rounded-lg p-1">
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

					<div className="mt-3 overflow-auto max-h-[200px]">
						<EducationalPanel />
					</div>
				</>
			) : (
				<div className="flex-grow flex items-center justify-center">
					<div className="p-6 text-center">
						<div className="mb-4">
							<svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
							</svg>
						</div>
						<p className="text-gray-600 mb-2">
							{liveVisualization
								? "Type in the calculator to see the visualization update in real-time."
								: "Enter an expression in the calculator and press '=' to visualize."}
						</p>
						<p className="text-sm text-gray-500">Try a simple expression like "1+2" to get started</p>

						{isMobile && (
							<button
								className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
								onClick={() => setActiveTab('calculator')}
							>
								Go to Calculator
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);

	return (
		<main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-16">
			<div className="container mx-auto px-4 py-8">
				<header className="mb-8">
					<div className="flex justify-between items-center">
						<div className="flex items-center">
							<svg className="h-8 w-8 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
							</svg>
							<div>
								<h1 className="text-3xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
									Lambda Calculus Visualizer
								</h1>
								<p className="text-gray-600 mt-2 text-lg">
									Interactively explore lambda calculus expressions with Tromp diagrams
								</p>
							</div>
						</div>
						<div className="flex items-center gap-4">
							<a
								href="https://github.com/spartypkp/lambda-calculus-visualizer"
								target="_blank"
								rel="noopener noreferrer"
								className="text-gray-700 hover:text-black transition-colors duration-200"
								title="View source code on GitHub"
							>
								<svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
								</svg>
							</a>
							<Link href="/docs" className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-blue-600 hover:text-blue-800">
								<svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								Documentation
							</Link>
						</div>
					</div>
				</header>

				{isMobile && renderMobileTabs()}

				{/* Desktop Layout with calculator in bottom left, visualization taking most of screen */}
				{!isMobile ? (
					<div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)] max-h-[800px] relative overflow-hidden">
						{/* Visualization Section - Large area */}
						<div className="col-span-12 row-span-3 mb-4 overflow-hidden">
							{renderVisualization()}
						</div>

						{/* Calculator Section - Bottom left */}
						{showCalculator && (
							<div className="absolute bottom-16 left-4 z-10 w-72 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg">
								{renderCalculator()}
							</div>
						)}

						{/* Calculator toggle button */}
						{renderCalculatorToggle()}
					</div>
				) : (
					/* Mobile Layout - Stacked */
					<div className="grid grid-cols-1 gap-4">
						<div className={`${activeTab === 'calculator' ? 'block' : 'hidden'} max-h-[350px] overflow-auto`}>
							{renderCalculator()}
						</div>
						<div className={`${activeTab === 'visualization' ? 'block' : 'hidden'} h-[calc(100vh-250px)] min-h-[400px] max-h-[600px]`}>
							{renderVisualization()}
						</div>
					</div>
				)}

				{/* Footer with helpful information */}
				<footer className="mt-16 pt-8 border-t border-gray-200">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="bg-white p-5 rounded-lg shadow-sm">
							<h3 className="text-lg font-semibold mb-4 flex items-center text-blue-700">
								<svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								About Lambda Calculus
							</h3>
							<p className="text-gray-600">
								Lambda calculus is a formal system in mathematical logic for
								expressing computation based on function abstraction and
								application. It forms the theoretical foundation of functional programming.
							</p>
						</div>

						<div className="bg-white p-5 rounded-lg shadow-sm">
							<h3 className="text-lg font-semibold mb-4 flex items-center text-blue-700">
								<svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
								</svg>
								How To Use
							</h3>
							<ol className="list-decimal list-inside text-gray-600 space-y-2">
								<li className="p-1 hover:bg-blue-50 rounded transition-colors">Enter a mathematical expression in the calculator</li>
								<li className="p-1 hover:bg-blue-50 rounded transition-colors">Watch the expression transform to lambda calculus</li>
								<li className="p-1 hover:bg-blue-50 rounded transition-colors">Use the animation controls to step through the evaluation</li>
								<li className="p-1 hover:bg-blue-50 rounded transition-colors">See the final result in standard notation</li>
							</ol>
						</div>

						<div className="bg-white p-5 rounded-lg shadow-sm">
							<h3 className="text-lg font-semibold mb-4 flex items-center text-blue-700">
								<svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
								</svg>
								Resources
							</h3>
							<ul className="space-y-2 text-gray-600">
								<li>
									<a
										href="https://en.wikipedia.org/wiki/Lambda_calculus"
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
									>
										<svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
										</svg>
										Wikipedia: Lambda Calculus
									</a>
								</li>
								<li>
									<a
										href="https://plato.stanford.edu/entries/lambda-calculus/"
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
									>
										<svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
										</svg>
										Stanford Encyclopedia: Lambda Calculus
									</a>
								</li>
								<li>
									<a
										href="https://en.wikipedia.org/wiki/Church_encoding"
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
									>
										<svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
										</svg>
										Wikipedia: Church Encodings
									</a>
								</li>
								<li className="pt-4 border-t border-gray-100">
									<h4 className="font-medium text-blue-700 text-sm mb-2">Project Inspirations</h4>
								</li>
								<li>
									<a
										href="https://www.youtube.com/watch?v=RcVA8Nj6HEo"
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
									>
										<svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										YouTube: Geometry of Lambda Calculus
									</a>
								</li>
								<li>
									<a
										href="https://tromp.github.io/cl/diagrams.html"
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
									>
										<svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
										</svg>
										Tromp Diagrams Documentation
									</a>
								</li>
								<li>
									<a
										href="https://www.desmos.com/calculator/rviihyo72n"
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
									>
										<svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
										</svg>
										Desmos: Lambda Calculus Visualizer
									</a>
								</li>
								<li>
									<a
										href="https://github.com/polux/lambda-diagrams"
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
									>
										<svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
										</svg>
										GitHub: Lambda Diagrams (Haskell)
									</a>
								</li>
							</ul>
						</div>
					</div>

					<div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
						© {new Date().getFullYear()} Lambda Calculus Visualizer • Built with ♥ for learning
					</div>
				</footer>
			</div>
		</main>
	);
}