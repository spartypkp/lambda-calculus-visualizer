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
		<div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
			<div className="flex justify-between items-center mb-4">
				<div className="text-sm font-medium text-gray-700">
					Step {currentStep + 1} of {totalSteps}
				</div>

				<div className="flex space-x-2">
					<button
						onClick={() => onSpeedChange(Math.max(1, speed - 1))}
						disabled={speed <= 1}
						className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
					>
						Slower
					</button>

					<div className="py-2 px-3 bg-gray-100 rounded">
						{speed}x
					</div>

					<button
						onClick={() => onSpeedChange(Math.min(5, speed + 1))}
						disabled={speed >= 5}
						className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
					>
						Faster
					</button>
				</div>
			</div>

			<div className="mb-4">
				<input
					type="range"
					min="0"
					max={totalSteps - 1}
					value={currentStep}
					onChange={handleSliderChange}
					className="w-full"
				/>
			</div>

			<div className="flex justify-between">
				<button
					onClick={handleStepBackward}
					disabled={currentStep <= 0}
					className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
				>
					← Previous
				</button>

				<button
					onClick={onPlayPauseToggle}
					className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				>
					{isPlaying ? "Pause" : "Play"}
				</button>

				<button
					onClick={handleStepForward}
					disabled={currentStep >= totalSteps - 1}
					className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
				>
					Next →
				</button>
			</div>
		</div>
	);
} 