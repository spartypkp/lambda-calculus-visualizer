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
		<div className="bg-white p-3 rounded shadow-sm w-full text-sm">
			<div className="flex items-center mb-2">
				<div className="text-xs font-medium text-gray-700 mr-3">
					Step {currentStep + 1}/{totalSteps}
				</div>

				<input
					type="range"
					min="0"
					max={totalSteps - 1}
					value={currentStep}
					onChange={handleSliderChange}
					className="flex-grow h-1"
				/>

				<div className="flex items-center ml-3 space-x-1">
					<button
						onClick={() => onSpeedChange(Math.max(1, speed - 1))}
						disabled={speed <= 1}
						className="px-1.5 py-0.5 bg-gray-200 rounded text-xs hover:bg-gray-300 disabled:opacity-50"
					>
						-
					</button>
					<span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{speed}x</span>
					<button
						onClick={() => onSpeedChange(Math.min(5, speed + 1))}
						disabled={speed >= 5}
						className="px-1.5 py-0.5 bg-gray-200 rounded text-xs hover:bg-gray-300 disabled:opacity-50"
					>
						+
					</button>
				</div>
			</div>

			<div className="flex justify-between">
				<button
					onClick={handleStepBackward}
					disabled={currentStep <= 0}
					className="p-1.5 bg-gray-200 rounded text-xs hover:bg-gray-300 disabled:opacity-50"
				>
					← Prev
				</button>

				<button
					onClick={onPlayPauseToggle}
					className="p-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 min-w-[60px]"
				>
					{isPlaying ? "Pause" : "Play"}
				</button>

				<button
					onClick={handleStepForward}
					disabled={currentStep >= totalSteps - 1}
					className="p-1.5 bg-gray-200 rounded text-xs hover:bg-gray-300 disabled:opacity-50"
				>
					Next →
				</button>
			</div>
		</div>
	);
} 