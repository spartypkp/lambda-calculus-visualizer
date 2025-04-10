# Lambda Calculus Visualizer Project

## Research
Main inspiration: https://www.youtube.com/watch?v=RcVA8Nj6HEo
### Tromp diagrams
https://tromp.github.io/cl/diagrams.html
 Lambda Diagrams
Lambda Diagrams are a graphical notation for closed lambda terms, in which abstractions (lambdas) are represented by horizontal lines, variables by vertical lines emanating down from their binding lambda, and applications by horizontal links connecting the leftmost variables. In the alternative style, applications link the nearest deepest variables, for a more stylistic, if less uniform, look.
The following table shows diagrams of identity, the booleans, some standard combinators, some Church numerals, the predecessor function on Church numerals, and Omega.
term	definition	diagram	alternative
I/1	λx.x		
K/true	λx.λy.x		
false/0	λx.λy.y		
S	λx.λy.λz.(x z)(y z)		
Y	λf.(λx.x x)(λx.f(x x))		
2	λf.λx.f(f x)		
3	λf.λx.f(f(f x))		
4	λf.λx.f(f(f(f x)))		
pred	λn.λf.λx.n(λg.λh.h(g f))(λu.x)(λu.u)		
fac	λn.λf.n(λf.λn.n(f(λf.λx.n f(f x))))(λx.f)(λx.x)		
fib	λn.λf.n(λc.λa.λb.c b(λx.a (b x)))(λx.λy.x)(λx.x)f		
Ω	(λx.x x)(λx.x x)		
Curiously, the alternative Omega diagram somewhat resembles an (upside-down) Omega.

And here, on a larger scale, is a prime number sieve (alternative style):



which reduces to an infinite list of booleans that starts out as



Dimensions and complexity
In terms of pixels, a diagram's width is one less than 4 times the number of variables (vertical lines), and its height is one more than twice the maximum number of nested abstractions and applications (one less for alternaitve diagrams with multiple variables).
The size of the binary encoding of a term is closely related to the graphical complexity: it is exactly twice the number of lines plus the number of (4-way) intersections.

Reduction
Beta-reduction on lambda diagrams can be shown in several steps, as demonstrated in this reduction from Y=λf.(λx.x x)(λx.f(x x)) to λf.(λx.f(x x))(λx.f(x x))
initial term	
show application of abstraction	
show bound variables and argument	
expand function body	
to make room for substitution	
substitute argument for variables	
final term	
In the third frame, we show only the part of bound variables below abstractions, e.g. when applying , the function body x(λy.x) shows as .
Diagrams In Motion
Paul Brauner has produced some awesome videos of beta reductions, produced with this software. Youtuber 2swap made a cool video What is PLUS times PLUS? featuring animated lambda diagrams. University of Oregon Ph.D. student Cruz Godar made a web app for animating colored lambda diagram's of one's choice.
Generalizing to non-closed terms
How could we denote unbound variables in a lambda diagram? We can imagine their binding lambda to be somewhere invisibly above the diagram, so their vertical line could stick out on top, not ending in any (visible) horizontal line. Still, it's not clear how far different free variables should stick out. Except if we assume the term is already in de-Bruijn notation. Then its index tells us how many lambda binders need to be added in front of the term to bound the variable. So we can let it stick out the appropriate amount. For a non-closed term t, let n be the minimal so that λnt is closed. Then the diagram for t could simply be the diagram for λnt with the n top lambdas not drawn.
Related work
Dave Keenan has a comprehensive online paper To Dissect a Mockingbird: A Graphical Notation for the Lambda Calculus with Animated Reduction, which partly inspired this page.
Alligator Eggs" is masquarading lambda calculus as a colorful puzzle game.

In his Master thesis, Viktor Massalõgin discusses 4 existing graphical notations before introducing his own "bubble" notation. Figure 3 on page 10 shows 4 depictions of the fixpoint combinator (which differs from Y above in one beta reduction), while the bubble form is in Figure 5 on page 13.

Prathyush Pramod compiled a catalogue of all known graphical notations.

λ-2D is a canvas based graphical notation allowing users to edit and run/animate code in a 2D grid..


Lambda Calculus Desmos: https://www.desmos.com/calculator/rviihyo72n
Haskell Software: https://github.com/polux/lambda-diagrams?tab=readme-ov-file



