# Lambda Calculus Visualizer Refactor Plan

This document provides detailed instructions for refactoring the Lambda Calculus Visualizer to incorporate the Tromp diagram visualization approach from the Haskell implementation.

## Overview

The goal is to enhance our existing TypeScript/NextJS application with the visualization techniques found in the Haskell lambda-diagrams project, while maintaining our current architecture and user experience. The Haskell implementation offers a more structured and precise approach to visualizing lambda expressions using Tromp diagrams.

## Core Changes

### 1. Term Representation

We'll maintain our existing named variable approach (`Variable`, `Abstraction`, `Application`), but add an optional conversion layer to de Bruijn indices for visualization purposes.

**Tasks:**

1. Create a new file `src/lib/lambda/deBruijn.ts`:
   ```typescript
   // Convert between named variables and de Bruijn indices
   export interface DeBruijnTerm {
     type: 'var' | 'lam' | 'app';
     index?: number;         // For var
     body?: DeBruijnTerm;    // For lam
     left?: DeBruijnTerm;    // For app
     right?: DeBruijnTerm;   // For app
   }

   // Convert LambdaExpr to DeBruijnTerm
   export function toDeBruijn(expr: LambdaExpr): DeBruijnTerm {
     return toDeBruijnWithContext(expr, []);
   }

   function toDeBruijnWithContext(expr: LambdaExpr, context: string[]): DeBruijnTerm {
     switch (expr.type) {
       case 'variable': {
         const index = context.indexOf(expr.name);
         if (index === -1) {
           throw new Error(`Free variable: ${expr.name}`);
         }
         return { type: 'var', index };
       }
       case 'abstraction': {
         const newContext = [expr.param, ...context];
         return {
           type: 'lam',
           body: toDeBruijnWithContext(expr.body, newContext)
         };
       }
       case 'application': {
         return {
           type: 'app',
           left: toDeBruijnWithContext(expr.left, context),
           right: toDeBruijnWithContext(expr.right, context)
         };
       }
     }
   }

   // Convert DeBruijnTerm back to LambdaExpr
   export function fromDeBruijn(term: DeBruijnTerm): LambdaExpr {
     return fromDeBruijnWithContext(term, []);
   }

   function fromDeBruijnWithContext(term: DeBruijnTerm, context: string[]): LambdaExpr {
     switch (term.type) {
       case 'var': {
         if (term.index === undefined || term.index >= context.length) {
           throw new Error(`Invalid de Bruijn index: ${term.index}`);
         }
         return createVariable(context[term.index]);
       }
       case 'lam': {
         if (!term.body) {
           throw new Error('Lambda term missing body');
         }
         const paramName = generateFreshName(context);
         const newContext = [paramName, ...context];
         return createAbstraction(
           paramName,
           fromDeBruijnWithContext(term.body, newContext)
         );
       }
       case 'app': {
         if (!term.left || !term.right) {
           throw new Error('Application missing left or right term');
         }
         return createApplication(
           fromDeBruijnWithContext(term.left, context),
           fromDeBruijnWithContext(term.right, context)
         );
       }
     }
   }

   function generateFreshName(context: string[]): string {
     const vars = ['x', 'y', 'z', 'a', 'b', 'c', 'm', 'n'];
     for (const v of vars) {
       if (!context.includes(v)) return v;
     }
     let i = 0;
     while (context.includes(`x${i}`)) i++;
     return `x${i}`;
   }
   ```

### 2. Visualization Core

Replace the current force-directed D3 approach with a grid-based layout inspired by the Haskell implementation.

**Tasks:**

