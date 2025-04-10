import { LambdaExpr } from '@/types/lambda';

// Types for Tromp diagram nodes and links
export interface TrompNode {
  id: string;
  type: 'abstraction' | 'variable' | 'application';
  x: number;
  y: number;
  width?: number;
  height?: number;
  param?: string;  // For abstraction nodes
  varName?: string; // For variable nodes
  binderId?: string; // For variable nodes, references the abstraction that binds it
  depth?: number;  // Nesting depth
}

export interface TrompLink {
  id: string;
  type: 'abstraction' | 'variable' | 'application';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface TrompDiagram {
  nodes: TrompNode[];
  links: TrompLink[];
  width: number;
  height: number;
  alternativeStyle?: boolean;
}

/**
 * Generator for Tromp diagrams from lambda expressions
 */
export class TrompDiagramGenerator {
  private nodeCounter = 0;
  private linkCounter = 0;
  private nodes: TrompNode[] = [];
  private links: TrompLink[] = [];
  private variableBindings: Map<string, string> = new Map();
  private variablePositions: Map<string, { x: number, y: number }> = new Map();
  private maxDepth = 0;
  private gridSize = 35;
  private horizontalSpacing = 5.5 * this.gridSize;
  private verticalSpacing = 3.5 * this.gridSize;
  private alternativeStyle = false;

  /**
   * Generate a Tromp diagram from a lambda expression
   */
  generateDiagram(expr: LambdaExpr, alternativeStyle = false): TrompDiagram {
    this.nodeCounter = 0;
    this.linkCounter = 0;
    this.nodes = [];
    this.links = [];
    this.variableBindings = new Map();
    this.variablePositions = new Map();
    this.maxDepth = 0;
    this.alternativeStyle = alternativeStyle;
    
    // First pass: analyze the expression to determine structure
    this.analyzeExpression(expr, 0, 0);
    
    // Second pass: generate the diagram
    this.generateNodes(expr, 0, 0);
    
    // Calculate diagram dimensions
    const width = this.calculateWidth();
    const height = this.calculateHeight();
    
    return {
      nodes: this.nodes,
      links: this.links,
      width,
      height,
      alternativeStyle
    };
  }

  private analyzeExpression(expr: LambdaExpr, depth: number, varIndex: number): { varCount: number, maxDepth: number } {
    this.maxDepth = Math.max(this.maxDepth, depth);
    
    switch (expr.type) {
      case 'variable': {
        return { varCount: 1, maxDepth: depth };
      }
      
      case 'abstraction': {
        const bodyAnalysis = this.analyzeExpression(expr.body, depth + 1, varIndex);
        return { varCount: bodyAnalysis.varCount, maxDepth: bodyAnalysis.maxDepth };
      }
      
      case 'application': {
        const leftAnalysis = this.analyzeExpression(expr.left, depth + 1, varIndex);
        const rightAnalysis = this.analyzeExpression(expr.right, depth + 1, varIndex + leftAnalysis.varCount);
        return { 
          varCount: leftAnalysis.varCount + rightAnalysis.varCount, 
          maxDepth: Math.max(leftAnalysis.maxDepth, rightAnalysis.maxDepth) 
        };
      }
    }
  }

  private generateNodes(expr: LambdaExpr, depth: number, xOffset: number): { width: number, lastVarX: number } {
    switch (expr.type) {
      case 'variable': {
        const nodeId = `node_${this.nodeCounter++}`;
        const x = xOffset;
        const y = depth * this.verticalSpacing;
        
        // Add variable node
        this.nodes.push({
          id: nodeId,
          type: 'variable',
          x,
          y,
          varName: expr.name,
          binderId: this.variableBindings.get(expr.name),
          depth
        });
        
        // If this variable is bound, add a vertical line from the variable to its binder
        const binderId = this.variableBindings.get(expr.name);
        if (binderId) {
          const binderNode = this.nodes.find(n => n.id === binderId);
          if (binderNode) {
            this.links.push({
              id: `link_${this.linkCounter++}`,
              type: 'variable',
              x1: x,
              y1: binderNode.y,
              x2: x,
              y2: y
            });
          }
        }
        
        // Store variable position for later use
        this.variablePositions.set(nodeId, { x, y });
        
        return { width: this.horizontalSpacing, lastVarX: x };
      }
      
      case 'abstraction': {
        const nodeId = `node_${this.nodeCounter++}`;
        const x = xOffset;
        const y = depth * this.verticalSpacing;
        
        // Save the current binding for this parameter (if any)
        const oldBinding = this.variableBindings.get(expr.param);
        
        // Set this abstraction as the binder for the parameter
        this.variableBindings.set(expr.param, nodeId);
        
        // Add abstraction node (horizontal line)
        this.nodes.push({
          id: nodeId,
          type: 'abstraction',
          x,
          y,
          param: expr.param,
          depth
        });
        
        // Process the body
        const bodyResult = this.generateNodes(expr.body, depth + 1, xOffset);
        
        // Add horizontal line for the abstraction
        this.links.push({
          id: `link_${this.linkCounter++}`,
          type: 'abstraction',
          x1: x,
          y1: y,
          x2: x + bodyResult.width,
          y2: y
        });
        
        // Restore the old binding (or remove if there wasn't one)
        if (oldBinding) {
          this.variableBindings.set(expr.param, oldBinding);
        } else {
          this.variableBindings.delete(expr.param);
        }
        
        return { width: bodyResult.width, lastVarX: bodyResult.lastVarX };
      }
      
      case 'application': {
        const leftResult = this.generateNodes(expr.left, depth, xOffset);
        const rightResult = this.generateNodes(expr.right, depth, xOffset + leftResult.width);
        
        // Add application link (horizontal connection between variables)
        if (this.alternativeStyle) {
          // In alternative style, connect the nearest deepest variables
          this.links.push({
            id: `link_${this.linkCounter++}`,
            type: 'application',
            x1: leftResult.lastVarX,
            y1: depth * this.verticalSpacing + this.gridSize * 0.8,
            x2: xOffset + leftResult.width,
            y2: depth * this.verticalSpacing + this.gridSize * 0.8
          });
        } else {
          // In standard style, connect the leftmost variables
          this.links.push({
            id: `link_${this.linkCounter++}`,
            type: 'application',
            x1: xOffset,
            y1: depth * this.verticalSpacing + this.gridSize * 0.8,
            x2: xOffset + leftResult.width,
            y2: depth * this.verticalSpacing + this.gridSize * 0.8
          });
        }
        
        return { width: leftResult.width + rightResult.width, lastVarX: rightResult.lastVarX };
      }
    }
  }

  private calculateWidth(): number {
    if (this.nodes.length === 0) return 0;
    
    // Find the rightmost point in the diagram
    const maxX = Math.max(...this.nodes.map(n => n.x));
    const maxWidth = Math.max(...this.links.filter(l => l.type === 'abstraction').map(l => l.x2));
    
    return Math.max(maxX, maxWidth) + this.gridSize * 3;
  }

  private calculateHeight(): number {
    return (this.maxDepth + 1) * this.verticalSpacing + this.gridSize * 3;
  }
}

// Export a singleton instance for convenience
export const trompDiagramGenerator = new TrompDiagramGenerator();