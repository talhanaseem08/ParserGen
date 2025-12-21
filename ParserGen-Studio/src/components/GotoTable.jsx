import React from 'react'

function GotoTable({ results }) {
  const nonTerminals = results.non_terminals.filter((nt) => nt !== "S'")
  const numStates = results.num_states
  const gotoTable = results.goto_table

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">GOTO Table</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-green-600">
              <th className="border border-green-700 px-3 py-2 font-semibold text-white">
                State
              </th>
              {nonTerminals.map((nt) => (
                <th
                  key={nt}
                  className="border border-green-700 px-3 py-2 font-semibold text-white"
                >
                  {nt}
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
                {nonTerminals.map((nt) => {
                  const goto = gotoTable[state]?.[nt] ?? ''
                  return (
                    <td
                      key={nt}
                      className="border border-gray-300 px-3 py-2 text-center font-mono bg-white text-green-700 font-semibold"
                    >
                      {goto !== '' ? goto : ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default GotoTable