1. Create a new file `src/lib/lambda/trompDiagramGrid.ts`:
   ```typescript
   import { LambdaExpr } from '@/types/lambda';
   import { DeBruijnTerm, toDeBruijn } from './deBruijn';

   export interface GridNode {
     id: string;
     type: 'abstraction' | 'variable' | 'application';
     x: number;
     y: number;
     width: number;
     height: number;
     binderIndex?: number;  // For variable nodes
   }

   export interface GridLink {
     id: string;
     type: 'abstraction' | 'variable' | 'application';
     points: { x: number, y: number }[];
   }

   export interface TrompGrid {
     nodes: GridNode[];
     links: GridLink[];
     width: number;
     height: number;
   }

   export class GridTrompGenerator {
     private nodeCounter = 0;
     private linkCounter = 0;
     private gridSize = 30;  // Base unit for the grid
     
     // Main public method to generate a grid-based Tromp diagram
     generateGrid(expr: LambdaExpr): TrompGrid {
       this.nodeCounter = 0;
       this.linkCounter = 0;
       
       // Convert to de Bruijn representation for easier visualization
       const deBruijnTerm = toDeBruijn(expr);
       
       const nodes: GridNode[] = [];
       const links: GridLink[] = [];
       
       // Calculate term dimensions first
       const { width, height } = this.calculateDimensions(deBruijnTerm);
       
       // Generate the visual elements
       this.generateVisual(deBruijnTerm, 0, 0, [], nodes, links);
       
       return {
         nodes,
         links,
         width: width * this.gridSize + this.gridSize * 4,
         height: height * this.gridSize + this.gridSize * 4
       };
     }
     
     private calculateDimensions(term: DeBruijnTerm): { width: number, height: number } {
       switch (term.type) {
         case 'var':
           return { width: 1, height: 0 };
           
         case 'lam': {
           if (!term.body) throw new Error('Lambda term missing body');
           const bodyDims = this.calculateDimensions(term.body);
           return { width: bodyDims.width, height: bodyDims.height + 1 };
         }
           
         case 'app': {
           if (!term.left || !term.right) throw new Error('Application missing terms');
           const leftDims = this.calculateDimensions(term.left);
           const rightDims = this.calculateDimensions(term.right);
           return {
             width: leftDims.width + rightDims.width,
             height: Math.max(leftDims.height, rightDims.height) + 1
           };
         }
       }
     }
     
     private generateVisual(
       term: DeBruijnTerm, 
       x: number, 
       y: number, 
       binders: number[], 
       nodes: GridNode[], 
       links: GridLink[]
     ): { width: number, lastNodeId: string } {
       switch (term.type) {
         case 'var': {
           if (term.index === undefined) throw new Error('Variable missing index');
           
           const nodeId = `node_${this.nodeCounter++}`;
           const varX = x * this.gridSize;
           const varY = y * this.gridSize;
           
           // Add variable node
           nodes.push({
             id: nodeId,
             type: 'variable',
             x: varX,
             y: varY,
             width: this.gridSize,
             height: this.gridSize,
             binderIndex: term.index < binders.length ? binders[term.index] : undefined
           });
           
           // If this variable has a binder, add a link to it
           if (term.index < binders.length) {
             const binderId = binders[term.index];
             links.push({
               id: `link_${this.linkCounter++}`,
               type: 'variable',
               points: [
                 { x: varX + this.gridSize / 2, y: varY },
                 { x: varX + this.gridSize / 2, y: binderId * this.gridSize }
               ]
             });
           }
           
           return { width: 1, lastNodeId: nodeId };
         }
           
         case 'lam': {
           if (!term.body) throw new Error('Lambda term missing body');
           
           const nodeId = `node_${this.nodeCounter++}`;
           const lamX = x * this.gridSize;
           const lamY = y * this.gridSize;
           
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
             links
           );
           
           // Add horizontal line for the abstraction
           links.push({
             id: `link_${this.linkCounter++}`,
             type: 'abstraction',
             points: [
               { x: lamX, y: lamY + this.gridSize / 2 },
               { x: lamX + bodyWidth * this.gridSize, y: lamY + this.gridSize / 2 }
             ]
           });
           
           return { width: bodyWidth, lastNodeId: nodeId };
         }
           
         case 'app': {
           if (!term.left || !term.right) throw new Error('Application missing terms');
           
           const appX = x * this.gridSize;
           const appY = y * this.gridSize;
           
           // Process left term
           const { width: leftWidth, lastNodeId: leftId } = this.generateVisual(
             term.left, 
             x, 
             y + 1, 
             binders, 
             nodes, 
             links
           );
           
           // Process right term
           const { width: rightWidth, lastNodeId: rightId } = this.generateVisual(
             term.right, 
             x + leftWidth, 
             y + 1, 
             binders, 
             nodes, 
             links
           );
           
           // Add application link (connect the terms)
           links.push({
             id: `link_${this.linkCounter++}`,
             type: 'application',
             points: [
               { x: appX + this.gridSize / 2, y: appY + this.gridSize },
               { x: appX + leftWidth * this.gridSize + this.gridSize / 2, y: appY + this.gridSize }
             ]
           });
           
           return { width: leftWidth + rightWidth, lastNodeId: rightId };
         }
       }
     }
   }

   // Export a singleton instance for convenience
   export const gridTrompGenerator = new GridTrompGenerator();
   ```

