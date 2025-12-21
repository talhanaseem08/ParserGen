import React, { useState, useEffect } from 'react'

const LR0_EXAMPLE = `S -> A
A -> a A | b`

const SLR1_EXAMPLE = `S -> E
E -> T + E | T
T -> F * T | F
F -> ( E ) | id`

const NON_LR0_EXAMPLE = `S -> E
E -> E + E | E * E | id`

// LR(0) working examples
const LR0_WORKING_EXAMPLES = [
  {
    name: 'Simple Recursion',
    grammar: `S -> A
A -> a A | b`
  },
  {
    name: 'Balanced Parentheses',
    grammar: `S -> A
A -> ( A ) | a`
  },
  {
    name: 'Sequential',
    grammar: `S -> A B
A -> a
B -> b`
  },
  {
    name: 'Simple Chain',
    grammar: `S -> A
A -> a A | a`
  }
]

// SLR(1) working examples
const SLR1_WORKING_EXAMPLES = [
  {
    name: 'Arithmetic (Right)',
    grammar: `S -> E
E -> T + E | T
T -> F * T | F
F -> ( E ) | id`
  },
  {
    name: 'Arithmetic (Left)',
    grammar: `S -> E
E -> E + T | T
T -> T * F | F
F -> ( E ) | id`
  },
  {
    name: 'Simple Expression',
    grammar: `S -> E
E -> id + E | id * E | id`
  },
  {
    name: 'With Parentheses',
    grammar: `S -> E
E -> E + T | T
T -> T * F | F
F -> ( E ) | id`
  }
]

function GrammarEditor({ onGenerate, loading }) {
  const [parserType, setParserType] = useState('lr0') // 'lr0' or 'slr1'
  const [grammarText, setGrammarText] = useState(LR0_EXAMPLE)
  
  // Update grammar example when parser type changes
  useEffect(() => {
    if (parserType === 'slr1') {
      setGrammarText(SLR1_EXAMPLE)
    } else {
      setGrammarText(LR0_EXAMPLE)
    }
  }, [parserType])

  const handleSubmit = (e) => {
    e.preventDefault()
    onGenerate(grammarText, parserType)
  }

  const handleLoadLR0 = () => {
    setParserType('lr0')
    setGrammarText(LR0_EXAMPLE)
  }

  const handleLoadNonLR0 = () => {
    setGrammarText(NON_LR0_EXAMPLE)
  }
  
  const handleLoadSLR1 = () => {
    setParserType('slr1')
    setGrammarText(SLR1_EXAMPLE)
  }

  const handleLoadWorkingExample = (example) => {
    setGrammarText(example.grammar)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Grammar Input</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleLoadLR0}
            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium"
            title="Load LR(0) grammar example"
          >
            LR(0) ✓
          </button>
          <button
            onClick={handleLoadSLR1}
            className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 font-medium"
            title="Load SLR(1) grammar example (arithmetic expressions)"
          >
            SLR(1) ✓
          </button>
          <button
            onClick={handleLoadNonLR0}
            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
            title="Load non-LR(0) grammar example (has conflicts)"
          >
            Non-LR(0) ✗
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-xs text-gray-600 mb-2">
          More Working Examples ({parserType.toUpperCase()}):
        </p>
        <div className="flex flex-wrap gap-1">
          {(parserType === 'slr1' ? SLR1_WORKING_EXAMPLES : LR0_WORKING_EXAMPLES).map((example, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadWorkingExample(example)}
              className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 border border-blue-200"
              title={example.name}
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Context-Free Grammar:
          </label>
          <textarea
            value={grammarText}
            onChange={(e) => setGrammarText(e.target.value)}
            className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="S -> E&#10;E -> E + T | T&#10;T -> T * F | F&#10;F -> ( E ) | id"
          />
          <p className="text-xs text-gray-500 mt-2">
            Format: NonTerminal {'->'} Production1 | Production2 | ...
            <br />
            Use 'ε' or empty for epsilon productions
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parser Type:
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="lr0"
                checked={parserType === 'lr0'}
                onChange={(e) => setParserType(e.target.value)}
                className="mr-2"
                disabled={loading}
              />
              <span className="text-sm text-gray-800 font-medium">LR(0)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="slr1"
                checked={parserType === 'slr1'}
                onChange={(e) => setParserType(e.target.value)}
                className="mr-2"
                disabled={loading}
              />
              <span className="text-sm text-gray-800 font-medium">SLR(1)</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            SLR(1) can parse arithmetic expressions and more complex grammars
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Generating...' : `Generate ${parserType.toUpperCase()} Tables`}
        </button>
      </form>
    </div>
  )
}

export default GrammarEditor

