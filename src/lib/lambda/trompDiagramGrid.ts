import { LambdaExpr } from '@/types/lambda';
import { DeBruijnTerm, toDeBruijn } from './deBruijn';

/**
 * Visual elements of a Tromp diagram
 */
export interface TrompDiagram {
	width: number;
	height: number;
	lambdas: TrompLambda[];
	variables: TrompVariable[];
	applications: TrompApplication[];
}

/**
 * Lambda abstraction in a Tromp diagram (horizontal line)
 */
export interface TrompLambda {
	id: string;
	x: number;
	y: number;
	width: number;
	index: number; // De Bruijn level
	paramName?: string;
}

/**
 * Variable in a Tromp diagram (vertical line from lambda)
 */
export interface TrompVariable {
	id: string;
	x: number;    // x-coordinate of the variable
	y: number;    // Top y-coordinate where it connects to the lambda
	height: number; // Height of the vertical line
	lambdaId: string; // ID of the binding lambda
	index: number;  // De Bruijn index
	name?: string;  // Variable name (if showing names)
	appLevel?: number; // Application level where this variable is used
}

/**
 * Application in a Tromp diagram (horizontal connection between variables)
 */
export interface TrompApplication {
	id: string;
	x1: number;  // Start x-coordinate
	x2: number;  // End x-coordinate
	y: number;   // y-coordinate of the horizontal line
	leftVarId: string;  // Left variable ID
	rightVarId: string; // Right variable ID
	level: number;      // Application nesting level
}

/**
 * Options for the Tromp diagram
 */
export interface TrompDiagramOptions {
	showVariableNames: boolean;
	gridSize: number;
	padding: number;
	useColors?: boolean;  // Whether to use colors for different parts
}

/**
 * Context for term analysis
 */
interface TermContext {
	depth: number;      // Current lambda nesting depth
	varMap: Map<number, string>; // Map from de Bruijn indices to var names
	lambdaIds: string[]; // IDs of lambdas in scope
	lambdaY: number[];  // Y-coordinates of lambdas in scope
	gridSize: number;   // Size of grid units
	padding: number;    // Padding around diagram
	nextId: number;     // Counter for generating IDs
	appLevel: number;   // Current application nesting level
}

/**
 * Result of analyzing a term
 */
interface TermResult {
	width: number;      // Width used by the term
	variableIds: string[]; // IDs of variables in this term
	variableX: number[];  // X-coordinates of variables
	level: number;      // Nesting level of the term
	yOffset: number;    // Y-offset for this term
}

/**
 * Tromp diagram generator
 */
export class TrompDiagramGenerator {
	/**
	 * Generate a Tromp diagram from a lambda expression
	 */
	generateDiagram(
		expr: LambdaExpr,
		options: TrompDiagramOptions = {
			showVariableNames: true,
			gridSize: 30,
			padding: 30,
			useColors: false
		}
	): TrompDiagram {
		// Convert to de Bruijn indices
		const deBruijnTerm = toDeBruijn(expr);

		// Create storage for diagram elements
		const lambdas: TrompLambda[] = [];
		const variables: TrompVariable[] = [];
		const applications: TrompApplication[] = [];

		// Initialize context
		const context: TermContext = {
			depth: 0,
			varMap: new Map(),
			lambdaIds: [],
			lambdaY: [],
			gridSize: options.gridSize,
			padding: options.padding,
			nextId: 0,
			appLevel: 0
		};

		// Set up variable names if showing them
		if (options.showVariableNames && expr.type === 'abstraction') {
			this.setupVariableNames(expr, context.varMap);
		}

		// Analyze the term and generate the diagram
		const result = this.analyzeTerm(
			deBruijnTerm,
			0,
			0,
			context,
			lambdas,
			variables,
			applications,
			options
		);

		// Calculate overall dimensions
		const width = result.width * options.gridSize + options.padding * 2;

		// Find the maximum y-coordinate across all elements
		const maxLambdaY = Math.max(...lambdas.map(l => l.y));
		const maxAppY = applications.length > 0
			? Math.max(...applications.map(a => a.y))
			: 0;
		const maxVarBottom = variables.length > 0
			? Math.max(...variables.map(v => v.y + v.height))
			: 0;

		const height = Math.max(
			maxLambdaY + options.gridSize,
			maxAppY + options.gridSize,
			maxVarBottom + options.padding
		);

		// Apply final adjustments to vertical lines for variables used in applications
		this.extendVariablesToApplications(variables, applications);

		return {
			width,
			height,
			lambdas,
			variables,
			applications
		};
	}