2. Refactor `src/components/lambda/TrompDiagram.tsx` to use the new grid-based layout:
   ```typescript
   import React from 'react';
   import { LambdaExpr } from '@/types/lambda';
   import { gridTrompGenerator } from '@/lib/lambda/trompDiagramGrid';

   interface TrompDiagramProps {
     expr: LambdaExpr;
     width: number;
     height: number;
   }

   export default function TrompDiagram({ expr, width, height }: TrompDiagramProps) {
     // Generate grid-based diagram
     const diagram = gridTrompGenerator.generateGrid(expr);
     
     // Scale the diagram to fit the container if needed
     const scale = Math.min(
       width / diagram.width,
       height / diagram.height,
       1  // Don't scale up, only down if needed
     );
     
     return (
       <div className="relative bg-white border rounded overflow-hidden">
         <div className="absolute top-2 right-2 flex space-x-2">
           <button className="p-1 text-xs bg-gray-100 rounded">Zoom In</button>
           <button className="p-1 text-xs bg-gray-100 rounded">Zoom Out</button>
           <button className="p-1 text-xs bg-gray-100 rounded">Reset</button>
         </div>
         
         <svg
           width={width}
           height={height}
           viewBox={`0 0 ${diagram.width} ${diagram.height}`}
           className="mx-auto"
         >
           {/* Render links */}
           {diagram.links.map(link => (
             <path
               key={link.id}
               d={`M ${link.points.map(p => `${p.x},${p.y}`).join(' L ')}`}
               stroke={link.type === 'variable' ? '#6366F1' : 
                       link.type === 'abstraction' ? '#22C55E' : '#F59E0B'}
               strokeWidth={link.type === 'application' ? 2 : 1.5}
               fill="none"
             />
           ))}
           
           {/* Render nodes */}
           {diagram.nodes.map(node => {
             switch (node.type) {
               case 'variable':
                 return (
                   <circle
                     key={node.id}
                     cx={node.x + node.width / 2}
                     cy={node.y + node.height / 2}
                     r={node.width / 4}
                     fill="#6366F1"
                   />
                 );
                 
               case 'abstraction':
                 return (
                   <rect
                     key={node.id}
                     x={node.x}
                     y={node.y}
                     width={node.width / 2}
                     height={node.height / 2}
                     fill="#22C55E"
                   />
                 );
                 
               case 'application':
                 return (
                   <rect
                     key={node.id}
                     x={node.x}
                     y={node.y}
                     width={node.width / 2}
                     height={node.height / 2}
                     rx={node.width / 4}
                     fill="#F59E0B"
                   />
                 );
             }
           })}
         </svg>
       </div>
     );
   }
   ```

### 3. Reduction Sequence Animation

Implement a step-by-step reduction visualization system based on the Haskell implementation.

**Tasks:**

1. Enhance `src/lib/lambda/evaluator.ts` with a function to generate a reduction sequence:
   ```typescript
   /**
    * Generate a complete reduction sequence from a term to normal form
    */
   reduceMany(expr: LambdaExpr, strategy: 'normal' | 'applicative' = 'normal', maxSteps = 100): LambdaExpr[] {
     const steps: LambdaExpr[] = [expr];
     let current = expr;
     let count = 0;
     
     while (count < maxSteps) {
       const next = strategy === 'normal' ? 
         this.betaReduce(current) : 
         this.betaReduceApplicative(current);
       
       if (!next) break;
       steps.push(next);
       current = next;
       count++;
     }
     
     return steps;
   }
   
   /**
    * Implement applicative order reduction (call-by-value)
    */
   betaReduceApplicative(expr: LambdaExpr): LambdaExpr | null {
     // Implement applicative order reduction
     // (Prioritize reducing arguments before applying functions)
     // ...
   }
   ```

