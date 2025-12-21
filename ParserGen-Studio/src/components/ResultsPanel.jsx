import React, { useState } from 'react'
import ActionTable from './ActionTable'
import GotoTable from './GotoTable'
import ItemSets from './ItemSets'

function ResultsPanel({ results }) {
  const [activeTab, setActiveTab] = useState('items')

  const tabs = [
    { id: 'items', label: 'LR(0) Item Sets' },
    { id: 'action', label: 'ACTION Table' },
    { id: 'goto', label: 'GOTO Table' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Parsing Tables</h2>

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
      <div className="overflow-auto">
        {activeTab === 'items' && <ItemSets results={results} />}
        {activeTab === 'action' && <ActionTable results={results} />}
        {activeTab === 'goto' && <GotoTable results={results} />}
      </div>
    </div>
  )
}

export default ResultsPanel

