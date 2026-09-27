import React, { useState, useMemo } from 'react';
import { StandardGraphResponse, GraphNode, GraphEdge } from '../types';

interface StandardRelationshipGraphProps {
  graph: StandardGraphResponse;
  onSelectStandard?: (standardId: string) => void;
}

export const StandardRelationshipGraph: React.FC<StandardRelationshipGraphProps> = ({
  graph,
  onSelectStandard,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(graph.primary_id);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<GraphEdge | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');

  // Node Type colors & labels
  const nodeTypeConfig: Record<string, { bg: string; border: string; text: string; label: string }> = {
    PRIMARY: { bg: '#8B9A6E', border: '#707E55', text: '#FFFFFF', label: 'Primary Product Standard' },
    TEST_METHOD: { bg: '#EAE2D6', border: '#B7791F', text: '#20241F', label: 'Mandatory Test Method' },
    SAFETY: { bg: '#FDF2E9', border: '#C05621', text: '#7B341E', label: 'Electrical / Mechanical Safety' },
    INSTALLATION: { bg: '#EBF8FF', border: '#3182CE', text: '#2B6CB0', label: 'Installation & Erection Code' },
    CERTIFICATION: { bg: '#F0FFF4', border: '#38A169', text: '#22543D', label: 'Certification & Quality' },
    SUBSYSTEM: { bg: '#FAF5FF', border: '#805AD5', text: '#553C9A', label: 'Component / Driver Spec' },
    NORMATIVE: { bg: '#F7FAFC', border: '#718096', text: '#2D3748', label: 'Normative Reference' },
  };

  // Find selected node details
  const selectedNode = useMemo(() => {
    return graph.nodes.find((n) => n.id === selectedNodeId) || graph.nodes[0];
  }, [graph, selectedNodeId]);

  // Edges connected to selected node
  const activeEdges = useMemo(() => {
    return graph.edges.filter(
      (e) => e.source === selectedNodeId || e.target === selectedNodeId
    );
  }, [graph, selectedNodeId]);

  // Orbit Layout coordinates for SVG
  const centerPoint = { x: 300, y: 220 };
  const radius = 150;

  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const otherNodes = graph.nodes.filter((n) => n.id !== graph.primary_id);
    
    // Primary at center
    positions[graph.primary_id] = { x: centerPoint.x, y: centerPoint.y };

    // Calculate angular positions for satellites
    const totalSatellites = otherNodes.length;
    otherNodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / (totalSatellites || 1) - Math.PI / 2;
      positions[node.id] = {
        x: centerPoint.x + radius * Math.cos(angle),
        y: centerPoint.y + radius * Math.sin(angle),
      };
    });

    return positions;
  }, [graph]);

  return (
    <div className="bg-white border border-[#EAE2D6] rounded-xl overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-[#EAE2D6] bg-[#F7F2EB] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B9A6E]" />
            <h3 className="font-serif text-lg font-semibold text-[#20241F]">
              Standards Relationship Graph
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-[#EAE2D6] text-[#20241F] font-mono font-medium">
              {graph.nodes.length} Standards Linked
            </span>
          </div>
          <p className="text-xs text-[#20241F]/70 mt-1">
            Visual map connecting primary product standard with normative test methods, safety codes, and components.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-[#EAE2D6]/60 p-1 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setViewMode('graph')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'graph'
                ? 'bg-white text-[#20241F] shadow-sm font-semibold'
                : 'text-[#20241F]/70 hover:text-[#20241F]'
            }`}
          >
            Visual Graph
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-[#20241F] shadow-sm font-semibold'
                : 'text-[#20241F]/70 hover:text-[#20241F]'
            }`}
          >
            List View ({graph.nodes.length})
          </button>
        </div>
      </div>

      {viewMode === 'graph' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* SVG Canvas */}
          <div className="lg:col-span-8 p-4 relative bg-[#FDFCFA] overflow-x-auto flex items-center justify-center min-h-[460px]">
            <svg
              viewBox="0 0 600 440"
              className="w-full max-w-[620px] h-auto select-none"
              style={{ minWidth: '400px' }}
            >
              <defs>
                {/* Glow Filter */}
                <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
                </filter>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="6"
                  refX="18"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="#8B9A6E" />
                </marker>
              </defs>

              {/* Background Orbit Ring */}
              <circle
                cx={centerPoint.x}
                cy={centerPoint.y}
                r={radius}
                fill="none"
                stroke="#EAE2D6"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Edge Connecting Lines */}
              {graph.edges.map((edge, idx) => {
                const sourcePos = nodePositions[edge.source] || centerPoint;
                const targetPos = nodePositions[edge.target] || centerPoint;
                const isHovered =
                  hoveredEdge === edge ||
                  hoveredNodeId === edge.source ||
                  hoveredNodeId === edge.target;
                const isSelected =
                  selectedNodeId === edge.source || selectedNodeId === edge.target;

                return (
                  <g key={`edge-${idx}`}>
                    <line
                      x1={sourcePos.x}
                      y1={sourcePos.y}
                      x2={targetPos.x}
                      y2={targetPos.y}
                      stroke={isSelected ? '#557A5B' : isHovered ? '#8B9A6E' : '#D5CBBB'}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.25}
                      strokeDasharray={edge.relationship === 'normative_reference' ? 'none' : '4 3'}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredEdge(edge)}
                      onMouseLeave={() => setHoveredEdge(null)}
                    />
                  </g>
                );
              })}

              {/* Satellite & Center Nodes */}
              {graph.nodes.map((node) => {
                const pos = nodePositions[node.id] || centerPoint;
                const isPrimary = node.type === 'PRIMARY';
                const isSelected = node.id === selectedNodeId;
                const isHovered = node.id === hoveredNodeId;
                const cfg = nodeTypeConfig[node.type] || nodeTypeConfig.NORMATIVE;
                const nodeRadius = isPrimary ? 34 : 26;

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer transition-transform duration-200"
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      if (onSelectStandard) onSelectStandard(node.id);
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    filter="url(#nodeGlow)"
                  >
                    {/* Active highlight ring */}
                    {(isSelected || isHovered) && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={nodeRadius + 6}
                        fill="none"
                        stroke="#8B9A6E"
                        strokeWidth="2"
                        strokeDasharray={isSelected ? 'none' : '3 3'}
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeRadius}
                      fill={isPrimary ? cfg.bg : isSelected ? '#F7F2EB' : '#FFFFFF'}
                      stroke={cfg.border}
                      strokeWidth={isPrimary ? 3 : 2}
                    />

                    {/* Standard code text */}
                    <text
                      x={pos.x}
                      y={pos.y - 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isPrimary ? '#FFFFFF' : '#20241F'}
                      fontSize={isPrimary ? '10px' : '8.5px'}
                      fontWeight="700"
                      className="font-mono tracking-tight pointer-events-none"
                    >
                      {node.id.length > 12 ? node.id.substring(0, 11) + '..' : node.id}
                    </text>

                    {/* Node type sub-label */}
                    <text
                      x={pos.x}
                      y={pos.y + 11}
                      textAnchor="middle"
                      fill={isPrimary ? '#F7F2EB' : '#707E55'}
                      fontSize="7px"
                      fontWeight="600"
                      className="pointer-events-none uppercase"
                    >
                      {node.type.replace('_', ' ')}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating edge tooltip */}
            {hoveredEdge && (
              <div className="absolute bottom-4 left-4 right-4 bg-[#20241F] text-white p-3 rounded-lg shadow-lg text-xs max-w-sm pointer-events-none border border-[#8B9A6E]/40">
                <span className="font-semibold text-[#8B9A6E] block mb-1">
                  Relationship: {hoveredEdge.relationship.replace('_', ' ').toUpperCase()}
                </span>
                <p className="text-gray-300 leading-relaxed">{hoveredEdge.reason}</p>
              </div>
            )}
          </div>

          {/* Details Side Panel */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#EAE2D6] p-5 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor:
                      nodeTypeConfig[selectedNode.type]?.bg || '#EAE2D6',
                    color: nodeTypeConfig[selectedNode.type]?.text || '#20241F',
                  }}
                >
                  {nodeTypeConfig[selectedNode.type]?.label || selectedNode.type}
                </span>

                <span
                  className={`text-[11px] px-2 py-0.5 rounded border font-mono ${
                    selectedNode.data_status === 'verified'
                      ? 'border-[#557A5B]/30 bg-[#F0FFF4] text-[#22543D]'
                      : 'border-[#B7791F]/30 bg-[#FFFBEB] text-[#92400E]'
                  }`}
                >
                  {selectedNode.data_status}
                </span>
              </div>

              <h4 className="font-mono text-base font-bold text-[#20241F] mb-1">
                {selectedNode.id}
              </h4>
              <p className="font-serif text-sm font-semibold text-[#20241F]/90 mb-3 leading-snug">
                {selectedNode.title}
              </p>

              {selectedNode.version && (
                <div className="text-xs text-[#20241F]/70 mb-3 flex items-center gap-1.5">
                  <span className="font-semibold text-[#20241F]">Current Version:</span>
                  <span className="font-mono bg-[#EAE2D6]/40 px-1.5 py-0.5 rounded">
                    {selectedNode.version}
                  </span>
                </div>
              )}

              <div className="border-t border-[#EAE2D6] pt-3 mt-3">
                <h5 className="text-xs font-semibold text-[#20241F] uppercase tracking-wider mb-2">
                  Connected Relationships ({activeEdges.length})
                </h5>
                {activeEdges.length === 0 ? (
                  <p className="text-xs text-[#20241F]/60 italic">
                    Primary standard node connecting to peripheral norms.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {activeEdges.map((edge, idx) => {
                      const otherId =
                        edge.source === selectedNode.id ? edge.target : edge.source;
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-[#F7F2EB] border border-[#EAE2D6]/80 text-xs"
                        >
                          <div className="flex items-center justify-between font-mono font-semibold text-[#20241F] mb-0.5">
                            <span>{otherId}</span>
                            <span className="text-[10px] text-[#557A5B] uppercase font-sans">
                              {edge.relationship.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-[#20241F]/80 text-[11px] leading-relaxed">
                            {edge.reason}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer action */}
            <div className="pt-4 mt-4 border-t border-[#EAE2D6]">
              {onSelectStandard && (
                <button
                  type="button"
                  onClick={() => onSelectStandard(selectedNode.id)}
                  className="w-full text-center py-2 px-3 bg-[#8B9A6E] hover:bg-[#707E55] text-white text-xs font-medium rounded-lg transition-colors"
                >
                  View Full Standard Specification →
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Mobile / List Fallback View */
        <div className="p-6 divide-y divide-[#EAE2D6]">
          {graph.nodes.map((node) => {
            const cfg = nodeTypeConfig[node.type] || nodeTypeConfig.NORMATIVE;
            const relevantEdges = graph.edges.filter(
              (e) => e.source === node.id || e.target === node.id
            );

            return (
              <div key={node.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-[#20241F]">
                        {node.id}
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded font-medium"
                        style={{ backgroundColor: cfg.bg, color: cfg.text }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm font-serif text-[#20241F]/90 font-medium">
                      {node.title}
                    </p>
                  </div>

                  {onSelectStandard && (
                    <button
                      type="button"
                      onClick={() => onSelectStandard(node.id)}
                      className="text-xs text-[#557A5B] hover:text-[#20241F] font-medium underline"
                    >
                      View Details
                    </button>
                  )}
                </div>

                {relevantEdges.length > 0 && (
                  <div className="mt-2 pl-3 border-l-2 border-[#8B9A6E]/40 space-y-1">
                    {relevantEdges.map((e, idx) => (
                      <div key={idx} className="text-xs text-[#20241F]/80">
                        <span className="font-medium text-[#20241F]">
                          {e.source === node.id ? `Links to ${e.target}: ` : `Linked from ${e.source}: `}
                        </span>
                        {e.reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
