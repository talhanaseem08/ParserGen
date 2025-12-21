import React from 'react'

function ParseTreeNode({ node, level = 0 }) {
  if (!node) return null

  const indent = level * 20

  return (
    <div className="my-2">
      <div
        className="inline-block px-3 py-1 rounded border-2 font-mono text-sm"
        style={{ marginLeft: `${indent}px` }}
      >
        <span className="font-bold text-blue-700">{node.symbol}</span>
        {node.production && (
          <span className="text-xs text-gray-500 ml-2">
            ({node.production})
          </span>
        )}
      </div>
      {node.children && node.children.length > 0 && (
        <div className="mt-1">
          {node.children.map((child, idx) => (
            <ParseTreeNode key={idx} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function ParseTree({ tree }) {
  if (!tree) {
    return (
      <div className="text-gray-500 text-center py-8">
        No parse tree available
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">Parse Tree</h3>
      <div className="border border-gray-300 rounded p-4 bg-gray-50 min-h-64 overflow-auto">
        <ParseTreeNode node={tree} />
      </div>
      <p className="text-sm text-gray-600">
        This tree shows how the input was parsed using the grammar productions.
      </p>
    </div>
  )
}

export default ParseTree

