import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

function DFAGraph({ results }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!results || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 600
    svg.attr('width', width).attr('height', height)

    const transitions = results.dfa_transitions || []
    const numStates = results.num_states || 0
    const terminals = new Set(results.terminals || [])
    const nonTerminals = new Set(results.non_terminals || [])

    // Create nodes
    const nodes = Array.from({ length: numStates }, (_, i) => ({
      id: i,
      label: `I${i}`,
    }))

    // Create links with type information
    const links = transitions.map((t) => {
      const isTerminal = terminals.has(t.symbol) && t.symbol !== '$'
      const isNonTerminal = nonTerminals.has(t.symbol)
      return {
        source: t.from,
        target: t.to,
        symbol: t.symbol,
        type: isTerminal ? 'terminal' : isNonTerminal ? 'nonterminal' : 'unknown',
      }
    })

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(120)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))

    // Draw links with different styles for terminals and non-terminals
    const link = svg
      .append('g')
      .selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', (d) => {
        if (d.type === 'terminal') return '#2563eb' // Blue for terminals (shift)
        if (d.type === 'nonterminal') return '#16a34a' // Green for non-terminals (goto)
        return '#999' // Gray for unknown
      })
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.7)
      .attr('stroke-dasharray', (d) => {
        // Dashed for non-terminals, solid for terminals
        return d.type === 'nonterminal' ? '5,5' : '0'
      })

    // Draw link labels with background for better visibility
    const linkLabel = svg
      .append('g')
      .selectAll('.link-label')
      .data(links)
      .enter()
      .append('g')
      .attr('class', 'link-label')
    
    // Background rectangle for better readability
    linkLabel
      .append('rect')
      .attr('x', -12)
      .attr('y', -8)
      .attr('width', 24)
      .attr('height', 16)
      .attr('fill', 'white')
      .attr('stroke', (d) => {
        if (d.type === 'terminal') return '#2563eb'
        if (d.type === 'nonterminal') return '#16a34a'
        return '#999'
      })
      .attr('stroke-width', 1)
      .attr('rx', 3)
    
    // Label text
    linkLabel
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', (d) => {
        if (d.type === 'terminal') return '#2563eb'
        if (d.type === 'nonterminal') return '#16a34a'
        return '#555'
      })
      .attr('font-weight', '600')
      .text((d) => d.symbol)

    // Draw nodes
    const node = svg
      .append('g')
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(
        d3
          .drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      )

    node
      .append('circle')
      .attr('r', 25)
      .attr('fill', '#4A90E2')
      .attr('stroke', '#2E5C8A')
      .attr('stroke-width', 2)

    node
      .append('text')
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .text((d) => d.label)

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

      linkLabel
        .attr('transform', (d) => {
          const x = (d.source.x + d.target.x) / 2
          const y = (d.source.y + d.target.y) / 2
          return `translate(${x},${y})`
        })

      node.attr('transform', (d) => `translate(${d.x},${d.y})`)
    })

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    return () => {
      simulation.stop()
    }
  }, [results])

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">DFA Visualization</h2>
      <div className="mb-3 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <svg width="32" height="4" className="flex-shrink-0">
            <line x1="0" y1="2" x2="32" y2="2" stroke="#2563eb" strokeWidth="2" />
          </svg>
          <span className="text-gray-700">Terminal (Shift)</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="32" height="4" className="flex-shrink-0">
            <line x1="0" y1="2" x2="32" y2="2" stroke="#16a34a" strokeWidth="2" strokeDasharray="4,4" />
          </svg>
          <span className="text-gray-700">Non-Terminal (GOTO)</span>
        </div>
      </div>
      <div className="border border-gray-300 rounded overflow-hidden bg-gray-50">
        <svg ref={svgRef} className="w-full"></svg>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Drag nodes to rearrange. States are labeled as I0, I1, etc.
      </p>
    </div>
  )
}

export default DFAGraph