	/**
	 * Extend variable lines to ensure they reach their application connections
	 */
	private extendVariablesToApplications(
		variables: TrompVariable[],
		applications: TrompApplication[]
	): void {
		// For each application, ensure connected variables extend to that level
		for (const app of applications) {
			const leftVar = variables.find(v => v.id === app.leftVarId);
			const rightVar = variables.find(v => v.id === app.rightVarId);

			if (leftVar) {
				const requiredHeight = app.y - leftVar.y;
				if (requiredHeight > leftVar.height) {
					leftVar.height = requiredHeight;
				}
			}

			if (rightVar) {
				const requiredHeight = app.y - rightVar.y;
				if (requiredHeight > rightVar.height) {
					rightVar.height = requiredHeight;
				}
			}
		}
	}

	/**
	 * Set up variable names from the original expression
	 */
	private setupVariableNames(expr: LambdaExpr, varMap: Map<number, string>, depth: number = 0): void {
		if (expr.type === 'abstraction') {
			varMap.set(depth, expr.param);
			this.setupVariableNames(expr.body, varMap, depth + 1);
		} else if (expr.type === 'application') {
			this.setupVariableNames(expr.left, varMap, depth);
			this.setupVariableNames(expr.right, varMap, depth);
		}
	}

	/**
	 * Analyze a term and generate diagram elements
	 */
	private analyzeTerm(
		term: DeBruijnTerm,
		x: number,
		y: number,
		context: TermContext,
		lambdas: TrompLambda[],
		variables: TrompVariable[],
		applications: TrompApplication[],
		options: TrompDiagramOptions
	): TermResult {
		// Increment the available ID
		const nextId = () => `id_${context.nextId++}`;

		switch (term.type) {
			case 'var': {
				if (term.index === undefined) {
					throw new Error('Variable missing index');
				}

				// Create variable element
				const varId = nextId();
				const lambdaIndex = term.index;

				// Check if this is a bound variable
				if (lambdaIndex >= 0 && lambdaIndex < context.lambdaIds.length) {
					const lambdaId = context.lambdaIds[lambdaIndex];
					const bindingY = context.lambdaY[lambdaIndex];
					const varX = x * context.gridSize + context.padding;
					const varY = bindingY;

					// Calculate height based on application level for better Church numeral visualization
					// Make deeper applications have proportionally longer lines
					const heightMultiplier = context.appLevel > 0 ? (context.appLevel * 0.5) + 1 : 1;
					const initialHeight = Math.max(
						y * context.gridSize - bindingY + context.padding,
						context.gridSize * heightMultiplier // Ensure variables in applications have taller lines
					);

					// Add application level to track where this variable is used
					variables.push({
						id: varId,
						x: varX,
						y: varY,
						height: initialHeight,
						lambdaId,
						index: lambdaIndex,
						name: options.showVariableNames ? context.varMap.get(lambdaIndex) : undefined,
						appLevel: context.appLevel
					});
				} else {
					// Free variable - connect to top of diagram
					const varX = x * context.gridSize + context.padding;
					variables.push({
						id: varId,
						x: varX,
						y: context.padding,
						height: y * context.gridSize + context.padding,
						lambdaId: 'free',
						index: lambdaIndex,
						name: options.showVariableNames ? `free_${lambdaIndex}` : undefined,
						appLevel: context.appLevel
					});
				}

				return {
					width: 1,
					variableIds: [varId],
					variableX: [x],
					level: context.appLevel,
					yOffset: 0
				};
			}

			case 'lam': {
				if (!term.body) {
					throw new Error('Lambda term missing body');
				}

				// Increase depth for lambda
				context.depth = Math.max(context.depth, y + 1);

				// Create lambda abstraction element
				const lambdaId = nextId();
				const lambdaY = y * context.gridSize + context.padding;

				// Add lambda to context
				context.lambdaIds.unshift(lambdaId);
				context.lambdaY.unshift(lambdaY);

				// Process the body with updated context
				const bodyResult = this.analyzeTerm(
					term.body,
					x,
					y + 1,
					context,
					lambdas,
					variables,
					applications,
					options
				);

				// Remove lambda from context after processing body
				context.lambdaIds.shift();
				context.lambdaY.shift();

				// Create lambda element
				lambdas.push({
					id: lambdaId,
					x: context.padding,
					y: lambdaY,
					width: bodyResult.width * context.gridSize,
					index: y,
					paramName: options.showVariableNames ? context.varMap.get(y) : undefined
				});

				return {
					...bodyResult,
					level: 0, // Reset level at lambda abstraction
					yOffset: 0
				};
			}

			case 'app': {
				if (!term.left || !term.right) {
					throw new Error('Application missing left or right term');
				}

				// Increment application level for nested applications
				context.appLevel += 1;
				const currentAppLevel = context.appLevel;

				// Improve vertical staggering for Church numerals
				// Use a larger stagger amount for better visualization of nested applications
				const staggerAmount = Math.min(currentAppLevel * 0.5 + 0.5, 2.0); // Cap the stagger multiplier
				const staggerY = staggerAmount * options.gridSize;

				// Process the left term
				const leftResult = this.analyzeTerm(
					term.left,
					x,
					y,
					context,
					lambdas,
					variables,
					applications,
					options
				);

				// Process the right term to the right of the left term with improved staggering
				// For Church numerals, use progressive X and Y offsets
				const rightY = y + staggerAmount;
				const rightResult = this.analyzeTerm(
					term.right,
					x + leftResult.width,
					rightY,
					context,
					lambdas,
					variables,
					applications,
					options
				);

				// Create application connections with enhanced positioning
				this.createApplicationConnections(
					leftResult,
					rightResult,
					y,
					currentAppLevel,
					staggerY,
					context,
					variables,
					applications
				);

				// Decrement application level after processing both sides
				context.appLevel -= 1;

				// Return combined results
				return {
					width: leftResult.width + rightResult.width,
					variableIds: [...leftResult.variableIds, ...rightResult.variableIds],
					variableX: [...leftResult.variableX, ...rightResult.variableX.map(x => x)],
					level: context.appLevel,
					yOffset: staggerY
				};
			}

			default:
				throw new Error(`Unknown term type: ${(term as any).type}`);
		}
	}

