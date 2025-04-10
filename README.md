# Lambda Calculus Visualizer

An interactive educational tool for visualizing lambda calculus through mathematical expressions using animated Tromp diagrams.

![Lambda Calculus Visualizer](public/screenshot.png)

## Overview

The Lambda Calculus Visualizer bridges the gap between everyday arithmetic and theoretical computer science. It allows users to:

1. Enter familiar mathematical expressions (like `3+4` or `2*(5-1)`)
2. Visualize how these calculations are processed using lambda calculus
3. Step through the computation process with animated Tromp diagrams
4. Learn about the underlying computational model

## Features

- **Calculator Interface**: Intuitive calculator with support for basic arithmetic operations
- **Tromp Diagram Visualization**: Interactive visual representation of lambda calculus expressions
- **Step-by-Step Animation**: Control the animation pace and navigate through reduction steps
- **Educational Content**: Explanations of each reduction step and lambda calculus concepts
- **Responsive Design**: Works on desktop, tablet, and mobile devices

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
