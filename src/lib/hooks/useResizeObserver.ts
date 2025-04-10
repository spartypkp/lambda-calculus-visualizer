import { useEffect, useRef, useState } from 'react';

interface Dimensions {
	width: number;
	height: number;
}

export function useResizeObserver(ref: React.RefObject<HTMLElement | null>): Dimensions | null {
	const [dimensions, setDimensions] = useState<Dimensions | null>(null);
	const observerRef = useRef<ResizeObserver | null>(null);

	useEffect(() => {
		if (!ref.current) return;

		const element = ref.current;

		// Initialize with current dimensions
		setDimensions({
			width: element.clientWidth,
			height: element.clientHeight
		});

		// Set up resize observer
		observerRef.current = new ResizeObserver((entries) => {
			// We're only observing one element, so we can use entries[0]
			if (entries.length > 0) {
				const { width, height } = entries[0].contentRect;
				setDimensions({ width, height });
			}
		});

		// Start observing
		observerRef.current.observe(element);

		// Clean up
		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [ref]);

	return dimensions;
} 