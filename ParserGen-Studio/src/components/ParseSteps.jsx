import React, { useState } from 'react'

function ParseSteps({ steps }) {
  const [expandedStep, setExpandedStep] = useState(null)

  if (!steps || steps.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No parsing steps available
      </div>
    )
  }

  const formatStack = (stack) => {
    if (!stack || stack.length === 0) return '[]'
    // Stack alternates: state, symbol, state, symbol, ...
    const items = []
    for (let i = 0; i < stack.length; i += 2) {
      if (i + 1 < stack.length) {
        items.push(`${stack[i]} ${stack[i + 1]}`)
      } else {
        items.push(stack[i])
      }
    }
    return `[${items.join(', ')}]`
  }

  const formatInput = (input) => {
    if (!input || input.length === 0) return '[]'
    return `[${input.join(', ')}]`
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">
        Parsing Steps ({steps.length} steps)
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`border rounded p-3 ${
              step.error
                ? 'bg-red-50 border-red-300'
                : step.action === 'accept'
                ? 'bg-green-50 border-green-300'
                : 'bg-gray-50 border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-semibold text-gray-800 mb-1">
                  Step {step.step}: {step.action}
                </div>
                {step.message && (
                  <div className="text-sm text-gray-700 mb-2">
                    {step.message}
                  </div>
                )}
                {step.error && (
                  <div className="text-sm text-red-700 font-semibold mb-2">
                    Error: {step.error}
                  </div>
                )}
                {step.production && (
                  <div className="text-sm text-blue-700 font-mono mb-2">
                    Production: {step.production}
                  </div>
                )}
                <button
                  onClick={() =>
                    setExpandedStep(expandedStep === idx ? null : idx)
                  }
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {expandedStep === idx ? 'Hide' : 'Show'} details
                </button>
                {expandedStep === idx && (
                  <div className="mt-2 text-xs font-mono space-y-1 bg-gray-100 border border-gray-300 p-3 rounded">
                    <div className="text-gray-800">
                      <span className="font-semibold text-gray-900">State:</span>{' '}
                      <span className="text-blue-700">{step.state}</span>
                    </div>
                    <div className="text-gray-800">
                      <span className="font-semibold text-gray-900">Token:</span>{' '}
                      <span className="text-green-700">{step.token}</span>
                    </div>
                    <div className="text-gray-800">
                      <span className="font-semibold text-gray-900">Stack:</span>{' '}
                      <span className="text-purple-700">{formatStack(step.stack)}</span>
                    </div>
                    <div className="text-gray-800">
                      <span className="font-semibold text-gray-900">Input:</span>{' '}
                      <span className="text-orange-700">{formatInput(step.input)}</span>
                    </div>
                  </div>
                )}
              </div>
              <div
                className={`ml-4 px-2 py-1 rounded text-xs font-semibold ${
                  step.error
                    ? 'bg-red-200 text-red-800'
                    : step.action === 'accept'
                    ? 'bg-green-200 text-green-800'
                    : step.action?.startsWith('s')
                    ? 'bg-blue-200 text-blue-800'
                    : step.action?.startsWith('r')
                    ? 'bg-purple-200 text-purple-800'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {step.action}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ParseSteps

