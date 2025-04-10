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

	// Use resize observer hook to make diagram responsive
	const dimensions = useResizeObserver(containerRef);

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

	useEffect(() => {
		if (!svgRef.current || !steps.length || !dimensions) return;

		// Get current step and next step (if it exists)
		const currentNode = steps[currentStep];
		const nextNode = currentStep < steps.length - 1 ? steps[currentStep + 1] : null;

		// Track reduced nodes for highlighting
		const reducedNodes = getReducedNodes(currentNode, nextNode);

		// Create hierarchy data
		const hierarchyData = lambdaToHierarchy(currentNode, reducedNodes);

		// Clear previous diagram
		d3.select(svgRef.current).selectAll("*").remove();

		// Calculate total node count to determine diagram size
		const nodeCount = getNodeCount(currentNode);
		const minNodeWidth = 50; // Smaller minimum space per node

		// Set up width dynamically based on complexity
		const svgWidth = Math.max(dimensions.width, nodeCount * minNodeWidth);

		// Set up D3 tree layout with horizontal orientation (left to right)
		const treeLayout = d3.tree<TrompNode>()
			.size([dimensions.height - 40, svgWidth - 100])
			.nodeSize([40, 60]); // Reduce node spacing for better utilization

		// Create root hierarchy
		const root = d3.hierarchy(hierarchyData);

		// Apply layout
		const treeData = treeLayout(root);

		// Create SVG group with zoom support
		const svg = d3.select(svgRef.current)
			.attr("width", "100%")
			.attr("height", "100%")
			.attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)
			.attr("preserveAspectRatio", "xMidYMid meet");

		// Add zoom behavior
		const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.5, 3])
			.on("zoom", (event) => {
				g.attr("transform", event.transform);
			});

		svg.call(zoomBehavior);

		// Create main group with initial transform to center the diagram
		const g = svg.append("g")
			.attr("transform", `translate(60, ${dimensions.height / 2})`);

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

	}, [steps, currentStep, dimensions, lambdaToHierarchy, getReducedNodes, getNodeCount]);

	return (
		<div
			ref={containerRef}
			className="w-full h-full flex items-center justify-center overflow-hidden"
			style={{ height: "100%" }}
		>
			<svg
				ref={svgRef}
				className="w-full h-full"
				style={{ minHeight: "300px" }}
			></svg>
		</div>
	);
} 