## Project Overview

This project aims to create an interactive web application for visualizing lambda calculus operations using Tromp diagrams. The application will serve as both an educational tool and a practical calculator for those working with lambda calculus, providing intuitive visual representations of abstract lambda expressions and their reductions.

The core functionality includes:
- Parsing and validating lambda calculus expressions
- Generating visual Tromp diagrams from these expressions
- Animating beta reductions and other lambda calculus operations
- Providing an intuitive user interface for interaction with the visualizations



## User Experience (UX) Design

### Main Interface Components

1. **Expression Input Panel**
   - Text input field with syntax highlighting for lambda expressions
   - Standard notation support (e.g., `λx.λy.x y` or `\x.\y.x y`)
   - Error highlighting for invalid expressions
   - History of recent expressions
   - Library of example expressions (Church numerals, combinators, etc.)

2. **Visualization Canvas**
   - Primary display area for the Tromp diagram
   - Interactive navigation:
     - Zoom in/out
     - Pan across the diagram
     - Select and highlight specific nodes
   - Responsive sizing based on complexity of the expression

3. **Operation Controls**
   - Step-by-step reduction controls
   - Play/pause/reset animation buttons
   - Speed control for animations
   - Option to show intermediate steps

4. **Information Panel**
   - Display of the current expression in text form
   - Explanation of the current step in a reduction sequence
   - Variable binding information
   - Performance metrics (steps to normal form, etc.)

### User Interactions

1. **Expression Entry and Editing**
   - Direct typing with auto-completion
   - Syntax validation in real-time
   - Quick selection from common expressions
   - Copy/paste support

2. **Diagram Interaction**
   - Hovering over a node highlights all related bindings
   - Clicking on a subexpression selects it for focused view
   - Dragging nodes to rearrange the layout (optional)
   - Right-click context menu for operations on subexpressions

3. **Reduction Workflow**
   - Select a redex (reducible expression)
   - View the step-by-step beta reduction
   - Compare before/after states
   - Automatically reduce to normal form (if it exists)

4. **Educational Features**
   - Toggle explanations for each step
   - Switch between different visualization styles
   - Save/export diagrams as SVG or PNG

## Technical Implementation

### Frontend Architecture

1. **Component Structure**
   - Layout components (Header, Sidebar, Canvas, Controls)
   - Functional components for specific UI elements
   - Specialized visualization components

2. **State Management**
   - Store the current lambda expression and its parsed representation
   - Track reduction history and current reduction step
   - Manage UI state (selected nodes, zoom level, etc.)
   - Handle user preferences and settings

3. **Interaction Handlers**
   - Input validation and processing
   - Diagram interaction (zoom, pan, select)
   - Animation control
   - Export functionality

### Backend Requirements

The application can be primarily client-side, but may benefit from some backend services:

1. **Optional Server Components**
   - Expression storage and sharing
   - User accounts for saving expressions
   - Computing complex reductions for large expressions

2. **API Endpoints (if needed)**
   - `/api/parse` - Parse and validate lambda expressions
   - `/api/reduce` - Perform reduction steps
   - `/api/save` - Save expressions to database
   - `/api/examples` - Retrieve predefined examples

### Lambda Calculus Engine

1. **Parser**
   - Tokenize input strings
   - Build abstract syntax tree (AST)
   - Validate well-formedness
   - Handle different syntactic variations

2. **Evaluator**
   - Identify redexes
   - Perform substitutions correctly (avoiding variable capture)
   - Execute different reduction strategies (normal order, applicative order)
   - Detect non-terminating reductions

3. **Diagram Generator**
   - Transform AST into Tromp diagram structure
   - Handle variable binding visualization
   - Optimize layout for readability
   - Support different diagram styles

## Tech Stack

### Core Technologies

- **Framework**: Next.js 14+ (with App Router)
- **Language**: TypeScript 5+
- **Visualization**: D3.js v7
- **State Management**: React Context API or Redux (if complexity warrants)
- **Styling**: Tailwind CSS with custom components

### Development Tools

- **Build System**: Next.js built-in (based on webpack/turbopack)
- **Package Manager**: pnpm or yarn
- **Version Control**: Git with GitHub
- **Testing**: Jest for unit tests, React Testing Library for component tests
- **Linting**: ESLint with TypeScript plugins
- **Formatting**: Prettier

