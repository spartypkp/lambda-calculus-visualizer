import { LambdaExpr } from '@/types/lambda';
import { DeBruijnTerm, toDeBruijn } from './deBruijn';

/**
 * Node in a grid-based Tromp diagram
 */
export interface GridNode {
  id: string;
  type: 'abstraction' | 'variable' | 'application';
  x: number;
  y: number;
  width: number;
  height: number;
  binderIndex?: number;  // For variable nodes
  varName?: string;      // For variable nodes
}

/**
 * Link in a grid-based Tromp diagram
 */
export interface GridLink {
  id: string;
  type: 'abstraction' | 'variable' | 'application';
  points: { x: number, y: number }[];
}

/**
 * Complete grid-based Tromp diagram
 */
export interface TrompGrid {
  nodes: GridNode[];
  links: GridLink[];
  width: number;
  height: number;
}

/**
 * Options for customizing the Tromp diagram visualization
 */
export interface TrompDiagramOptions {
  style: 'classic' | 'minimal' | 'colored';
  showVariableNames: boolean;
  showNodeLabels: boolean;
}

/**
 * Generator for grid-based Tromp diagrams from lambda expressions
 */
export class GridTrompGenerator {
  private nodeCounter = 0;
  private linkCounter = 0;
  private gridSize = 35;  // Adjusted base unit for the grid for better spacing
  
  /**
   * Generate a grid-based Tromp diagram from a lambda expression
   */
  generateGrid(
    expr: LambdaExpr, 
    options: TrompDiagramOptions = {
      style: 'classic',
      showVariableNames: true,
      showNodeLabels: true
    }
  ): TrompGrid {
    this.nodeCounter = 0;
    this.linkCounter = 0;
    
    // Convert to de Bruijn representation for easier visualization
    const deBruijnTerm = toDeBruijn(expr);
    
    const nodes: GridNode[] = [];
    const links: GridLink[] = [];
    
    // Calculate term dimensions first
    const { width, height } = this.calculateDimensions(deBruijnTerm);
    
    // Generate the visual elements
    this.generateVisual(deBruijnTerm, 0, 0, [], nodes, links, expr, options);
    
    return {
      nodes,
      links,
      // Swap width and height in the final dimensions
      height: width * this.gridSize + this.gridSize * 4,
      width: height * this.gridSize + this.gridSize * 4
    };
  }
  
  /**
   * Calculate the dimensions of a term in grid units
   */
  private calculateDimensions(term: DeBruijnTerm): { width: number, height: number } {
    switch (term.type) {
      case 'var':
        return { width: 0, height: 1 }; // Flipped width and height
        
      case 'lam': {
        if (!term.body) throw new Error('Lambda term missing body');
        const bodyDims = this.calculateDimensions(term.body);
        return { width: bodyDims.width + 1, height: bodyDims.height }; // Flipped width and height
      }
        
      case 'app': {
        if (!term.left || !term.right) throw new Error('Application missing terms');
        const leftDims = this.calculateDimensions(term.left);
        const rightDims = this.calculateDimensions(term.right);
        return {
          width: Math.max(leftDims.width, rightDims.width) + 1, // Flipped width and height
          height: leftDims.height + rightDims.height
        };
      }
    }
  }
  
