"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ForceGraph2D from "react-force-graph-2d";
import type { GraphEdge, GraphNode } from "@contracts/types";

const NODE_COLOR_BY_KIND: Record<string, string> = {
  gene: "#f69e25",
  target: "#2563eb",
  pathway: "#16a34a",
  drug: "#a855f7"
};

const NODE_LABEL_BY_KIND: Record<string, string> = {
  gene: "query gene",
  target: "target gene",
  pathway: "pathway",
  drug: "drug"
};
const FALLBACK_NODE_COLORS = ["#14b8a6", "#e11d48", "#f59e0b", "#8b5cf6", "#06b6d4", "#84cc16"];

function escapeRegexChar(char: string) {
  return char.replace(/[\\^$+?.()|[\]{}]/g, "\\$&");
}

function matchesWildcardPattern(value: string, pattern: string) {
  const normalized = pattern.trim();
  if (!normalized || normalized === "*") return true;
  const regexSource = normalized
    .split("*")
    .map((token) => escapeRegexChar(token))
    .join(".*");
  const regex = new RegExp(`^${regexSource}$`, "i");
  return regex.test(value);
}

function matchesNodeNameFilter(value: string, rawFilter: string) {
  const patterns = rawFilter
    .split(";")
    .map((pattern) => pattern.trim())
    .filter(Boolean);
  if (patterns.length === 0) return true;
  return patterns.some((pattern) => matchesWildcardPattern(value, pattern));
}

function buildDefaultNodeNameFilterByKind(nodeKinds: string[]): Record<string, string> {
  return Object.fromEntries(nodeKinds.map((kind) => [kind, "*"]));
}

function normalizeNodeNameFilterByKind(
  filters: Record<string, string>,
  nodeKinds: string[]
): Record<string, string> {
  const next = { ...filters };
  for (const kind of nodeKinds) {
    const normalized = String(next[kind] ?? "").trim();
    next[kind] = normalized.length === 0 ? "*" : normalized;
  }
  return next;
}

function getNodeColor(kind: string) {
  if (NODE_COLOR_BY_KIND[kind]) return NODE_COLOR_BY_KIND[kind];
  const hash = kind.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return FALLBACK_NODE_COLORS[hash % FALLBACK_NODE_COLORS.length];
}

function getNodeLabel(kind: string) {
  return NODE_LABEL_BY_KIND[kind] ?? kind;
}

function clampCountRange(range: CountRange | undefined, limit: number): CountRange {
  const safeLimit = Math.max(0, limit);
  const min = Math.max(0, Math.min(range?.min ?? 0, safeLimit));
  const max = Math.max(min, Math.min(range?.max ?? safeLimit, safeLimit));
  return { min, max };
}

