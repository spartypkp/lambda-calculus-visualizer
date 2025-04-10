"use client";

import { useState } from 'react';

interface ControlPanelProps {
  onReduce: () => void;
  onReset: () => void;
  onNormalForm: () => void;
  canReduce: boolean;
}

export function ControlPanel({ onReduce, onReset, onNormalForm, canReduce }: ControlPanelProps) {
  const [animationSpeed, setAnimationSpeed] = useState(1);

  return (
    <div className="flex flex-col gap-4 p-4 border border-gray-300 rounded-md">
      <h3 className="text-lg font-semibold">Controls</h3>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onReduce}
          disabled={!canReduce}
          className={`px-4 py-2 rounded-md ${
            canReduce 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Step (β-reduce)
        </button>
        
        <button
          onClick={onNormalForm}
          disabled={!canReduce}
          className={`px-4 py-2 rounded-md ${
            canReduce 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          To Normal Form
        </button>
        
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Reset
        </button>
      </div>
      
      <div className="mt-2">
        <label htmlFor="speed-slider" className="block text-sm font-medium mb-2">
          Animation Speed: {animationSpeed}x
        </label>
        <input
          id="speed-slider"
          type="range"
          min="0.5"
          max="3"
          step="0.5"
          value={animationSpeed}
          onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
