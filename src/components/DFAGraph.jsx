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

    const transitions = results.dfa_transitions
    const numStates = results.num_states

    // Create nodes
    const nodes = Array.from({ length: numStates }, (_, i) => ({
      id: i,
      label: `I${i}`,
    }))

    // Create links
    const links = transitions.map((t) => ({
      source: t.from,
      target: t.to,
      symbol: t.symbol,
    }))

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

    // Draw links
    const link = svg
      .append('g')
      .selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#999')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)

    // Draw link labels
    const linkLabel = svg
      .append('g')
      .selectAll('.link-label')
      .data(links)
      .enter()
      .append('text')
      .attr('class', 'link-label')
      .attr('dy', -5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#555')
      .attr('font-weight', '500')
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
        .attr('x', (d) => (d.source.x + d.target.x) / 2)
        .attr('y', (d) => (d.source.y + d.target.y) / 2)

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