2. Create a new component `src/components/lambda/ReductionSequence.tsx`:
   ```typescript
   import React, { useState } from 'react';
   import { LambdaExpr } from '@/types/lambda';
   import { lambdaEvaluator } from '@/lib/lambda/evaluator';
   import TrompDiagram from './TrompDiagram';

   interface ReductionSequenceProps {
     initialExpr: LambdaExpr;
     width: number;
     height: number;
   }

   export default function ReductionSequence({ initialExpr, width, height }: ReductionSequenceProps) {
     // Generate the reduction sequence
     const [sequence] = useState(() => lambdaEvaluator.reduceMany(initialExpr));
     const [currentStep, setCurrentStep] = useState(0);
     const [isPlaying, setIsPlaying] = useState(false);
     const [playSpeed, setPlaySpeed] = useState(1000); // ms per step
     
     // Auto-play functionality
     React.useEffect(() => {
       if (!isPlaying) return;
       
       const timer = setTimeout(() => {
         if (currentStep < sequence.length - 1) {
           setCurrentStep(step => step + 1);
         } else {
           setIsPlaying(false);
         }
       }, playSpeed);
       
       return () => clearTimeout(timer);
     }, [currentStep, isPlaying, playSpeed, sequence.length]);
     
     return (
       <div className="flex flex-col">
         <div className="mb-4">
           <TrompDiagram expr={sequence[currentStep]} width={width} height={height} />
         </div>
         
         <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
           <div className="text-sm">
             Step {currentStep + 1} of {sequence.length}
           </div>
           
           <div className="flex space-x-2">
             <button
               onClick={() => setCurrentStep(0)}
               disabled={currentStep === 0}
               className="p-1 bg-white rounded disabled:opacity-50"
             >
               ⏮️
             </button>
             
             <button
               onClick={() => setCurrentStep(step => Math.max(0, step - 1))}
               disabled={currentStep === 0}
               className="p-1 bg-white rounded disabled:opacity-50"
             >
               ⏪
             </button>
             
             <button
               onClick={() => setIsPlaying(!isPlaying)}
               className="p-1 bg-white rounded"
             >
               {isPlaying ? '⏸️' : '▶️'}
             </button>
             
             <button
               onClick={() => setCurrentStep(step => Math.min(sequence.length - 1, step + 1))}
               disabled={currentStep === sequence.length - 1}
               className="p-1 bg-white rounded disabled:opacity-50"
             >
               ⏩
             </button>
             
             <button
               onClick={() => setCurrentStep(sequence.length - 1)}
               disabled={currentStep === sequence.length - 1}
               className="p-1 bg-white rounded disabled:opacity-50"
             >
               ⏭️
             </button>
           </div>
           
           <div className="flex items-center space-x-2">
             <span className="text-xs">Speed:</span>
             <input
               type="range"
               min="200"
               max="2000"
               step="100"
               value={playSpeed}
               onChange={e => setPlaySpeed(Number(e.target.value))}
               className="w-20"
             />
           </div>
         </div>
         
         <div className="mt-2 text-sm font-mono p-2 bg-gray-50 rounded">
           {lambdaEvaluator.toString(sequence[currentStep])}
         </div>
       </div>
     );
   }
   ```

3. Update `src/components/lambda/Visualizer.tsx` to incorporate the new reduction sequence component:
   ```typescript
   import React, { useState } from 'react';
   import ExpressionInput from './ExpressionInput';
   import ReductionSequence from './ReductionSequence';
   import InfoPanel from './InfoPanel';
   import { lambdaParser } from '@/lib/lambda/parser';
   import { LambdaExpr } from '@/types/lambda';

   export default function Visualizer() {
     const [expr, setExpr] = useState<LambdaExpr | null>(null);
     const [error, setError] = useState<string | null>(null);
     
     const handleExpressionSubmit = (input: string) => {
       try {
         const parsedExpr = lambdaParser.parse(input);
         setExpr(parsedExpr);
         setError(null);
       } catch (err) {
         setError(err instanceof Error ? err.message : String(err));
       }
     };
     
     return (
       <div className="container mx-auto p-4">
         <h1 className="text-2xl font-bold mb-4">Lambda Calculus Visualizer</h1>
         
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
           <div className="lg:col-span-1">
             <ExpressionInput onSubmit={handleExpressionSubmit} />
             
             {error && (
               <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                 {error}
               </div>
             )}
             
             {expr && <InfoPanel expr={expr} />}
           </div>
           
           <div className="lg:col-span-2">
             {expr && (
               <ReductionSequence
                 initialExpr={expr}
                 width={800}
                 height={500}
               />
             )}
           </div>
         </div>
       </div>
     );
   }
   ```

