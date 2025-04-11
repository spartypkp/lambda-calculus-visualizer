"use client";

import { useResizeObserver } from "@/lib/hooks/useResizeObserver";
import { LambdaNode } from "@/lib/lambdaCalculus";
import * as d3 from "d3";
import { useCallback, useEffect, useRef } from "react";

interface TrompDiagramProps {
	steps: LambdaNode[];
	currentStep: number;
}

// Types for D3 hierarchy
interface TrompNode {
	id: string;
	type: string;
	name?: string;
	children: TrompNode[];
	// Track if this node is part of a beta reduction
	isReduced?: boolean;
}

export default function TrompDiagram({ steps, currentStep }: TrompDiagramProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const zoomBehaviorRef = useRef<any>(null);
	const gRef = useRef<SVGGElement | null>(null);
	const previousStepsRef = useRef<LambdaNode[]>([]);
	const previousStepIndexRef = useRef<number>(0);
	const treeDataRef = useRef<any>(null);

	// Use resize observer hook to make diagram responsive
	const dimensions = useResizeObserver(containerRef);

	// Convert a lambda calculus node to a hierarchy for D3
	const lambdaToHierarchy = useCallback((
		node: LambdaNode,
		reducedNodes: Set<string>,
		id = "root"
	): TrompNode => {
		const isReduced = reducedNodes.has(id);

		switch (node.type) {
			case "variable":
				return {
					id,
					type: "variable",
					name: node.name,
					children: [],
					isReduced
				};
			case "abstraction":
				return {
					id,
					type: "abstraction",
					name: node.param,
					children: [lambdaToHierarchy(node.body, reducedNodes, `${id}-body`)],
					isReduced
				};
			case "application":
				return {
					id,
					type: "application",
					children: [
						lambdaToHierarchy(node.func, reducedNodes, `${id}-func`),
						lambdaToHierarchy(node.arg, reducedNodes, `${id}-arg`),
					],
					isReduced
				};
			default:
				return { id, type: "unknown", children: [], isReduced };
		}
	}, []);

	// Get node counts to determine appropriate sizing
	const getNodeCount = useCallback((node: LambdaNode): number => {
		switch (node.type) {
			case "variable":
				return 1;
			case "abstraction":
				return 1 + getNodeCount(node.body);
			case "application":
				return 1 + getNodeCount(node.func) + getNodeCount(node.arg);
			default:
				return 1;
		}
	}, []);

	// Determine which nodes are part of the beta reduction in the current step
	const getReducedNodes = useCallback((current: LambdaNode, next: LambdaNode | null): Set<string> => {
		// If there's no next step, nothing is being reduced
		if (!next) return new Set<string>();

		// Track paths that differ between current and next
		const reducedNodes = new Set<string>();

		// Helper to compare nodes recursively
		const compareNodes = (node1: LambdaNode, node2: LambdaNode, path: string = 'root') => {
			// Check if the node types are different
			if (node1.type !== node2.type) {
				reducedNodes.add(path);
				return;
			}

			// Check specific node types
			if (node1.type === 'variable' && node2.type === 'variable') {
				if (node1.name !== node2.name) {
					reducedNodes.add(path);
				}
			} else if (node1.type === 'abstraction' && node2.type === 'abstraction') {
				if (node1.param !== node2.param) {
					reducedNodes.add(path);
				}
				compareNodes(node1.body, node2.body, `${path}-body`);
			} else if (node1.type === 'application' && node2.type === 'application') {
				compareNodes(node1.func, node2.func, `${path}-func`);
				compareNodes(node1.arg, node2.arg, `${path}-arg`);
			}
		};

		// Compare current and next nodes
		compareNodes(current, next);
		return reducedNodes;
	}, []);

	// Handle manual reset of view
	const handleResetView = useCallback(() => {
		if (svgRef.current && gRef.current && zoomBehaviorRef.current) {
			// Simple reset to a standard position
			const svg = d3.select(svgRef.current);
			svg.transition()
				.duration(400)
				.call(
					zoomBehaviorRef.current.transform,
					d3.zoomIdentity.translate(120, 100).scale(1)
				);
		}
	}, []);

	// Calculate a view that fits the entire visualization
	const handleFitToView = useCallback(() => {
		if (!svgRef.current || !gRef.current || !zoomBehaviorRef.current || !dimensions) return;

		const svg = d3.select(svgRef.current);
		const g = d3.select(gRef.current);

		// Get the bounding box of the visualization
		try {
			const bbox = (gRef.current as SVGGElement).getBBox();

			// Add padding
			const padding = 40;

			// Calculate the scale to fit the diagram in the view
			const scale = Math.min(
				(dimensions.width - padding * 2) / bbox.width,
				(dimensions.height - padding * 2) / bbox.height
			);

			// Limit the scale to a reasonable range
			const limitedScale = Math.min(Math.max(0.2, scale), 2);

			// Calculate the translation to center the diagram
			const tx = (dimensions.width - bbox.width * limitedScale) / 2 - bbox.x * limitedScale;
			const ty = (dimensions.height - bbox.height * limitedScale) / 2 - bbox.y * limitedScale;

			// Apply the transform with a smooth transition
			svg.transition()
				.duration(600)
				.call(
					zoomBehaviorRef.current.transform,
					d3.zoomIdentity.translate(tx, ty).scale(limitedScale)
				);
		} catch (e) {
			// Fallback if getBBox fails
			handleResetView();
		}
	}, [dimensions, handleResetView]);

	// Focus on the active part of the diagram
	const handleFocusOnChanges = useCallback(() => {
		if (!svgRef.current || !gRef.current || !zoomBehaviorRef.current || !dimensions) return;

		const g = d3.select(gRef.current);
		const changedNodes = g.selectAll(".node-reduced");

		// Check if we have highlighted nodes to focus on
		if (!changedNodes.empty()) {
			try {
				// Get bounding box of all highlighted nodes
				let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

				changedNodes.each(function () {
					const node = d3.select(this);
					const transform = node.attr("transform");
					const match = transform.match(/translate\(([^,]+),([^)]+)\)/);

					if (match) {
						const x = parseFloat(match[1]);
						const y = parseFloat(match[2]);
						minX = Math.min(minX, x - 30);
						minY = Math.min(minY, y - 30);
						maxX = Math.max(maxX, x + 30);
						maxY = Math.max(maxY, y + 30);
					}
				});

				if (minX !== Infinity) {
					const width = maxX - minX;
					const height = maxY - minY;
					const centerX = minX + width / 2;
					const centerY = minY + height / 2;

					// Calculate scale to fit the changed area
					const scale = Math.min(
						dimensions.width / (width * 2),
						dimensions.height / (height * 2)
					);

					// Limit the scale to a reasonable range
					const limitedScale = Math.min(Math.max(0.5, scale), 2);

					// Apply the transform with a smooth transition
					const svg = d3.select(svgRef.current);
					svg.transition()
						.duration(600)
						.call(
							zoomBehaviorRef.current.transform,
							d3.zoomIdentity
								.translate(dimensions.width / 2 - centerX, dimensions.height / 2 - centerY)
								.scale(limitedScale)
						);
				}
			} catch (e) {
				// Fallback if something goes wrong
				handleFitToView();
			}
		} else {
			// If no changes to focus on, fit the entire visualization
			handleFitToView();
		}
	}, [dimensions, handleFitToView]);

	// Handle updating when stepping through the same expression
	useEffect(() => {
		// Only apply transitions when we're moving between steps of the same expression
		// and not on initial render
		if (previousStepsRef.current === steps &&
			steps.length > 0 &&
			gRef.current &&
			treeDataRef.current) {

			// Get the transition duration - shorter for larger changes
			const duration = 600;

			// Apply smooth transitions for the links
			const g = d3.select(gRef.current);
			const linkData = treeDataRef.current.links();
			g.selectAll<SVGPathElement, d3.HierarchyPointLink<TrompNode>>(".link")
				.data(linkData)
				.join("path")
				.transition()
				.duration(duration)
				.attr("d", function (d) {
					const link = d as d3.HierarchyPointLink<TrompNode>;
					return d3.linkHorizontal<d3.HierarchyPointLink<TrompNode>, d3.HierarchyPointNode<TrompNode>>()
						.x((node) => node.y)
						.y((node) => node.x)(link) || "";
				});

			// Apply smooth transitions for the nodes
			const nodeData = treeDataRef.current.descendants();
			g.selectAll<SVGGElement, d3.HierarchyPointNode<TrompNode>>(".node")
				.data(nodeData)
				.join("g")
				.transition()
				.duration(duration)
				.attr("transform", function (d) {
					const node = d as d3.HierarchyPointNode<TrompNode>;
					return `translate(${node.y},${node.x})`;
				});

			// Highlight the nodes involved in the current reduction step
			g.selectAll<Element, d3.HierarchyPointNode<TrompNode>>(".node")
				.classed("node-reduced", function (d) {
					return d.data.isReduced || false;
				});
		}

		// Update the previous step index for next time
		previousStepIndexRef.current = currentStep;
	}, [currentStep]);

	// Main rendering effect
	useEffect(() => {
		// If we have no steps or no dimensions, we can't render anything
		if (!svgRef.current || !dimensions) return;

		// Clear any previous content
		d3.select(svgRef.current).selectAll("*").remove();

		// If there are no steps, just display an empty diagram
		if (!steps.length) {
			const svg = d3.select(svgRef.current)
				.attr("width", "100%")
				.attr("height", "100%")
				.attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)
				.attr("preserveAspectRatio", "xMidYMid meet")
				.style("background-color", "rgba(249, 250, 251, 0.8)");
			return;
		}

		// Remember this set of steps for transition detection
		previousStepsRef.current = steps;

		// Get current step and next step (if it exists)
		const currentNode = steps[currentStep];
		const nextNode = currentStep < steps.length - 1 ? steps[currentStep + 1] : null;

		// Calculate total node count to determine diagram size
		const nodeCount = getNodeCount(currentNode);

		// Track reduced nodes for highlighting
		const reducedNodes = getReducedNodes(currentNode, nextNode);

		// Create hierarchy data
		const hierarchyData = lambdaToHierarchy(currentNode, reducedNodes);

		const svg = d3.select(svgRef.current)
			.attr("width", "100%")
			.attr("height", "100%")
			.attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)
			.attr("preserveAspectRatio", "xMidYMid meet")
			.style("background-color", "rgba(249, 250, 251, 0.8)"); // Very subtle background

		// For very large expressions, optimize rendering
		const minNodeWidth = nodeCount > 50 ? 30 : 60; // Smaller nodes for complex expressions
		const nodeSize: [number, number] = nodeCount > 50 ? [30, 50] : [50, 80]; // Smaller spacing for complex expressions

		// Add a warning for large expressions that might affect performance
		if (nodeCount > 75) {
			svg.append("text")
				.attr("x", 10)
				.attr("y", 20)
				.attr("fill", "#e63946")
				.attr("font-size", "12px")
				.attr("font-style", "italic")
				.text("Large expression - zooming and panning enabled");
		}

		// Set up width dynamically based on complexity
		const svgWidth = Math.max(dimensions.width, nodeCount * minNodeWidth);

		// Set up D3 tree layout with horizontal orientation (left to right)
		const treeLayout = d3.tree<TrompNode>()
			.size([dimensions.height - 80, svgWidth - 120])
			.nodeSize(nodeSize)
			.separation((a, b) => {
				// Keep more consistent separation between nodes
				return (a.parent === b.parent ? 1.2 : 2);
			});

		// Create root hierarchy
		const root = d3.hierarchy(hierarchyData);

		// Apply layout
		const treeData = treeLayout(root);
		treeDataRef.current = treeData; // Store for transitions

		// Create main group for diagram elements first and store reference
		const g = svg.append("g")
			.attr("transform", "translate(120, 100)"); // Fixed, simple initial positioning

		gRef.current = g.node();

		// Add zoom behavior and store reference
		const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.1, 4]) // Allow more zooming out for large diagrams
			.on("zoom", (event) => {
				g.attr("transform", event.transform);
			});

		zoomBehaviorRef.current = zoomBehavior;

		svg.call(zoomBehavior);

		// For very simple diagrams (just one node), add a special layout
		if (nodeCount === 1) {
			// Single node diagram - simple centered node
			g.append("g")
				.attr("class", "node")
				.attr("transform", `translate(0, 0)`)
				.call(el => {
					// Determine node type
					const nodeType = hierarchyData.type;
					const isHighlighted = false;

					// Base colors
					const baseColors = {
						variable: "#a8dadc",
						abstraction: "#e63946",
						application: "#457b9d"
					};

					const getColor = (type: string) => {
						return baseColors[type as keyof typeof baseColors] || "#999";
					};

					if (nodeType === "variable") {
						// Circle for variables
						el.append("circle")
							.attr("r", 25)
							.attr("fill", getColor("variable"));

						el.append("text")
							.attr("dy", 5)
							.attr("text-anchor", "middle")
							.attr("fill", "white")
							.attr("font-size", "14px")
							.text(hierarchyData.name || "");
					} else if (nodeType === "abstraction") {
						// Diamond for abstractions
						el.append("path")
							.attr("d", d3.symbol().type(d3.symbolDiamond).size(1000))
							.attr("fill", getColor("abstraction"));

						el.append("text")
							.attr("dy", 5)
							.attr("text-anchor", "middle")
							.attr("fill", "white")
							.attr("font-size", "14px")
							.text(`λ${hierarchyData.name || ""}`);
					} else if (nodeType === "application") {
						// Rectangle for applications
						el.append("rect")
							.attr("width", 50)
							.attr("height", 35)
							.attr("x", -25)
							.attr("y", -17.5)
							.attr("fill", getColor("application"));

						el.append("text")
							.attr("dy", 5)
							.attr("text-anchor", "middle")
							.attr("fill", "white")
							.attr("font-size", "14px")
							.text("@");
					}
				});
		} else {
			// Regular tree layout for multiple nodes
			// Links between nodes with smoother curves
			g.selectAll(".link")
				.data(treeData.links())
				.enter()
				.append("path")
				.attr("class", "link")
				.attr("fill", "none")
				.attr("stroke", "#999")
				.attr("stroke-width", 1.5)
				.attr("d", d3.linkHorizontal<any, any>()
					.x(d => d.y)
					.y(d => d.x));

			// Node groups
			const node = g.selectAll(".node")
				.data(treeData.descendants())
				.enter()
				.append("g")
				.attr("class", d => `node ${d.data.isReduced ? 'node-reduced' : ''}`)
				.attr("transform", d => `translate(${d.y},${d.x})`);

			// Nodes - different shapes for different node types with highlighting
			node.each(function (d) {
				const el = d3.select(this);
				const nodeType = d.data.type;
				const isHighlighted = d.data.isReduced;

				// Base colors
				const baseColors = {
					variable: "#a8dadc",
					abstraction: "#e63946",
					application: "#457b9d"
				};

				// Highlight colors (brighter versions)
				const highlightColors = {
					variable: "#64c2ff",
					abstraction: "#ff5d6a",
					application: "#5da0ff"
				};

				// Determine color based on highlight state
				const getColor = (type: string) => {
					if (isHighlighted) {
						return highlightColors[type as keyof typeof highlightColors] || "#999";
					}
					return baseColors[type as keyof typeof baseColors] || "#999";
				};

				if (nodeType === "variable") {
					// Circle for variables
					el.append("circle")
						.attr("r", 20)
						.attr("fill", getColor("variable"))
						.attr("stroke", isHighlighted ? "#fff" : "none")
						.attr("stroke-width", isHighlighted ? 2 : 0);
				} else if (nodeType === "abstraction") {
					// Diamond for abstractions
					el.append("path")
						.attr("d", d3.symbol().type(d3.symbolDiamond).size(800))
						.attr("fill", getColor("abstraction"))
						.attr("stroke", isHighlighted ? "#fff" : "none")
						.attr("stroke-width", isHighlighted ? 2 : 0);
				} else if (nodeType === "application") {
					// Rectangle for applications
					el.append("rect")
						.attr("width", 40)
						.attr("height", 30)
						.attr("x", -20)
						.attr("y", -15)
						.attr("fill", getColor("application"))
						.attr("stroke", isHighlighted ? "#fff" : "none")
						.attr("stroke-width", isHighlighted ? 2 : 0);
				}

				// Labels with better contrast
				if (nodeType === "variable") {
					el.append("text")
						.attr("dy", 5)
						.attr("text-anchor", "middle")
						.attr("fill", "white")
						.attr("font-weight", isHighlighted ? "bold" : "normal")
						.text(d.data.name || "");
				} else if (nodeType === "abstraction") {
					el.append("text")
						.attr("dy", 5)
						.attr("text-anchor", "middle")
						.attr("fill", "white")
						.attr("font-weight", isHighlighted ? "bold" : "normal")
						.text(`λ${d.data.name || ""}`);
				} else if (nodeType === "application") {
					el.append("text")
						.attr("dy", 5)
						.attr("text-anchor", "middle")
						.attr("fill", "white")
						.attr("font-weight", isHighlighted ? "bold" : "normal")
						.text("@");
				}

				// Add a subtle animation for highlighted nodes
				if (isHighlighted) {
					el.select("circle, rect, path")
						.attr("opacity", 0.8)
						.transition()
						.duration(500)
						.attr("opacity", 1)
						.attr("transform", "scale(1.1)")
						.transition()
						.duration(500)
						.attr("transform", "scale(1)")
						.on("end", function repeat() {
							d3.select(this)
								.transition()
								.duration(800)
								.attr("transform", "scale(1.1)")
								.transition()
								.duration(800)
								.attr("transform", "scale(1)")
								.on("end", repeat);
						});
				}
			});
		}

		// Add a minimap for orientation with complex diagrams
		if (nodeCount > 15) {
			const minimapSize = 120;
			const minimap = svg.append("g")
				.attr("class", "minimap")
				.attr("transform", `translate(${dimensions.width - minimapSize - 10}, 10)`);

			minimap.append("rect")
				.attr("width", minimapSize)
				.attr("height", minimapSize)
				.attr("fill", "#f8f9fa")
				.attr("stroke", "#dee2e6")
				.attr("rx", 5)
				.attr("ry", 5);

			// Create a simplified view of the tree
			const minimapTree = minimap.append("g")
				.attr("transform", `translate(${minimapSize / 2}, ${minimapSize / 2})`);

			// Simple visualization with dots for nodes
			minimapTree.selectAll(".minimap-node")
				.data(treeData.descendants())
				.enter()
				.append("circle")
				.attr("r", 2)
				.attr("cx", d => (d.y / svgWidth) * (minimapSize * 0.8) - (minimapSize * 0.4))
				.attr("cy", d => (d.x / dimensions.height) * (minimapSize * 0.8) - (minimapSize * 0.4))
				.attr("fill", d => {
					if (d.data.type === "variable") return "#a8dadc";
					if (d.data.type === "abstraction") return "#e63946";
					return "#457b9d";
				});
		}

		// Automatically fit the diagram to view after rendering
		// Use setTimeout to ensure it happens after the SVG is fully rendered
		setTimeout(() => {
			handleFitToView();
		}, 100);

	}, [steps, currentStep, dimensions, lambdaToHierarchy, getReducedNodes, getNodeCount, handleFitToView]);

	return (
		<div
			ref={containerRef}
			className="w-full h-full flex items-center justify-center overflow-hidden relative"
			style={{ height: "100%" }}
		>
			<svg
				ref={svgRef}
				className="w-full h-full"
				style={{ minHeight: "300px" }}
			></svg>

			<div className="absolute bottom-2 left-2 flex space-x-2">
				{/* Reset view button */}
				<button
					onClick={handleResetView}
					className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700 px-2 py-1 rounded-md text-xs border border-gray-200 shadow-sm flex items-center"
					title="Reset view"
				>
					<svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
					Reset
				</button>

				{/* Fit to view button */}
				<button
					onClick={handleFitToView}
					className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700 px-2 py-1 rounded-md text-xs border border-gray-200 shadow-sm flex items-center"
					title="Fit diagram to view"
				>
					<svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
					</svg>
					Fit All
				</button>

				{/* Focus on changes button */}
				<button
					onClick={handleFocusOnChanges}
					className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700 px-2 py-1 rounded-md text-xs border border-gray-200 shadow-sm flex items-center"
					title="Focus on highlighted changes"
				>
					<svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
					</svg>
					Focus Changes
				</button>
			</div>

			<div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none">
				{steps.length > 1 && "Zoom & pan to explore"}
			</div>
		</div>
	);
} 