# Lambda Calculus Visualizer

## The Inspiration

It started at 2AM, with that familiar YouTube rabbit hole we all know too well. I stumbled upon [a mesmerizing video about lambda calculus](https://www.youtube.com/watch?v=RcVA8Nj6HEo), and the visualizations completely captivated me. There's something profoundly beautiful about seeing abstract mathematical concepts rendered visually.

The elegant Tromp diagrams connecting these theoretical concepts with intuitive shapes and flows sparked something in my brain. I knew I had to build this myself. Four hours of flow state coding later, fueled by coffee and fascination, this project was born.

**Warning:** Claude wrote this readme - if it reads too cringe - I take no responsibility!

## What is Lambda Calculus?

Lambda calculus is a formal system in mathematical logic and computer science, developed by Alonzo Church in the 1930s. It's a universal model of computation that forms the theoretical foundation of functional programming.

At its core, lambda calculus consists of:
- **Variables**: Simple symbolic names
- **Abstractions**: Functions that map variables to expressions (λx.M)
- **Applications**: Applying a function to an argument (M N)

Despite this simplicity, lambda calculus is Turing complete and can express any computable function.

## About This Project

The Lambda Calculus Visualizer transforms mathematical expressions into their lambda calculus representations and visualizes them using interactive Tromp diagrams. This bridge between familiar arithmetic and theoretical computer science makes abstract concepts tangible.

### Key Features

- **Interactive Diagrams**: Visualize lambda expressions as Tromp diagrams with different node types:
  - Diamonds (◇) for abstractions (λ)
  - Rectangles (□) for applications (@)
  - Circles (○) for variables
  
- **Animated Evaluation**: Watch the step-by-step beta reduction process unfold through smooth transitions and highlighting

- **Navigation Controls**:
  - Zoom and pan for complex expressions
  - Fit-to-view functionality
  - Focus on active reduction steps
  - Reset view option

- **Visual Enhancements**:
  - Color-coding for different node types
  - Highlighting for active reduction sites
  - Animation for emphasis
  - Minimap for orientation with complex diagrams

- **Educational Components**:
  - Visual distinction between expression components
  - Clear representation of computational steps
  - Intuitive interface for exploring lambda calculus

## Technical Stack

- Next.js with TypeScript
- React for component structure
- D3.js for visualization
- Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lambda-calculus-visualizer.git
cd lambda-calculus-visualizer

# Install dependencies
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to see the application in action.

## Usage

1. **Calculator**: Enter a mathematical expression using the calculator interface
2. **Visualization**: After evaluation, the expression is converted to lambda calculus and visualized as a Tromp diagram
3. **Animation Controls**: Use the controls to play, pause, step forward/backward, or adjust the animation speed
4. **Educational Panel**: Toggle additional information to learn about lambda calculus notation and concepts

## Lambda Calculus Basics

Lambda calculus is a formal system for expressing computation based on function abstraction and application. In this visualizer:

- **Variables** (represented as circles): Stand for values or parameters
- **Abstractions** (represented as diamonds): Define functions with parameters (λx.body)
- **Applications** (represented as rectangles): Apply functions to arguments

The computation proceeds through a series of beta reductions, where a function application (λx.body) arg is transformed by substituting all occurrences of x in the body with the argument.

## Implementation Details

### Technologies Used

- **Next.js & React**: Frontend framework
- **TypeScript**: Type-safe JavaScript
- **D3.js**: Visualization library for Tromp diagrams
- **Tailwind CSS**: Styling

### Architecture

The application is organized into several key components:

- **Calculator**: Handles user input and expression parsing
- **Math Parser**: Converts mathematical expressions to AST
- **Lambda Calculus Engine**: Implements Church encodings and beta reduction
- **Tromp Diagram**: Visualizes lambda expressions using D3
- **Animation Controller**: Manages step-by-step visualization
- **Educational Panel**: Provides explanations and additional information

## Development

### Project Structure

```
src/
├── app/               # Next.js app router
├── components/        # React components
│   ├── Calculator.tsx         # Calculator interface
│   ├── TrompDiagram.tsx       # Visualization component
│   ├── AnimationController.tsx # Animation controls
│   └── EducationalPanel.tsx   # Explanations panel
├── lib/               # Utility functions and core logic
│   ├── mathParser.ts          # Mathematical expression parser
│   ├── lambdaCalculus.ts      # Lambda calculus implementation
│   ├── mathToLambda.ts        # Converter from math to lambda
│   └── hooks/                 # Custom React hooks
```

### Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run lint`: Run the linter

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Alonzo Church for developing lambda calculus
- John Tromp for the diagram representation approach
- All contributors and users of this educational tool

## Future Enhancements

- Support for more complex operations
- Custom function definitions
- Comparison of different evaluation strategies
- Additional visualization styles

## Resources

- [Tromp Diagrams](https://tromp.github.io/cl/diagrams.html)
- [Lambda Calculus Desmos](https://www.desmos.com/calculator/rviihyo72n)
- [Lambda Diagrams GitHub](https://github.com/polux/lambda-diagrams)

---

*Created with passion in a 4-hour coding sprint, because sometimes, late-night inspiration leads to the most interesting projects.*