	/**
	 * Create application connections between variables
	 */
	private createApplicationConnections(
		leftResult: TermResult,
		rightResult: TermResult,
		y: number,
		level: number,
		staggerY: number,
		context: TermContext,
		variables: TrompVariable[],
		applications: TrompApplication[]
	): void {
		if (leftResult.variableIds.length === 0 || rightResult.variableIds.length === 0) {
			return;
		}

		// Calculate the application Y position with clearer staggering for Church numerals
		const baseY = y * context.gridSize + context.padding;

		// Enhance the staggering - higher levels get more vertical space
		// This creates a visually distinct "stair step" pattern for Church numerals
		const staggerMultiplier = 1 + (level * 0.2);
		const appY = baseY + staggerY * staggerMultiplier;

		// Find the leftmost variables on each side
		const leftVar = variables.find(v => v.id === leftResult.variableIds[0]);
		const rightVar = variables.find(v => v.id === rightResult.variableIds[0]);

		if (leftVar && rightVar) {
			applications.push({
				id: `app_${context.nextId++}`,
				x1: leftVar.x,
				x2: rightVar.x,
				y: appY,
				leftVarId: leftVar.id,
				rightVarId: rightVar.id,
				level
			});

			// Mark variables with their application level
			leftVar.appLevel = level;
			rightVar.appLevel = level;

			// For Church numerals, adjust variable heights based on their application level
			// This ensures that the leftmost variables (in deeper applications) have longer lines
			if (leftVar.height < (appY - leftVar.y + context.gridSize * 0.5)) {
				leftVar.height = appY - leftVar.y + context.gridSize * 0.5;
			}

			if (rightVar.height < (appY - rightVar.y + context.gridSize * 0.25)) {
				rightVar.height = appY - rightVar.y + context.gridSize * 0.25;
			}
		}
	}
}

// Export singleton instance
export const trompDiagramGenerator = new TrompDiagramGenerator();