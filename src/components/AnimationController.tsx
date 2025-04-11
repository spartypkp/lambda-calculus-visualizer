"use client";

import { useEffect } from "react";

interface AnimationControllerProps {
	totalSteps: number;
	currentStep: number;
	onStepChange: (step: number) => void;
	isPlaying: boolean;
	onPlayPauseToggle: () => void;
	speed: number;
	onSpeedChange: (speed: number) => void;
}

export default function AnimationController({
	totalSteps,
	currentStep,
	onStepChange,
	isPlaying,
	onPlayPauseToggle,
	speed,
	onSpeedChange,
}: AnimationControllerProps) {
	// Set up auto-play interval
	useEffect(() => {
		if (!isPlaying || totalSteps === 0) return;

		// Create interval based on speed
		const intervalTime = 2000 / speed; // Speed 1 = 2s, Speed 2 = 1s, etc.
		const intervalId = setInterval(() => {
			if (currentStep < totalSteps - 1) {
				onStepChange(currentStep + 1);
			} else {
				// Stop when reached the end
				onPlayPauseToggle();
			}
		}, intervalTime);

		// Clean up interval on unmount or when dependencies change
		return () => clearInterval(intervalId);
	}, [isPlaying, currentStep, totalSteps, speed, onStepChange, onPlayPauseToggle]);

	const handleStepForward = () => {
		if (currentStep < totalSteps - 1) {
			onStepChange(currentStep + 1);
		}
	};

	const handleStepBackward = () => {
		if (currentStep > 0) {
			onStepChange(currentStep - 1);
		}
	};

	const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onStepChange(parseInt(e.target.value, 10));
	};

	return (
		<div className="bg-white p-3 rounded-lg shadow-sm w-full text-sm border border-gray-100">
			<div className="flex items-center mb-2">
				<div className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full mr-3">
					Step {currentStep + 1}/{totalSteps}
				</div>

				<input
					type="range"
					min="0"
					max={totalSteps - 1}
					value={currentStep}
					onChange={handleSliderChange}
					className="flex-grow h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
				/>

				<div className="flex items-center ml-3 space-x-1 bg-gray-50 px-2 py-1 rounded-lg">
					<button
						onClick={() => onSpeedChange(Math.max(1, speed - 1))}
						disabled={speed <= 1}
						className="px-1.5 py-0.5 bg-gray-200 rounded text-xs hover:bg-gray-300 disabled:opacity-50 transition-colors"
					>
						<svg className="h-3 w-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
						</svg>
					</button>
					<span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">{speed}x</span>
					<button
						onClick={() => onSpeedChange(Math.min(5, speed + 1))}
						disabled={speed >= 5}
						className="px-1.5 py-0.5 bg-gray-200 rounded text-xs hover:bg-gray-300 disabled:opacity-50 transition-colors"
					>
						<svg className="h-3 w-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
					</button>
				</div>
			</div>

			<div className="flex justify-between">
				<button
					onClick={handleStepBackward}
					disabled={currentStep <= 0}
					className="p-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs hover:bg-blue-100 disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors flex items-center space-x-1"
				>
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
					<span>Prev</span>
				</button>

				<button
					onClick={onPlayPauseToggle}
					className={`p-1.5 ${isPlaying ? 'bg-indigo-600' : 'bg-blue-600'} text-white rounded-lg text-xs hover:bg-opacity-90 min-w-[70px] transition-colors flex items-center justify-center space-x-1`}
				>
					{isPlaying ? (
						<>
							<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>Pause</span>
						</>
					) : (
						<>
							<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>Play</span>
						</>
					)}
				</button>

				<button
					onClick={handleStepForward}
					disabled={currentStep >= totalSteps - 1}
					className="p-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs hover:bg-blue-100 disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors flex items-center space-x-1"
				>
					<span>Next</span>
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
					</svg>
				</button>
			</div>
		</div>
	);
} 