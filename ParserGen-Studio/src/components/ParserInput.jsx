import React, { useState } from 'react'

function ParserInput({ onParse, loading, grammarText }) {
  const [inputString, setInputString] = useState('a b')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputString.trim()) {
      onParse(inputString.trim())
    }
  }

  const handleExample = () => {
    // Simple example based on common grammar
    setInputString('a b')
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Parse Input String</h2>
        <button
          onClick={handleExample}
          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium"
        >
          Example
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Input String:
          </label>
          <input
            type="text"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., a b a"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-2">
            Enter tokens separated by spaces (e.g., "a b a")
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !grammarText.trim()}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Parsing...' : 'Parse Input'}
        </button>
      </form>

      {!grammarText.trim() && (
        <p className="text-sm text-amber-600 mt-2">
          ⚠️ Generate parsing tables first before parsing input
        </p>
      )}
    </div>
  )
}

export default ParserInput