### Deployment

- **Hosting**: Vercel (optimal for Next.js)
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics
- **Database** (if needed): PlanetScale (MySQL) or Supabase (PostgreSQL)

## Project Structure

The project follows a standard Next.js App Router structure with TypeScript. Here's an overview of the main directories and files:

### Directory Structure

```
lambda-calculus-visualizer/
├── public/                  # Static assets
├── src/                     # Source code
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout with font configuration
│   │   ├── page.tsx         # Main application page
│   │   └── globals.css      # Global styles including Tromp diagram styling
│   ├── components/          # React components
│   │   └── lambda/          # Lambda calculus specific components
│   │       ├── ControlPanel.tsx       # UI controls for expression evaluation
│   │       ├── DiagramViewer.tsx      # Renders Tromp diagrams with interactive features
│   │       ├── ExamplesList.tsx       # Provides predefined example expressions
│   │       ├── ExpressionInput.tsx    # Input field for lambda expressions
│   │       ├── InfoPanel.tsx          # Displays information about current expression
│   │       ├── TrompDiagramInfo.tsx   # Educational information about Tromp diagrams
│   │       └── Visualizer.tsx         # Main component that orchestrates the application
│   ├── lib/                 # Utility libraries and core logic
│   │   ├── lambda/          # Lambda calculus core functionality
│   │   │   ├── evaluator.ts # Handles beta reduction and expression evaluation
│   │   │   ├── parser.ts    # Parses lambda calculus syntax into AST
│   │   │   └── trompDiagram.ts # Generates visual diagrams from expressions
│   │   └── math/            # Mathematical expression handling
│   │       └── parser.ts    # Converts math expressions to lambda calculus
│   └── types/               # TypeScript type definitions
│       └── lambda.ts        # Types for lambda calculus expressions
```

### Key Components

1. **Visualizer (`src/components/lambda/Visualizer.tsx`)**
   - The main orchestrator component that manages the application state
   - Coordinates between user input, expression parsing, evaluation, and visualization
   - Handles error states and user interactions

2. **DiagramViewer (`src/components/lambda/DiagramViewer.tsx`)**
   - Renders the Tromp diagram visualization using SVG
   - Implements interactive features like zooming, panning, and centering
   - Handles different node and link types for abstractions, variables, and applications

3. **ControlPanel (`src/components/lambda/ControlPanel.tsx`)**
   - Provides UI controls for step-by-step beta reduction, resetting, and reducing to normal form
   - Includes animation speed controls

4. **ExpressionInput (`src/components/lambda/ExpressionInput.tsx`)**
   - Text input field for entering lambda calculus or mathematical expressions
   - Provides feedback and examples for users

### Core Libraries

1. **Lambda Parser (`src/lib/lambda/parser.ts`)**
   - Implements a recursive descent parser for lambda calculus syntax
   - Handles both λ and \ notations for lambda
   - Builds an abstract syntax tree (AST) from the input string

2. **Lambda Evaluator (`src/lib/lambda/evaluator.ts`)**
   - Performs beta reduction on lambda expressions
   - Handles variable substitution with proper alpha conversion to avoid capture
   - Supports reduction to normal form

3. **Tromp Diagram Generator (`src/lib/lambda/trompDiagram.ts`)**
   - Converts lambda expressions into visual Tromp diagrams
   - Uses a grid-based layout system for positioning nodes
   - Supports both standard and alternative visualization styles

4. **Math Parser (`src/lib/math/parser.ts`)**
   - Converts mathematical expressions to lambda calculus using Church encodings
   - Implements operations like addition, subtraction, multiplication, and division
   - Provides a more accessible entry point for users unfamiliar with lambda syntax

### Data Flow

1. User enters an expression in the `ExpressionInput` component
2. The `Visualizer` component attempts to parse it first as a math expression, then as a lambda expression
3. If parsing succeeds, the expression is converted to a Tromp diagram using the `trompDiagramGenerator`
4. The diagram is rendered by the `DiagramViewer` component
5. When the user clicks reduction controls in the `ControlPanel`:
   - The `lambdaEvaluator` performs the requested operations
   - The `Visualizer` updates the state with the new expression
   - A new diagram is generated and displayed