function withAlpha(hexColor: string, alpha: number) {
  const normalized = hexColor.replace("#", "");
  const full = normalized.length === 3 ? normalized.split("").map((v) => v + v).join("") : normalized;
  if (full.length !== 6) return `rgba(107, 114, 128, ${alpha})`;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface GraphNodeWithViz extends GraphNode {
  color: string;
}

type GraphLinkWithViz = {
  source: string | GraphNodeWithViz;
  target: string | GraphNodeWithViz;
  relation: string;
  confidence: number;
  score?: number;
};
type CountRange = { min: number; max: number };
type HoverInfoCard = {
  id: string;
  type: "node" | "edge";
  nodeColor?: string;
  relation?: string;
  nodeName?: string;
  nodeKindLabel?: string;
  sourceName?: string;
  sourceKindLabel?: string;
  sourceColor?: string;
  destinationName?: string;
  destinationKindLabel?: string;
  destinationColor?: string;
  scoreText: string;
  confidenceText?: string;
};

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

type LayoutMode =
  | "default"
  | "td"
  | "bu"
  | "lr"
  | "rl"
  | "radialin"
  | "radialout";

export function GeneGraphView({ nodes, edges }: Props) {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [activeHoverCard, setActiveHoverCard] = useState<HoverInfoCard | null>(null);
  const [pinnedHoverCards, setPinnedHoverCards] = useState<HoverInfoCard[]>([]);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("default");
  const [nodeKindEnabled, setNodeKindEnabled] = useState<Record<string, boolean>>({});
  const [edgeTypeEnabled, setEdgeTypeEnabled] = useState<Record<string, boolean>>({});
  const [sourceCountRangeByType, setSourceCountRangeByType] = useState<Record<string, CountRange>>(
    {}
  );
  const [destinationCountRangeByType, setDestinationCountRangeByType] = useState<
    Record<string, CountRange>
  >({});
  const [scoreRangeByType, setScoreRangeByType] = useState<
    Record<string, { min: number; max: number }>
  >({});
  const [nodeNameFilterByKind, setNodeNameFilterByKind] = useState<Record<string, string>>({});
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [draftSourceCountRangeByType, setDraftSourceCountRangeByType] = useState<
    Record<string, CountRange>
  >({});
  const [draftDestinationCountRangeByType, setDraftDestinationCountRangeByType] = useState<
    Record<string, CountRange>
  >({});
  const [draftScoreRangeByType, setDraftScoreRangeByType] = useState<
    Record<string, { min: number; max: number }>
  >({});
  const [draftNodeNameFilterByKind, setDraftNodeNameFilterByKind] = useState<
    Record<string, string>
  >({});

  const nodeKinds = useMemo(
    () => Array.from(new Set(nodes.map((node) => String(node.kind)))).sort(),
    [nodes]
  );

  useEffect(() => {
    const el = graphContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? { width: 600, height: 400 };
      setDimensions({ width: Math.max(200, width), height: Math.max(200, height) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const edgeTypes = useMemo(
    () => Array.from(new Set(edges.map((edge) => edge.relation))).sort(),
    [edges]
  );
  const edgeCountLimitsByType = useMemo(() => {
    const sourceCountsByNode = new Map<string, Record<string, number>>();
    const destinationCountsByNode = new Map<string, Record<string, number>>();

    for (const edge of edges) {
      const relation = edge.relation;
      const sourceId = String(edge.source);
      const targetId = String(edge.target);

      const sourceCounts = sourceCountsByNode.get(sourceId) ?? {};
      sourceCounts[relation] = (sourceCounts[relation] ?? 0) + 1;
      sourceCountsByNode.set(sourceId, sourceCounts);

      const destinationCounts = destinationCountsByNode.get(targetId) ?? {};
      destinationCounts[relation] = (destinationCounts[relation] ?? 0) + 1;
      destinationCountsByNode.set(targetId, destinationCounts);
    }

    const limits: Record<string, { sourceMax: number; destinationMax: number }> = {};
    for (const relation of edgeTypes) {
      let sourceMax = 0;
      let destinationMax = 0;
      for (const counts of sourceCountsByNode.values()) {
        sourceMax = Math.max(sourceMax, counts[relation] ?? 0);
      }
      for (const counts of destinationCountsByNode.values()) {
        destinationMax = Math.max(destinationMax, counts[relation] ?? 0);
      }
      limits[relation] = { sourceMax, destinationMax };
    }
    return limits;
  }, [edges, edgeTypes]);

  useEffect(() => {
    setEdgeTypeEnabled((prev) => {
      const next: Record<string, boolean> = {};
      for (const relation of edgeTypes) {
        next[relation] = prev[relation] ?? true;
      }
      return next;
    });

    setSourceCountRangeByType((prev) => {
      const next: Record<string, CountRange> = {};
      for (const relation of edgeTypes) {
        const limit = edgeCountLimitsByType[relation]?.sourceMax ?? 0;
        next[relation] = clampCountRange(prev[relation], limit);
      }
      return next;
    });

    setDestinationCountRangeByType((prev) => {
      const next: Record<string, CountRange> = {};
      for (const relation of edgeTypes) {
        const limit = edgeCountLimitsByType[relation]?.destinationMax ?? 0;
        next[relation] = clampCountRange(prev[relation], limit);
      }
      return next;
    });

    setScoreRangeByType((prev) => {
      const next: Record<string, { min: number; max: number }> = {};
      for (const relation of edgeTypes) {
        next[relation] = prev[relation] ?? { min: 0, max: 1 };
      }
      return next;
    });
  }, [edgeTypes, edgeCountLimitsByType]);

  useEffect(() => {
    setNodeKindEnabled((prev) => {
      const next: Record<string, boolean> = {};
      for (const kind of nodeKinds) {
        next[kind] = prev[kind] ?? true;
      }
      return next;
    });

    setNodeNameFilterByKind((prev) => {
      const defaults = buildDefaultNodeNameFilterByKind(nodeKinds);
      const next: Record<string, string> = {};
      for (const kind of nodeKinds) {
        next[kind] = prev[kind] ?? defaults[kind];
      }
      return next;
    });
  }, [nodeKinds]);

  const graphData = useMemo(() => {
    const kindFilteredNodes: GraphNodeWithViz[] = nodes
      .filter((n) => nodeKindEnabled[n.kind])
      .filter((n) => {
        const name = String(n.label ?? n.id ?? "");
        const rawFilter = nodeNameFilterByKind[n.kind] ?? "*";
        return matchesNodeNameFilter(name, rawFilter);
      })
      .map((n) => ({
      ...n,
      color: getNodeColor(String(n.kind))
    }));

    const visibleNodeIds = new Set(kindFilteredNodes.map((n) => n.id));
    const kindAndTypeFilteredLinks = edges
      .filter((e) => edgeTypeEnabled[e.relation] ?? true)
      .filter((e) => {
        const range = scoreRangeByType[e.relation] ?? { min: 0, max: 1 };
        const score = (e as GraphEdge & { score?: number }).score ?? e.confidence ?? 0;
        return score >= range.min && score <= range.max;
      })
      .filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target))
      .map((e) => ({
        source: e.source,
        target: e.target,
        relation: e.relation,
        confidence: e.confidence
      }));

    // Count source/destination edge types per node for range-based filtering.
    const sourceEdgeTypeCountsByNode = new Map<string, Record<string, number>>();
    const destinationEdgeTypeCountsByNode = new Map<string, Record<string, number>>();
    for (const link of kindAndTypeFilteredLinks) {
      const sourceId = String(link.source);
      const targetId = String(link.target);
      const relation = link.relation;

      const sourceCounts = sourceEdgeTypeCountsByNode.get(sourceId) ?? {};
      sourceCounts[relation] = (sourceCounts[relation] ?? 0) + 1;
      sourceEdgeTypeCountsByNode.set(sourceId, sourceCounts);

      const targetCounts = destinationEdgeTypeCountsByNode.get(targetId) ?? {};
      targetCounts[relation] = (targetCounts[relation] ?? 0) + 1;
      destinationEdgeTypeCountsByNode.set(targetId, targetCounts);
    }

    // Keep only nodes that satisfy per-edge-type source/destination ranges.
    const eligibleNodes = kindFilteredNodes.filter((node) => {
      const sourceCounts = sourceEdgeTypeCountsByNode.get(String(node.id)) ?? {};
      const destinationCounts = destinationEdgeTypeCountsByNode.get(String(node.id)) ?? {};
      for (const relation of edgeTypes) {
        if (!(edgeTypeEnabled[relation] ?? true)) continue;
        const sourceLimit = edgeCountLimitsByType[relation]?.sourceMax ?? 0;
        const destinationLimit = edgeCountLimitsByType[relation]?.destinationMax ?? 0;
        const sourceRange = clampCountRange(sourceCountRangeByType[relation], sourceLimit);
        const destinationRange = clampCountRange(
          destinationCountRangeByType[relation],
          destinationLimit
        );
        const sourceCount = sourceCounts[relation] ?? 0;
        const destinationCount = destinationCounts[relation] ?? 0;
        if (sourceCount < sourceRange.min || sourceCount > sourceRange.max) {
          return false;
        }
        if (
          destinationCount < destinationRange.min ||
          destinationCount > destinationRange.max
        ) {
          return false;
        }
      }
      return true;
    });

    const connectedNodeIds = new Set<string>();
    for (const link of kindAndTypeFilteredLinks) {
      connectedNodeIds.add(String(link.source));
      connectedNodeIds.add(String(link.target));
    }

    const visibleNodes = eligibleNodes.filter((node) =>
      connectedNodeIds.has(String(node.id))
    );
    const finalNodeIds = new Set(visibleNodes.map((node) => String(node.id)));
    const visibleLinks = kindAndTypeFilteredLinks.filter(
      (link) =>
        finalNodeIds.has(String(link.source)) && finalNodeIds.has(String(link.target))
    );

    return { nodes: visibleNodes, links: visibleLinks };
  }, [
    nodes,
    edges,
    nodeKindEnabled,
    edgeTypeEnabled,
    edgeTypes,
    sourceCountRangeByType,
    destinationCountRangeByType,
    scoreRangeByType,
    nodeNameFilterByKind,
    edgeCountLimitsByType
  ]);

  const dagMode = layoutMode === "default" ? undefined : layoutMode;
  const enabledNodeLabels = nodeKinds.filter((kind) => nodeKindEnabled[kind] ?? true).map(
    (kind) => getNodeLabel(kind)
  );
  const enabledEdgeTypes = edgeTypes.filter((relation) => edgeTypeEnabled[relation] ?? true);
  const openAdvancedSettings = () => {
    setDraftSourceCountRangeByType(
      Object.fromEntries(
        Object.entries(sourceCountRangeByType).map(([key, value]) => [key, { ...value }])
      )
    );
    setDraftDestinationCountRangeByType(
      Object.fromEntries(
        Object.entries(destinationCountRangeByType).map(([key, value]) => [key, { ...value }])
      )
    );
    setDraftScoreRangeByType(
      Object.fromEntries(
        Object.entries(scoreRangeByType).map(([key, value]) => [key, { ...value }])
      )
    );
    setDraftNodeNameFilterByKind({ ...nodeNameFilterByKind });
    setShowAdvancedSettings(true);
  };
  const applyAdvancedSettings = () => {
    setSourceCountRangeByType(
      Object.fromEntries(
        edgeTypes.map((relation) => [
          relation,
          clampCountRange(
            draftSourceCountRangeByType[relation],
            edgeCountLimitsByType[relation]?.sourceMax ?? 0
          )
        ])
      )
    );
    setDestinationCountRangeByType(
      Object.fromEntries(
        edgeTypes.map((relation) => [
          relation,
          clampCountRange(
            draftDestinationCountRangeByType[relation],
            edgeCountLimitsByType[relation]?.destinationMax ?? 0
          )
        ])
      )
    );
    setScoreRangeByType(
      Object.fromEntries(
        Object.entries(draftScoreRangeByType).map(([key, value]) => [key, { ...value }])
      )
    );
    setNodeNameFilterByKind(normalizeNodeNameFilterByKind(draftNodeNameFilterByKind, nodeKinds));
    setShowAdvancedSettings(false);
  };
  const closeAdvancedSettings = () => setShowAdvancedSettings(false);
  const addPinnedHoverCard = (nextCard: HoverInfoCard | null) => {
    if (!nextCard) return;
    setPinnedHoverCards((prev) => {
      const withoutSame = prev.filter((card) => card.id !== nextCard.id);
      const merged = [...withoutSame, nextCard];
      return merged.slice(-3);
    });
  };
  const mergedHoverCards = useMemo(() => {
    if (pinnedHoverCards.length === 0) {
      return activeHoverCard ? [activeHoverCard] : [];
    }
    if (!activeHoverCard) return pinnedHoverCards;
    const hasSame = pinnedHoverCards.some((card) => card.id === activeHoverCard.id);
    if (hasSame) return pinnedHoverCards;
    return [...pinnedHoverCards, activeHoverCard].slice(-3);
  }, [activeHoverCard, pinnedHoverCards]);

  if (nodes.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">No graph data loaded yet.</p>
    );
  }

  return (
    <div className="graph-visualization flex min-h-[360px] flex-col items-stretch gap-3 lg:h-full lg:min-h-0 lg:flex-row">
      <div
        ref={graphContainerRef}
        className="relative min-h-[320px] min-w-0 flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-[#3a404a] dark:bg-[#121417] lg:min-h-0"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setPinnedHoverCards([]);
            setActiveHoverCard(null);
          }
        }}
      >
        <ForceGraph2D
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          cooldownTime={10000}
          dagMode={dagMode ?? undefined}
          dagLevelDistance={100}
          onDagError={() => {}}
          nodeLabel="label"
          nodeCanvasObject={(node, ctx, globalScale) => {
            const n = node as GraphNodeWithViz & { x: number; y: number };
            const label = n.label ?? n.id;
            const fontSize = Math.min(Math.max((n.score ?? 0.5) * 24, 10), 28) / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map((d) => d + fontSize * 0.2);

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = n.color ?? "#6b7280";
            ctx.fillText(label, n.x, n.y);
            (n as { __bckgDimensions?: number[] }).__bckgDimensions = bckgDimensions;
          }}
          nodePointerAreaPaint={(node, color, ctx) => {
            const n = node as { x: number; y: number; __bckgDimensions?: number[] };
            const bckgDimensions = n.__bckgDimensions;
            if (!bckgDimensions) return;
            ctx.fillStyle = color;
            ctx.fillRect(
              n.x - bckgDimensions[0] / 2,
              n.y - bckgDimensions[1] / 2,
              bckgDimensions[0],
              bckgDimensions[1]
            );
          }}
          linkCanvasObjectMode={() => "replace"}
          linkCanvasObject={(link, ctx, globalScale) => {
            const current = link as GraphLinkWithViz;
            const source = current.source as GraphNodeWithViz & { x: number; y: number };
            const target = current.target as GraphNodeWithViz & { x: number; y: number };
            if (source?.x == null || target?.x == null) return;
            if (
              !Number.isFinite(source.x) ||
              !Number.isFinite(source.y) ||
              !Number.isFinite(target.x) ||
              !Number.isFinite(target.y)
            ) {
              return;
            }

            const scoreRaw = current.score ?? current.confidence ?? 0.5;
            const score = Math.max(0, Math.min(1, scoreRaw));
            const alpha = 0.25 + score * 0.75;

            const sourceKind = source.kind;
            const targetKind = target.kind;
            const sourceColor = NODE_COLOR_BY_KIND[sourceKind] ?? "#9ca3af";
            const targetColor = NODE_COLOR_BY_KIND[targetKind] ?? "#9ca3af";

            const kindWeight: Record<GraphNode["kind"], number> = {
              gene: 1.2,
              target: 1.05,
              pathway: 0.9,
              drug: 1.1
            };
            const widthByKind = (kindWeight[sourceKind] + kindWeight[targetKind]) / 2;

            const gradient = ctx.createLinearGradient(
              source.x,
              source.y,
              target.x,
              target.y
            );
            gradient.addColorStop(0.0, sourceColor);
            gradient.addColorStop(1.0, targetColor);

            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.lineWidth = Math.max(0.7, (1.4 + score * 4.2) * widthByKind) / globalScale;
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = gradient;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }}
          onNodeDragEnd={(node) => {
            (node as { fx?: number; fy?: number }).fx = (node as { x: number }).x;
            (node as { fx?: number; fy?: number }).fy = (node as { y: number }).y;
          }}
          onNodeHover={(node) => {
            if (node) {
              const n = node as GraphNodeWithViz;
              const nodeKind = String(n.kind);
              setActiveHoverCard({
                id: `node:${String(n.id)}`,
                type: "node",
                nodeColor: getNodeColor(nodeKind),
                nodeName: String(n.label ?? n.id),
                nodeKindLabel: getNodeLabel(nodeKind),
                scoreText: `${(n.score * 100).toFixed(0)}%`
              });
            } else {
              setActiveHoverCard((prev) => (prev?.id.startsWith("node:") ? null : prev));
            }
          }}
          onNodeClick={(node) => {
            const n = node as GraphNodeWithViz;
            const nodeKind = String(n.kind);
            addPinnedHoverCard({
              id: `node:${String(n.id)}`,
              type: "node",
              nodeColor: getNodeColor(nodeKind),
              nodeName: String(n.label ?? n.id),
              nodeKindLabel: getNodeLabel(nodeKind),
              scoreText: `${(n.score * 100).toFixed(0)}%`
            });
          }}
          onLinkHover={(link) => {
            if (!link) {
              setActiveHoverCard((prev) => (prev?.id.startsWith("edge:") ? null : prev));
              return;
            }
            const current = link as GraphLinkWithViz;
            const source = current.source as GraphNodeWithViz;
            const target = current.target as GraphNodeWithViz;
            if (!source || !target || typeof source === "string" || typeof target === "string") {
              setActiveHoverCard((prev) => (prev?.id.startsWith("edge:") ? null : prev));
              return;
            }
            const score = (current.score ?? current.confidence ?? 0.5) * 100;
            const confidence = (current.confidence ?? 0.5) * 100;
            setActiveHoverCard({
              id: `edge:${String(source.id)}:${String(target.id)}:${current.relation}`,
              type: "edge",
              relation: current.relation,
              sourceName: String(source.label ?? source.id),
              sourceKindLabel: getNodeLabel(String(source.kind)),
              sourceColor: getNodeColor(String(source.kind)),
              destinationName: String(target.label ?? target.id),
              destinationKindLabel: getNodeLabel(String(target.kind)),
              destinationColor: getNodeColor(String(target.kind)),
              scoreText: `${score.toFixed(0)}%`,
              confidenceText: `${confidence.toFixed(0)}%`
            });
          }}
          onLinkClick={(link) => {
            const current = link as GraphLinkWithViz;
            const source = current.source as GraphNodeWithViz;
            const target = current.target as GraphNodeWithViz;
            if (!source || !target || typeof source === "string" || typeof target === "string") {
              setPinnedHoverCards([]);
              setActiveHoverCard(null);
              return;
            }
            const score = (current.score ?? current.confidence ?? 0.5) * 100;
            const confidence = (current.confidence ?? 0.5) * 100;
            addPinnedHoverCard({
              id: `edge:${String(source.id)}:${String(target.id)}:${current.relation}`,
              type: "edge",
              relation: current.relation,
              sourceName: String(source.label ?? source.id),
              sourceKindLabel: getNodeLabel(String(source.kind)),
              sourceColor: getNodeColor(String(source.kind)),
              destinationName: String(target.label ?? target.id),
              destinationKindLabel: getNodeLabel(String(target.kind)),
              destinationColor: getNodeColor(String(target.kind)),
              scoreText: `${score.toFixed(0)}%`,
              confidenceText: `${confidence.toFixed(0)}%`
            });
          }}
          onBackgroundClick={() => {
            setPinnedHoverCards([]);
            setActiveHoverCard(null);
          }}
          backgroundColor="rgba(255,255,255,0)"
        />
        {mergedHoverCards.length > 0 ? (
          <div className="pointer-events-none absolute bottom-2 left-2 right-2 grid grid-cols-1 gap-2 md:grid-cols-3">
            {mergedHoverCards.map((card) => (
              <div
                key={card.id}
                className={
                  card.type === "edge"
                    ? "min-w-0 rounded px-3 py-2 text-xs text-white shadow"
                    : "min-w-0 rounded px-3 py-2 text-xs text-white shadow"
                }
                style={
                  card.type === "node"
                    ? { backgroundColor: withAlpha(card.nodeColor ?? "#6b7280", 0.8) }
                    : { backgroundColor: "rgba(31, 35, 41, 0.8)" }
                }
              >
                {card.type === "edge" ? (
                  <div className="space-y-1">
                    <p className="truncate font-semibold">Relation: {card.relation}</p>
                    <p className="truncate">
                      Source:{" "}
                      <span style={{ color: card.sourceColor }}>
                        {card.sourceName} ({card.sourceKindLabel})
                      </span>
                    </p>
                    <p className="truncate">
                      Destination:{" "}
                      <span style={{ color: card.destinationColor }}>
                        {card.destinationName} ({card.destinationKindLabel})
                      </span>
                    </p>
                    <p>Score: {card.scoreText}</p>
                    <p>Confidence: {card.confidenceText}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="truncate font-semibold">Node: {card.nodeName}</p>
                    <p className="truncate">Kind: {card.nodeKindLabel}</p>
                    <p>Score: {card.scoreText}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <aside className="relative z-10 flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-3 dark:border-[#3a404a] dark:bg-[#1d2127] lg:h-full lg:w-64">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Graph settings
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={openAdvancedSettings}
              className={`inline-flex h-7 w-7 items-center justify-center rounded-md border text-gray-600 hover:border-[#f69e25] hover:text-[#f69e25] dark:text-gray-200 ${
                showAdvancedSettings
                  ? "border-[#f69e25] bg-[#f69e25]/10 dark:bg-[#f69e25]/20"
                  : "border-gray-300 dark:border-[#4a515c] dark:bg-[#343a43]"
              }`}
              title="Advanced settings"
              aria-label="Advanced settings"
              aria-pressed={showAdvancedSettings}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <circle cx="9" cy="6" r="2" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <circle cx="15" cy="12" r="2" />
                <line x1="4" y1="18" x2="20" y2="18" />
                <circle cx="11" cy="18" r="2" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                setLayoutMode("default");
                setNodeKindEnabled((prev) =>
                  Object.fromEntries(Object.keys(prev).map((key) => [key, true]))
                );
                setEdgeTypeEnabled((prev) =>
                  Object.fromEntries(Object.keys(prev).map((key) => [key, true]))
                );
                setSourceCountRangeByType((prev) =>
                  Object.fromEntries(
                    Object.keys(prev).map((key) => [
                      key,
                      { min: 0, max: edgeCountLimitsByType[key]?.sourceMax ?? 0 }
                    ])
                  )
                );
                setDestinationCountRangeByType((prev) =>
                  Object.fromEntries(
                    Object.keys(prev).map((key) => [
                      key,
                      { min: 0, max: edgeCountLimitsByType[key]?.destinationMax ?? 0 }
                    ])
                  )
                );
                setScoreRangeByType((prev) =>
                  Object.fromEntries(Object.keys(prev).map((key) => [key, { min: 0, max: 1 }]))
                );
                setNodeNameFilterByKind((prev) =>
                  Object.fromEntries(Object.keys(prev).map((key) => [key, "*"]))
                );
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:border-[#f69e25] hover:text-[#f69e25] dark:border-[#4a515c] dark:bg-[#343a43] dark:text-gray-200"
              title="Reset filters"
              aria-label="Reset filters"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M3 12a9 9 0 0 1 15.55-6.36L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15.55 6.36L3 16" />
                <path d="M8 16H3v5" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-3 overflow-y-auto overflow-x-hidden pr-1 lg:min-h-0 lg:flex-1">
        <div className="mt-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Layout
          </p>
          <select
            value={layoutMode}
            onChange={(e) => setLayoutMode(e.target.value as LayoutMode)}
            className="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-[#4a515c] dark:bg-[#343a43] dark:text-gray-200"
          >
            <option value="default">Default</option>
            <option value="td">Top-down</option>
            <option value="bu">Bottom-up</option>
            <option value="lr">Left-right</option>
            <option value="rl">Right-left</option>
            <option value="radialin">Radial in</option>
            <option value="radialout">Radial out</option>
          </select>
        </div>

        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Node
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {nodeKinds.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() =>
                  setNodeKindEnabled((prev) => ({ ...prev, [kind]: !prev[kind] }))
                }
                className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs transition ${
                  nodeKindEnabled[kind] ?? true
                    ? "border-[#f69e25] bg-[#f69e25]/10 text-[#c47a1a] dark:bg-[#f69e25]/20 dark:text-[#f69e25]"
                    : "border-gray-300 bg-white text-gray-600 dark:border-[#4a515c] dark:bg-[#343a43] dark:text-gray-300"
                }`}
                aria-pressed={nodeKindEnabled[kind] ?? true}
              >
            <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: getNodeColor(kind) }}
                />
                {getNodeLabel(kind)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Edge
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {edgeTypes.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">No edge types</p>
            ) : (
              edgeTypes.map((relation) => (
                <button
                  key={`edge-config-${relation}`}
                  type="button"
                  onClick={() =>
                    setEdgeTypeEnabled((prev) => ({
                      ...prev,
                      [relation]: !(prev[relation] ?? true)
                    }))
                  }
                  className={`min-w-0 shrink rounded-md border px-2 py-1 text-left text-xs transition ${
                    edgeTypeEnabled[relation] ?? true
                      ? "border-[#f69e25] bg-[#f69e25]/10 text-[#c47a1a] dark:bg-[#f69e25]/20 dark:text-[#f69e25]"
                      : "border-gray-300 bg-white text-gray-600 dark:border-[#4a515c] dark:bg-[#343a43] dark:text-gray-300"
                  }`}
                  aria-pressed={edgeTypeEnabled[relation] ?? true}
                  title={relation}
                >
                  <span className="line-clamp-1 break-all">{relation}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="mt-3 rounded-md border border-gray-200 p-2 dark:border-[#4a515c]">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Filter info
          </p>
          <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-300">
            Node: {enabledNodeLabels.length > 0 ? enabledNodeLabels.join(", ") : "none"}
          </p>
          <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-300">
            Name filter:{" "}
            {nodeKinds.map((kind) => `${getNodeLabel(kind)}=${nodeNameFilterByKind[kind] ?? "*"}`).join(" | ")}
          </p>
          <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-300">
            Edge: {enabledEdgeTypes.length > 0 ? enabledEdgeTypes.join(", ") : "none"}
          </p>
        </div>

        </div>
      </aside>
      {showAdvancedSettings && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-200 flex items-center justify-center bg-black/40 p-4"
              onClick={closeAdvancedSettings}
            >
              <div
                className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-[#4a515c] dark:bg-[#1d2127]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-[#4a515c]">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    Advanced Option
                  </p>
                  <button
                    type="button"
                    onClick={closeAdvancedSettings}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:border-[#f69e25] hover:text-[#f69e25] dark:border-[#4a515c] dark:bg-[#343a43] dark:text-gray-200"
                    aria-label="Close advanced settings"
                    title="Close advanced settings"
                  >
                    ×
                  </button>
                </div>

                <div className="overflow-y-auto p-4">
                  <div className="space-y-3">
                    <div className="rounded-md border border-gray-200 p-3 dark:border-[#4a515c]">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Node name filter by type
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                        Use ";" to separate patterns. "*" wildcard is supported. Default is "*".
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                        {nodeKinds.map((kind) => (
                          <label key={`node-name-filter-${kind}`} className="flex flex-col gap-1">
                            <span className="text-[11px] text-gray-600 dark:text-gray-300">
                              {getNodeLabel(kind)}
            </span>
                            <input
                              type="text"
                              value={draftNodeNameFilterByKind[kind] ?? "*"}
                              onChange={(e) => {
                                const nextValue = e.currentTarget.value;
                                setDraftNodeNameFilterByKind((prev) => ({
                                  ...prev,
                                  [kind]: nextValue
                                }));
                              }}
                              placeholder="*"
                              className="h-8 rounded border border-gray-300 bg-white px-2 text-xs text-gray-700 outline-none focus:border-[#f69e25] dark:border-[#4a515c] dark:bg-[#343a43] dark:text-gray-200"
                            />
                          </label>
          ))}
        </div>
      </div>

                    <div className="rounded-md border border-gray-200 p-3 dark:border-[#4a515c]">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Edge filter by type
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                        {edgeTypes.length === 0 ? (
                          <p className="text-xs text-gray-500 dark:text-gray-400">No edge types</p>
                        ) : (
                          edgeTypes.map((relation) => (
                            <div
                              key={`advanced-${relation}`}
                              className="rounded-md border border-gray-200 p-2 dark:border-[#4a515c]"
                            >
                              <p className="line-clamp-1 break-all text-xs font-medium text-gray-700 dark:text-gray-300">
                                {relation}
                              </p>
                              <div className="mt-1.5 space-y-2">
                                <div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                      source count
                                    </span>
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                      {(draftSourceCountRangeByType[relation]?.min ?? 0).toFixed(0)} -{" "}
                                      {(draftSourceCountRangeByType[relation]?.max ??
                                        edgeCountLimitsByType[relation]?.sourceMax ??
                                        0
                                      ).toFixed(0)}
                                    </span>
                                  </div>
                                  <div className="relative mt-1 h-6">
                                    <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gray-300 dark:bg-[#4a515c]" />
                                    <div
                                      className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#f69e25]"
                                      style={{
                                        left: `${((draftSourceCountRangeByType[relation]?.min ?? 0) / Math.max(1, edgeCountLimitsByType[relation]?.sourceMax ?? 0)) * 100}%`,
                                        right: `${100 - (((draftSourceCountRangeByType[relation]?.max ??
                                          edgeCountLimitsByType[relation]?.sourceMax ??
                                          0) /
                                          Math.max(1, edgeCountLimitsByType[relation]?.sourceMax ?? 0)) *
                                          100)}%`
                                      }}
                                    />
                                    <input
                                      type="range"
                                      min={0}
                                      max={Math.max(0, edgeCountLimitsByType[relation]?.sourceMax ?? 0)}
                                      step={1}
                                      value={Math.max(0, draftSourceCountRangeByType[relation]?.min ?? 0)}
                                      onChange={(e) => {
                                        const min = Number(e.currentTarget.value);
                                        setDraftSourceCountRangeByType((prev) => {
                                          const limit = edgeCountLimitsByType[relation]?.sourceMax ?? 0;
                                          const current = clampCountRange(prev[relation], limit);
                                          return {
                                            ...prev,
                                            [relation]: {
                                              min: Math.max(0, Math.min(min, current.max)),
                                              max: current.max
                                            }
                                          };
                                        });
                                      }}
                                      className="tdp-range-thumb absolute inset-0 w-full appearance-none bg-transparent"
                                    />
                                    <input
                                      type="range"
                                      min={0}
                                      max={Math.max(0, edgeCountLimitsByType[relation]?.sourceMax ?? 0)}
                                      step={1}
                                      value={
                                        draftSourceCountRangeByType[relation]?.max ??
                                        edgeCountLimitsByType[relation]?.sourceMax ??
                                        0
                                      }
                                      onChange={(e) => {
                                        const max = Number(e.currentTarget.value);
                                        setDraftSourceCountRangeByType((prev) => {
                                          const limit = edgeCountLimitsByType[relation]?.sourceMax ?? 0;
                                          const current = clampCountRange(prev[relation], limit);
                                          return {
                                            ...prev,
                                            [relation]: {
                                              min: current.min,
                                              max: Math.min(limit, Math.max(max, current.min))
                                            }
                                          };
                                        });
                                      }}
                                      className="tdp-range-thumb absolute inset-0 w-full appearance-none bg-transparent"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                      destination count
                                    </span>
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                      {(draftDestinationCountRangeByType[relation]?.min ?? 0).toFixed(0)} -{" "}
                                      {(draftDestinationCountRangeByType[relation]?.max ??
                                        edgeCountLimitsByType[relation]?.destinationMax ??
                                        0
                                      ).toFixed(0)}
                                    </span>
                                  </div>
                                  <div className="relative mt-1 h-6">
                                    <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gray-300 dark:bg-[#4a515c]" />
                                    <div
                                      className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#f69e25]"
                                      style={{
                                        left: `${((draftDestinationCountRangeByType[relation]?.min ?? 0) / Math.max(1, edgeCountLimitsByType[relation]?.destinationMax ?? 0)) * 100}%`,
                                        right: `${100 - (((draftDestinationCountRangeByType[relation]?.max ??
                                          edgeCountLimitsByType[relation]?.destinationMax ??
                                          0) /
                                          Math.max(1, edgeCountLimitsByType[relation]?.destinationMax ?? 0)) *
                                          100)}%`
                                      }}
                                    />
                                    <input
                                      type="range"
                                      min={0}
                                      max={Math.max(0, edgeCountLimitsByType[relation]?.destinationMax ?? 0)}
                                      step={1}
                                      value={Math.max(0, draftDestinationCountRangeByType[relation]?.min ?? 0)}
                                      onChange={(e) => {
                                        const min = Number(e.currentTarget.value);
                                        setDraftDestinationCountRangeByType((prev) => {
                                          const limit =
                                            edgeCountLimitsByType[relation]?.destinationMax ?? 0;
                                          const current = clampCountRange(prev[relation], limit);
                                          return {
                                            ...prev,
                                            [relation]: {
                                              min: Math.max(0, Math.min(min, current.max)),
                                              max: current.max
                                            }
                                          };
                                        });
                                      }}
                                      className="tdp-range-thumb absolute inset-0 w-full appearance-none bg-transparent"
                                    />
                                    <input
                                      type="range"
                                      min={0}
                                      max={Math.max(0, edgeCountLimitsByType[relation]?.destinationMax ?? 0)}
                                      step={1}
                                      value={
                                        draftDestinationCountRangeByType[relation]?.max ??
                                        edgeCountLimitsByType[relation]?.destinationMax ??
                                        0
                                      }
                                      onChange={(e) => {
                                        const max = Number(e.currentTarget.value);
                                        setDraftDestinationCountRangeByType((prev) => {
                                          const limit =
                                            edgeCountLimitsByType[relation]?.destinationMax ?? 0;
                                          const current = clampCountRange(prev[relation], limit);
                                          return {
                                            ...prev,
                                            [relation]: {
                                              min: current.min,
                                              max: Math.min(limit, Math.max(max, current.min))
                                            }
                                          };
                                        });
                                      }}
                                      className="tdp-range-thumb absolute inset-0 w-full appearance-none bg-transparent"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                      score
                                    </span>
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                      {(draftScoreRangeByType[relation]?.min ?? 0).toFixed(2)} -{" "}
                                      {(draftScoreRangeByType[relation]?.max ?? 1).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="relative mt-1 h-6">
                                    <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gray-300 dark:bg-[#4a515c]" />
                                    <div
                                      className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#f69e25]"
                                      style={{
                                        left: `${(draftScoreRangeByType[relation]?.min ?? 0) * 100}%`,
                                        right: `${100 - (draftScoreRangeByType[relation]?.max ?? 1) * 100}%`
                                      }}
                                    />
                                    <input
                                      type="range"
                                      min={0}
                                      max={1}
                                      step={0.01}
                                      value={draftScoreRangeByType[relation]?.min ?? 0}
                                      onChange={(e) => {
                                        const min = Number(e.currentTarget.value);
                                        setDraftScoreRangeByType((prev) => {
                                          const current = prev[relation] ?? { min: 0, max: 1 };
                                          return {
                                            ...prev,
                                            [relation]: {
                                              min,
                                              max: Math.max(min, current.max)
                                            }
                                          };
                                        });
                                      }}
                                      className="tdp-range-thumb absolute inset-0 w-full appearance-none bg-transparent"
                                    />
                                    <input
                                      type="range"
                                      min={0}
                                      max={1}
                                      step={0.01}
                                      value={draftScoreRangeByType[relation]?.max ?? 1}
                                      onChange={(e) => {
                                        const max = Number(e.currentTarget.value);
                                        setDraftScoreRangeByType((prev) => {
                                          const current = prev[relation] ?? { min: 0, max: 1 };
                                          return {
                                            ...prev,
                                            [relation]: {
                                              min: Math.min(current.min, max),
                                              max
                                            }
                                          };
                                        });
                                      }}
                                      className="tdp-range-thumb absolute inset-0 w-full appearance-none bg-transparent"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-4 py-3 dark:border-[#4a515c]">
                  <button
                    type="button"
                    onClick={closeAdvancedSettings}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:border-[#f69e25] hover:text-[#f69e25] dark:border-[#4a515c] dark:bg-[#343a43] dark:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyAdvancedSettings}
                    className="rounded-md border border-[#f69e25] bg-[#f69e25]/10 px-3 py-1.5 text-xs font-medium text-[#c47a1a] hover:bg-[#f69e25]/20 dark:text-[#f69e25]"
                  >
                    Apply
                  </button>
                </div>
      </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
