import React, { useState } from 'react'

function ExplanationPanel({ results }) {
  const [expanded, setExpanded] = useState(true)

  const augmentedProd = results.augmented_grammar && results.augmented_grammar[0] 
    ? results.augmented_grammar[0] 
    : "S' → S"
  
  const isSLR1 = results.parser_type === 'slr1'
  
  const steps = [
    {
      title: '1. Grammar Augmentation',
      content: `Added augmented start symbol: ${augmentedProd}`,
    },
    {
      title: isSLR1 ? '2. FIRST Sets Computation' : '2. LR(0) Items Generated',
      content: isSLR1 
        ? `Computed FIRST sets for all symbols. FIRST(terminal) = {terminal}, FIRST(non-terminal) includes terminals that can start its derivations.`
        : `Created LR(0) items with dot notation for all productions.`,
    },
    {
      title: isSLR1 ? '3. FOLLOW Sets Computation' : '3. LR(0) Items Generated',
      content: isSLR1
        ? `Computed FOLLOW sets for all non-terminals. FOLLOW(A) contains terminals that can follow A in derivations.`
        : `Created LR(0) items with dot notation for all productions.`,
    },
    {
      title: isSLR1 ? '4. LR(0) Items Generated' : '3. Closure Computation',
      content: isSLR1
        ? `Created LR(0) items with dot notation for all productions.`
        : `Applied closure rule: If A → α•Bβ is in closure, and B → γ is a production, then add B → •γ to closure.`,
    },
    {
      title: '3. Closure Computation',
      content: `Applied closure rule: If A → α•Bβ is in closure, and B → γ is a production, then add B → •γ to closure.`,
    },
    {
      title: '4. GOTO Computation',
      content: `Computed GOTO(I, X) by moving dot over symbol X and computing closure.`,
    },
    {
      title: '5. DFA Construction',
      content: `Built ${results.num_states} states (I0 to I${results.num_states - 1}) with ${results.dfa_transitions.length} transitions.`,
    },
    {
      title: isSLR1 ? '7. ACTION Table (SLR(1))' : '6. ACTION Table',
      content: isSLR1
        ? `Generated ACTION table with:
        - Shift actions (sN) when dot is before a terminal
        - Reduce actions (rN) only on FOLLOW set terminals (key SLR(1) difference!)
        - Accept action when S' → S• is encountered`
        : `Generated ACTION table with:
        - Shift actions (sN) when dot is before a terminal
        - Reduce actions (rN) when dot is at the end
        - Accept action when S' → S• is encountered`,
    },
    {
      title: isSLR1 ? '8. GOTO Table' : '7. GOTO Table',
      content: `Generated GOTO table for non-terminal transitions.`,
    },
    {
      title: isSLR1 ? '9. Conflict Detection' : '8. Conflict Detection',
      content:
        (isSLR1 ? results.is_slr1 : results.is_lr0)
          ? `No conflicts detected. Grammar is ${isSLR1 ? 'SLR(1)' : 'LR(0)'}.`
          : `Detected ${results.shift_reduce_conflicts.length} Shift/Reduce conflicts and ${results.reduce_reduce_conflicts.length} Reduce/Reduce conflicts. Grammar is NOT ${isSLR1 ? 'SLR(1)' : 'LR(0)'}.`,
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex justify-between items-center w-full text-left"
      >
        <h2 className="text-xl font-bold text-gray-800">
          Step-by-Step Explanation
        </h2>
        <span className="text-gray-500">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r"
            >
              <h3 className="font-semibold text-gray-800">{step.title}</h3>
              <p className="text-sm text-gray-700 mt-1">{step.content}</p>
            </div>
          ))}

          {isSLR1 && results.first_sets && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-300 rounded">
              <h3 className="font-semibold text-blue-800 mb-2">FIRST Sets:</h3>
              <div className="text-sm text-blue-700 space-y-1">
                {Object.entries(results.first_sets).slice(0, 10).map(([symbol, firstSet]) => (
                  <div key={symbol} className="font-mono">
                    FIRST({symbol}) = {'{'}{firstSet.join(', ')}{'}'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isSLR1 && results.follow_sets && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-300 rounded">
              <h3 className="font-semibold text-purple-800 mb-2">FOLLOW Sets:</h3>
              <div className="text-sm text-purple-700 space-y-1">
                {Object.entries(results.follow_sets).slice(0, 10).map(([symbol, followSet]) => (
                  <div key={symbol} className="font-mono">
                    FOLLOW({symbol}) = {'{'}{followSet.join(', ')}{'}'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.shift_reduce_conflicts.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded">
              <h3 className="font-semibold text-red-800 mb-2">
                Shift/Reduce Conflicts:
              </h3>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {results.shift_reduce_conflicts.map((conflict, idx) => (
                  <li key={idx}>
                    State {conflict.state}, Symbol '{conflict.symbol}':{' '}
                    {conflict.shift} vs {conflict.reduce}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.reduce_reduce_conflicts.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded">
              <h3 className="font-semibold text-red-800 mb-2">
                Reduce/Reduce Conflicts:
              </h3>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {results.reduce_reduce_conflicts.map((conflict, idx) => (
                  <li key={idx}>
                    State {conflict.state}, Symbol '{conflict.symbol}':{' '}
                    {conflict.reduce1} vs {conflict.reduce2}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ExplanationPanel