This architecture separates concerns effectively:
- UI components handle user interaction and rendering
- Core logic libraries handle the mathematical and computational aspects
- State management is centralized in the `Visualizer` component
- Type definitions ensure consistency across the application

## Implementation Progress

### Completed Features

1. **Core Application Structure**
   - Next.js 15+ application with TypeScript and Tailwind CSS
   - App Router architecture with client-side components
   - Responsive layout with grid-based design

2. **Lambda Calculus Engine**
   - Parser for lambda calculus expressions
   - Parser for mathematical expressions with Church encoding
   - Beta reduction implementation with proper variable handling
   - Conversion to normal form

3. **User Interface**
   - Expression input with error handling
   - Control panel for step-by-step reduction
   - Information panel showing expression details
   - Examples list with predefined expressions
   - Toggle between single diagram and reduction sequence views

4. **Visualization**
   - Basic Tromp diagram visualization
   - Interactive features (zoom, pan)
   - Reduction sequence animation

### In Progress (Based on Refactor Plan)

1. **Enhanced Term Representation**
   - Implementation of de Bruijn index conversion layer
   - Support for free variables in expressions

2. **Grid-Based Visualization**
   - Replacing current visualization with grid-based layout
   - Improved node and link positioning
   - Better handling of complex expressions

3. **Animation Enhancements**
   - Smoother transitions between reduction steps
   - More intuitive playback controls
   - Adjustable animation speed

4. **Alternative Visualization Styles**
   - Support for different diagram styles (classic, minimal, colored)
   - Toggle options for variable names and node labels
   - Dark/light mode support

### Next Steps

1. Complete the implementation of the de Bruijn conversion layer
2. Implement the grid-based Tromp diagram generator
3. Enhance the reduction sequence component with improved controls
4. Add style options and visualization preferences
5. Improve educational features with more detailed explanations

## Current Dependencies

The project currently uses the following key dependencies:
- Next.js 15.3.0
- React 19.0.0
- D3.js 7.9.0
- Lodash 4.17.21
- Monaco Editor 0.52.2
- TypeScript 5+
- Tailwind CSS 4

## Implementation Phases

### Phase 1: Core Functionality

1. Setup Next.js project with TypeScript
2. Implement lambda calculus parser
3. Create basic Tromp diagram generator
4. Develop simple UI for expression input and visualization

### Phase 2: Enhanced Visualization

1. Improve diagram layout algorithm
2. Add interactive features to diagrams
3. Implement step-by-step reduction visualization
4. Add animation capabilities

### Phase 3: UI Refinement

1. Complete the user interface components
2. Add educational features and explanations
3. Implement responsive design
4. Create library of example expressions

### Phase 4: Advanced Features

1. Add different reduction strategies
2. Implement performance optimizations for complex expressions
3. Add export/import functionality
4. Create sharing capabilities (if backend is implemented)

## Technical Challenges

1. **Parsing Complexity**
   - Handling different lambda calculus notations
   - Ensuring correct variable binding
   - Detecting and reporting syntax errors meaningfully

2. **Diagram Layout**
   - Creating readable layouts for complex expressions
   - Handling large expressions with many nodes
   - Maintaining visual clarity during reductions

3. **Performance Optimization**
   - Efficiently computing reductions for complex expressions
   - Rendering large diagrams without performance issues
   - Managing memory for step history

4. **User Experience**
   - Creating an intuitive interface for a complex mathematical topic
   - Balancing simplicity with functionality
   - Providing appropriate educational context

## Key Libraries and Resources

### Required npm Packages

```
next
react
react-dom
typescript
d3
@types/d3
monaco-editor (or codemirror) for code editing
tailwindcss
```

### Optional Libraries

```
nearley or pegjs (for parsing)
react-spring (for animations)
lodash
framer-motion
```

### Learning Resources

- Lambda calculus formal definitions
- Tromp diagram specifications
- D3.js visualization examples
- Academic papers on lambda calculus visualization


## Future Extensions

1. Support for typed lambda calculus
2. Integration with other formal systems
3. Collaborative features for educational settings
4. Export to LaTeX or other academic formats
5. Integration with existing proof assistants



npm install d3 @types/d3 monaco-editor lodash @types/lodash
npm install --save-dev prettier prettier-plugin-tailwindcss

# Create core directories
mkdir -p src/components/lambda
mkdir -p src/lib/lambda
mkdir -p src/types