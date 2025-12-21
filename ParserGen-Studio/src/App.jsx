import React, { useState } from 'react'
import GrammarEditor from './components/GrammarEditor'
import ResultsPanel from './components/ResultsPanel'
import DFAGraph from './components/DFAGraph'
import ExplanationPanel from './components/ExplanationPanel'
import ParserInput from './components/ParserInput'
import ParseResults from './components/ParseResults'

function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [grammarText, setGrammarText] = useState('')
  const [parserType, setParserType] = useState('lr0')
  const [parseResult, setParseResult] = useState(null)
  const [parsing, setParsing] = useState(false)

  const handleGenerate = async (grammarTextInput, parserTypeInput = 'lr0') => {
    setLoading(true)
    setError(null)
    setResults(null)
    setParseResult(null)
    setGrammarText(grammarTextInput)
    setParserType(parserTypeInput)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          grammar: grammarTextInput,
          parser_type: parserTypeInput
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate parser')
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleParse = async (inputString) => {
    if (!grammarText.trim()) {
      setError('Please generate parsing tables first')
      return
    }

    setParsing(true)
    setError(null)
    setParseResult(null)

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grammar: grammarText,
          input: inputString,
          parser_type: parserType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to parse input')
      }

      const data = await response.json()
      setParseResult(data)
    } catch (err) {
      setError(err.message)
      setParseResult({
        accepted: false,
        error: err.message,
        parse_tree: null,
        steps: [],
      })
    } finally {
      setParsing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold mb-2">ParserGen Studio</h1>
          <p className="text-blue-100 text-lg mt-2">
            Interactive LR(0) & SLR(1) Parser Generator & Visualizer
          </p>
          <p className="text-blue-200 text-sm mt-1">
            Generate parsing tables, visualize DFAs, and parse input strings with step-by-step analysis
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Grammar Input */}
          <div className="lg:col-span-1 space-y-6">
            <GrammarEditor onGenerate={handleGenerate} loading={loading} />
            {results && (results.is_lr0 || results.is_slr1) && (
              <ParserInput
                onParse={handleParse}
                loading={parsing}
                grammarText={grammarText}
              />
            )}
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong>Error:</strong> {error}
              </div>
            )}

            {results && (
              <>
                {/* Verdict */}
                <div
                  className={`p-4 rounded-lg shadow ${
                    results.is_lr0
                      ? 'bg-green-100 border-2 border-green-500'
                      : 'bg-red-100 border-2 border-red-500'
                  }`}
                >
                  <h2 className="text-xl font-bold mb-2">
                    {results.parser_type === 'slr1' 
                      ? (results.is_slr1 
                          ? '✓ Grammar is SLR(1)'
                          : '✗ Grammar is NOT SLR(1)')
                      : (results.is_lr0
                          ? '✓ Grammar is LR(0)'
                          : '✗ Grammar is NOT LR(0)')}
                  </h2>
                  {((results.parser_type === 'slr1' && !results.is_slr1) || 
                    (results.parser_type === 'lr0' && !results.is_lr0)) && (
                    <div className="mt-2">
                      {results.shift_reduce_conflicts.length > 0 && (
                        <p className="text-red-700">
                          Shift/Reduce Conflicts: {results.shift_reduce_conflicts.length}
                        </p>
                      )}
                      {results.reduce_reduce_conflicts.length > 0 && (
                        <p className="text-red-700">
                          Reduce/Reduce Conflicts: {results.reduce_reduce_conflicts.length}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Explanation Panel */}
                <ExplanationPanel results={results} />

                {/* DFA Graph */}
                <DFAGraph results={results} />

                {/* Results Tables */}
                <ResultsPanel results={results} />

                {/* Parse Results */}
                {parseResult && (
                  <ParseResults parseResult={parseResult} />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

