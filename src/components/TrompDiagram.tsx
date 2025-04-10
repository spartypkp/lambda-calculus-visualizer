"use client";

import { LambdaNode } from "@/lib/lambdaCalculus";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

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
}

export default function TrompDiagram({ steps, currentStep }: TrompDiagramProps) {
	const svgRef = useRef<SVGSVGElement>(null);
	const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

	// Convert a lambda calculus node to a hierarchy for D3
	const lambdaToHierarchy = (node: LambdaNode, id = "root"): TrompNode => {
		switch (node.type) {
			case "variable":
				return {
					id,
					type: "variable",
					name: node.name,
					children: [],
				};
			case "abstraction":
				return {
					id,
					type: "abstraction",
					name: node.param,
					children: [lambdaToHierarchy(node.body, `${id}-body`)],
				};
			case "application":
				return {
					id,
					type: "application",
					children: [
						lambdaToHierarchy(node.func, `${id}-func`),
						lambdaToHierarchy(node.arg, `${id}-arg`),
					],
				};
			default:
				return { id, type: "unknown", children: [] };
		}
	};

	useEffect(() => {
		if (!svgRef.current || !steps.length) return;

		// Get current step
		const currentNode = steps[currentStep] || steps[0];

		// Create hierarchy data
		const hierarchyData = lambdaToHierarchy(currentNode);

		// Clear previous diagram
		d3.select(svgRef.current).selectAll("*").remove();

		// Set up D3 tree layout
		const treeLayout = d3.tree<TrompNode>().size([dimensions.width - 100, dimensions.height - 100]);

		// Create root hierarchy
		const root = d3.hierarchy(hierarchyData);

		// Apply layout
		const treeData = treeLayout(root);

		// Create SVG group
		const svg = d3.select(svgRef.current);
		const g = svg.append("g").attr("transform", "translate(50, 50)");

		// Links between nodes
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
			.attr("class", "node")
			.attr("transform", d => `translate(${d.y},${d.x})`);

		// Nodes - different shapes for different node types
		node.each(function (d) {
			const el = d3.select(this);
			const nodeType = d.data.type;

			if (nodeType === "variable") {
				// Circle for variables
				el.append("circle")
					.attr("r", 20)
					.attr("fill", "#a8dadc");
			} else if (nodeType === "abstraction") {
				// Diamond for abstractions
				el.append("path")
					.attr("d", d3.symbol().type(d3.symbolDiamond).size(800))
					.attr("fill", "#e63946");
			} else if (nodeType === "application") {
				// Rectangle for applications
				el.append("rect")
					.attr("width", 40)
					.attr("height", 30)
					.attr("x", -20)
					.attr("y", -15)
					.attr("fill", "#457b9d");
			}

			// Labels
			if (nodeType === "variable") {
				el.append("text")
					.attr("dy", 5)
					.attr("text-anchor", "middle")
					.attr("fill", "white")
					.text(d.data.name || "");
			} else if (nodeType === "abstraction") {
				el.append("text")
					.attr("dy", 5)
					.attr("text-anchor", "middle")
					.attr("fill", "white")
					.text(`λ${d.data.name || ""}`);
			} else if (nodeType === "application") {
				el.append("text")
					.attr("dy", 5)
					.attr("text-anchor", "middle")
					.attr("fill", "white")
					.text("@");
			}
		});

	}, [steps, currentStep, dimensions]);

	return (
		<div className="bg-white p-4 rounded-lg shadow-md w-full">
			<svg
				ref={svgRef}
				width={dimensions.width}
				height={dimensions.height}
				className="mx-auto"
			/>
		</div>
	);
} 