### 4. Alternative Visualization Styles

Implement support for different visualization styles inspired by the Haskell implementation.

**Tasks:**

1. Enhance `src/lib/lambda/trompDiagramGrid.ts` with style options:
   ```typescript
   export interface TrompDiagramOptions {
     style: 'classic' | 'minimal' | 'colored';
     showVariableNames: boolean;
     showNodeLabels: boolean;
   }

   // Update the generateGrid method to accept options
   generateGrid(expr: LambdaExpr, options: TrompDiagramOptions = {
     style: 'classic',
     showVariableNames: true,
     showNodeLabels: true
   }): TrompGrid {
     // ...
   }
   ```

2. Update `src/components/lambda/TrompDiagram.tsx` to support style options:
   ```typescript
   interface TrompDiagramProps {
     expr: LambdaExpr;
     width: number;
     height: number;
     options?: {
       style: 'classic' | 'minimal' | 'colored';
       showVariableNames: boolean;
       showNodeLabels: boolean;
     };
   }
   
   export default function TrompDiagram({ 
     expr, 
     width, 
     height, 
     options = { 
       style: 'classic', 
       showVariableNames: true, 
       showNodeLabels: true 
     } 
   }: TrompDiagramProps) {
     // ...
   }
   ```

3. Add style selector to `src/components/lambda/ReductionSequence.tsx`:
   ```typescript
   const styles = [
     { id: 'classic', name: 'Classic' },
     { id: 'minimal', name: 'Minimal' },
     { id: 'colored', name: 'Colored' }
   ];
   
   const [diagramStyle, setDiagramStyle] = useState<'classic' | 'minimal' | 'colored'>('classic');
   
   // In the render function, add:
   <div className="flex items-center space-x-2 mt-2">
     <label className="text-sm">Style:</label>
     <select
       value={diagramStyle}
       onChange={e => setDiagramStyle(e.target.value as any)}
       className="text-sm p-1 border rounded"
     >
       {styles.map(style => (
         <option key={style.id} value={style.id}>
           {style.name}
         </option>
       ))}
     </select>
   </div>
   
   // Pass style options to TrompDiagram
   <TrompDiagram 
     expr={sequence[currentStep]} 
     width={width} 
     height={height} 
     options={{
       style: diagramStyle,
       showVariableNames: true,
       showNodeLabels: true
     }}
   />
   ```

## Implementation Phasing

Implement the refactoring in the following phases:

### Phase 1: Core Data Structure Conversion

1. Implement the de Bruijn index conversion layer
2. Test conversion between named variables and de Bruijn indices
3. Ensure all existing functionality still works with these new types

### Phase 2: Grid-Based Visualization

1. Implement the grid-based Tromp diagram generator
2. Create the new TrompDiagram component using this approach
3. Compare visualization results with the Haskell implementation

### Phase 3: Animation and Reduction Sequence

1. Implement the reduction sequence generation
2. Build the ReductionSequence component
3. Add playback controls and animation features

### Phase 4: UI Refinement and Alternative Styles

1. Add style options and visualization controls
2. Improve the user interface for interaction with diagrams
3. Add educational features and annotations

## Testing Plan

1. Create test cases for each lambda calculus operation:
   - Identity function: `λx.x`
   - Application: `(λx.x) y`
   - Nested lambdas: `λx.λy.x y`
   - Church numerals: `λf.λx.f (f (f x))` (Church 3)

2. Compare visualization output with the Haskell implementation for the same inputs

3. Test reduction sequences to ensure they match expected results

4. Test performance with complex expressions

## Dependencies

No new dependencies are required beyond what's already included in the project. We'll be implementing all the needed functionality using the existing libraries:

- TypeScript/NextJS for the application framework
- D3.js for basic visualization utilities
- Tailwind CSS for styling

## Conclusion

This refactoring will significantly enhance the Lambda Calculus Visualizer by incorporating the precise and visually appealing Tromp diagram approach from the Haskell implementation. The grid-based layout will provide clearer visualization, and the animation system will better illustrate the step-by-step reduction process.

By maintaining our named variable approach while adding a conversion layer to de Bruijn indices, we'll get the best of both worlds: intuitive expression representation for users and precise visualization for the diagrams.