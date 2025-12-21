import React, { useState } from 'react'
import ParseTree from './ParseTree'
import ParseSteps from './ParseSteps'

function ParseResults({ parseResult }) {
  const [activeTab, setActiveTab] = useState('result')

  if (!parseResult) return null

  const tabs = [
    { id: 'result', label: 'Result' },
    { id: 'tree', label: 'Parse Tree' },
    { id: 'steps', label: 'Parsing Steps' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Parse Results</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'result' && (
          <div>
            {parseResult.accepted ? (
              <div className="p-4 bg-green-100 border-2 border-green-500 rounded-lg">
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  ✓ Input Accepted
                </h3>
                <p className="text-green-700">
                  The input string is valid according to the grammar.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-red-100 border-2 border-red-500 rounded-lg">
                <h3 className="text-xl font-bold text-red-800 mb-2">
                  ✗ Input Rejected
                </h3>
                <p className="text-red-700 font-semibold mb-2">
                  Error: {parseResult.error || 'Unknown error'}
                </p>
                {parseResult.steps && parseResult.steps.length > 0 && (
                  <p className="text-sm text-red-600">
                    Parsing failed at step {parseResult.steps.length}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tree' && (
          <ParseTree tree={parseResult.parse_tree} />
        )}

        {activeTab === 'steps' && (
          <ParseSteps steps={parseResult.steps} />
        )}
      </div>
    </div>
  )
}

export default ParseResults

