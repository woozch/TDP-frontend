"use client";

import type { GraphEdge, GraphNode } from "@contracts/types";

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function GeneGraphView({ nodes, edges }: Props) {
  if (nodes.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No graph data loaded yet.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Nodes ({nodes.length})</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {nodes.map((node) => (
            <span
              key={node.id}
              className="rounded-full border border-[#f69e25]/50 bg-[#f69e25]/15 px-3 py-1 text-xs font-medium text-[#c47a1a] dark:bg-[#f69e25]/20 dark:text-[#f69e25]"
            >
              {node.label} · {node.kind} · {Math.round(node.score * 100)}%
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Edges ({edges.length})</p>
        <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
          {edges.map((edge, idx) => (
            <li key={`${edge.source}-${edge.target}-${idx}`}>
              {edge.source} → {edge.target} ({edge.relation}, {Math.round(edge.confidence * 100)}%)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