  /**
   * Generate the visual elements of the diagram
   */
  private generateVisual(
    term: DeBruijnTerm, 
    x: number, 
    y: number, 
    binders: number[], 
    nodes: GridNode[], 
    links: GridLink[],
    originalExpr: LambdaExpr,
    options: TrompDiagramOptions
  ): { width: number, lastNodeId: string } {
    switch (term.type) {
      case 'var': {
        if (term.index === undefined) throw new Error('Variable missing index');
        
        const nodeId = `node_${this.nodeCounter++}`;
        // Flip coordinates - y becomes x, x becomes y
        const varX = y * this.gridSize;
        const varY = x * this.gridSize;
        
        // Find the original variable name if possible
        let varName: string | undefined;
        if (options.showVariableNames) {
          // This is a simplification - in a real implementation we would need to
          // track the mapping between de Bruijn indices and original variable names
          varName = term.index < binders.length ? `x${term.index}` : 'free';
        }
        
        // Add variable node
        nodes.push({
          id: nodeId,
          type: 'variable',
          x: varX,
          y: varY,
          width: this.gridSize,
          height: this.gridSize,
          binderIndex: term.index < binders.length ? binders[term.index] : undefined,
          varName: options.showVariableNames ? varName : undefined
        });
        
        // If this variable has a binder, add a link to it
        if (term.index < binders.length) {
          const binderId = binders[term.index];
          links.push({
            id: `link_${this.linkCounter++}`,
            type: 'variable',
            points: [
              { x: varX, y: varY + this.gridSize / 2 }, // Start at the variable node
              { x: binderId * this.gridSize, y: varY + this.gridSize / 2 } // Connect to the binder horizontally
            ]
          });
        }
        
        return { width: 1, lastNodeId: nodeId };
      }
        
      case 'lam': {
        if (!term.body) throw new Error('Lambda term missing body');
        
        const nodeId = `node_${this.nodeCounter++}`;
        // Flip coordinates - y becomes x, x becomes y
        const lamX = y * this.gridSize;
        const lamY = x * this.gridSize;
        
        // Add this binder to the context
        const newBinders = [y, ...binders];
        
        // Add abstraction node
        nodes.push({
          id: nodeId,
          type: 'abstraction',
          x: lamX,
          y: lamY,
          width: this.gridSize,
          height: this.gridSize
        });
        
        // Process the body
        const { width: bodyWidth } = this.generateVisual(
          term.body, 
          x, 
          y + 1, 
          newBinders, 
          nodes, 
          links,
          originalExpr,
          options
        );
        
        // Add vertical line for the abstraction (was horizontal)
        // The line should start at the abstraction node and extend downward to cover the body height
        links.push({
          id: `link_${this.linkCounter++}`,
          type: 'abstraction',
          points: [
            { x: lamX, y: lamY }, // Start at the abstraction node
            { x: lamX, y: lamY + bodyWidth * this.gridSize } // Extend downward to cover the body height
          ]
        });
        
        return { width: bodyWidth, lastNodeId: nodeId };
      }
        
      case 'app': {
        if (!term.left || !term.right) throw new Error('Application missing terms');
        
        // Flip coordinates - y becomes x, x becomes y
        const appX = y * this.gridSize;
        const appY = x * this.gridSize;
        
        // Calculate dimensions for left and right terms to determine their widths
        const leftDims = this.calculateDimensions(term.left);
        const rightDims = this.calculateDimensions(term.right);
        
        // Process right term first (reversed order)
        const { width: rightWidth, lastNodeId: rightId } = this.generateVisual(
          term.right, 
          x + leftDims.width, // Position based on left term's width
          y + 1, 
          binders, 
          nodes, 
          links,
          originalExpr,
          options
        );
        
        // Process left term second, but position it on the left
        const { width: leftWidth, lastNodeId: leftId } = this.generateVisual(
          term.left, 
          x, 
          y + 1, 
          binders, 
          nodes, 
          links,
          originalExpr,
          options
        );
        
        // Add application link (connect the terms) - vertical connection
        links.push({
          id: `link_${this.linkCounter++}`,
          type: 'application',
          points: [
            { x: appX + this.gridSize / 2, y: appY + this.gridSize / 2 },
            { x: appX + this.gridSize / 2, y: appY + leftWidth * this.gridSize + this.gridSize / 2 }
          ]
        });
        
        return { width: leftWidth + rightWidth, lastNodeId: leftId };
      }
    }
  }
}

// Export a singleton instance for convenience
export const gridTrompGenerator = new GridTrompGenerator();