"use client";

interface Example {
  name: string;
  expression: string;
  description: string;
  category: 'math' | 'lambda';
}

const EXAMPLES: Example[] = [
  // Math expression examples
  {
    name: "Addition",
    expression: "3 + 5",
    description: "Simple addition of two numbers",
    category: "math"
  },
  {
    name: "Subtraction",
    expression: "10 - 4",
    description: "Simple subtraction of two numbers",
    category: "math"
  },
  {
    name: "Multiplication",
    expression: "3 * 4",
    description: "Simple multiplication of two numbers",
    category: "math"
  },
  {
    name: "Division",
    expression: "8 / 2",
    description: "Simple division of two numbers",
    category: "math"
  },
  {
    name: "Complex Expression",
    expression: "(3 + 5) * 2",
    description: "A more complex expression with parentheses",
    category: "math"
  },
  {
    name: "Nested Expression",
    expression: "((4 + 2) * 3) / (2 + 1)",
    description: "A nested expression with multiple operations",
    category: "math"
  },
  
  // Lambda calculus examples
  {
    name: "Identity",
    expression: "λx.x",
    description: "The identity function: returns its argument unchanged",
    category: "lambda"
  },
  {
    name: "Self-application",
    expression: "λs.(s s)",
    description: "Applies a function to itself",
    category: "lambda"
  },
  {
    name: "Church true",
    expression: "λt.λf.t",
    description: "Church encoding of boolean true: selects the first of two arguments",
    category: "lambda"
  },
  {
    name: "Church false",
    expression: "λt.λf.f",
    description: "Church encoding of boolean false: selects the second of two arguments",
    category: "lambda"
  },
  {
    name: "Church 0",
    expression: "λf.λx.x",
    description: "Church encoding of number 0",
    category: "lambda"
  },
  {
    name: "Church 1",
    expression: "λf.λx.(f x)",
    description: "Church encoding of number 1",
    category: "lambda"
  },
  {
    name: "Church 2",
    expression: "λf.λx.(f (f x))",
    description: "Church encoding of number 2",
    category: "lambda"
  },
  {
    name: "Y combinator",
    expression: "λf.(λx.(f (x x)) λx.(f (x x)))",
    description: "Fixed-point combinator for recursion",
    category: "lambda"
  }
];

interface ExamplesListProps {
  onSelectExample: (expression: string) => void;
}

export function ExamplesList({ onSelectExample }: ExamplesListProps) {
  return (
    <div className="p-4 border border-gray-300 rounded-md">
      <h3 className="text-lg font-semibold mb-2">Examples</h3>
      
      <div className="space-y-4 max-h-60 overflow-y-auto">
        {/* Math Expression Examples */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1">Math Expressions</h4>
          <div className="space-y-1">
            {EXAMPLES.filter(ex => ex.category === 'math').map((example) => (
              <div 
                key={example.name}
                className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => onSelectExample(example.expression)}
              >
                <div className="font-medium">{example.name}</div>
                <code className="text-sm font-mono">{example.expression}</code>
                <div className="text-xs text-gray-600 mt-1">{example.description}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Lambda Calculus Examples */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-1">Lambda Calculus (Advanced)</h4>
          <div className="space-y-1">
            {EXAMPLES.filter(ex => ex.category === 'lambda').map((example) => (
              <div 
                key={example.name}
                className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => onSelectExample(example.expression)}
              >
                <div className="font-medium">{example.name}</div>
                <code className="text-sm font-mono">{example.expression}</code>
                <div className="text-xs text-gray-600 mt-1">{example.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}