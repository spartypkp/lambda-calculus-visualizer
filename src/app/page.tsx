"use client";

import AnimationController from "@/components/AnimationController";
import Calculator from "@/components/Calculator";
import EducationalPanel from "@/components/EducationalPanel";
import TrompDiagram from "@/components/TrompDiagram";
import { LambdaNode } from "@/lib/lambdaCalculus";
import { parseMathExpression } from "@/lib/mathParser";
import { evaluateMathAsLambda } from "@/lib/mathToLambda";
import { useState } from "react";

export default function Home() {
	// State for calculator input and evaluation
	const [calculationResult, setCalculationResult] = useState<number | null>(null);
	const [steps, setSteps] = useState<LambdaNode[]>([]);

	// State for animation and visualization
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [speed, setSpeed] = useState<number>(2); // Default speed
	const [showLambdaNotation, setShowLambdaNotation] = useState<boolean>(false);

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

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Calculator Section */}
					<div>
						<h2 className="text-xl font-semibold text-gray-700 mb-4">Calculator</h2>
						<Calculator onEvaluate={handleCalculatorInput} />

						{calculationResult !== null && (
							<div className="mt-4 p-4 bg-white rounded-lg shadow-md">
								<div className="text-gray-600 mb-1">Result:</div>
								<div className="text-2xl font-bold">{calculationResult}</div>
							</div>
						)}
					</div>

					{/* Visualization Section */}
					<div>
						<h2 className="text-xl font-semibold text-gray-700 mb-4">Visualization</h2>

						{steps.length > 0 ? (
							<>
								<TrompDiagram steps={steps} currentStep={currentStep} />

								<div className="mt-4">
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

								<div className="mt-6">
									<EducationalPanel
										steps={steps}
										currentStep={currentStep}
										showLambdaNotation={showLambdaNotation}
										onToggleLambdaNotation={handleToggleLambdaNotation}
									/>
								</div>
							</>
						) : (
							<div className="bg-white p-8 rounded-lg shadow-md text-center">
								<p className="text-gray-600">
									Enter an expression in the calculator to visualize its lambda calculus representation.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}