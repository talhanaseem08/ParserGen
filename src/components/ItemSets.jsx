import React from 'react'

function ItemSets({ results }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">
        LR(0) Item Sets (I0 - I{results.num_states - 1})
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {results.states.map((state) => (
          <div
            key={state.id}
            className="border border-gray-300 rounded p-3 bg-gray-50"
          >
            <div className="font-bold text-blue-600 mb-2">I{state.id}:</div>
            <ul className="list-none space-y-1">
              {state.items.map((item, idx) => (
                <li key={idx} className="text-sm font-mono text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ItemSets

