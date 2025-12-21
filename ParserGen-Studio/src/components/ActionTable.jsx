import React from 'react'

function ActionTable({ results }) {
  const terminals = results.terminals
  const numStates = results.num_states
  const actionTable = results.action_table
  const conflicts = [
    ...results.shift_reduce_conflicts,
    ...results.reduce_reduce_conflicts,
  ]

  // Create conflict map for highlighting
  const conflictMap = {}
  conflicts.forEach((conflict) => {
    const key = `${conflict.state}-${conflict.symbol}`
    conflictMap[key] = true
  })

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">ACTION Table</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-blue-600">
              <th className="border border-blue-700 px-3 py-2 font-semibold text-white">
                State
              </th>
              {terminals.map((term) => (
                <th
                  key={term}
                  className="border border-blue-700 px-3 py-2 font-semibold text-white"
                >
                  {term}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numStates }).map((_, state) => (
              <tr key={state}>
                <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-50 text-gray-800">
                  {state}
                </td>
                {terminals.map((term) => {
                  const action = actionTable[state]?.[term] || ''
                  const isConflict = conflictMap[`${state}-${term}`]
                  return (
                    <td
                      key={term}
                      className={`border border-gray-300 px-3 py-2 text-center font-mono ${
                        isConflict
                          ? 'bg-red-200 font-bold text-red-900'
                          : 'bg-white text-blue-700 font-semibold'
                      }`}
                    >
                      {action}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {conflicts.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded">
          <p className="text-sm text-red-800">
            <strong>Note:</strong> Red cells indicate conflicts
          </p>
        </div>
      )}
    </div>
  )
}

export default ActionTable

