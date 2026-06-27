import React, { useRef, useState, useEffect } from 'react';
import { Node, Edge, VisualState } from '../types';
import { Plus, Trash2, ArrowRightLeft, ArrowRight, Settings, HelpCircle } from 'lucide-react';

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  startNode: string;
  endNode: string;
  visualState: VisualState | null;
  mode: 'select' | 'addNode' | 'addEdge' | 'setStart' | 'setEnd';
  onAddNode: (label: string, x: number, y: number) => void;
  onAddEdge: (source: string, target: string, weight: number, directed: boolean) => void;
  onUpdateEdge: (id: string, weight: number, directed: boolean) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onUpdateNodePosition: (id: string, x: number, y: number) => void;
  onSetStartNode: (id: string) => void;
  onSetEndNode: (id: string) => void;
}

export default function GraphCanvas({
  nodes,
  edges,
  startNode,
  endNode,
  visualState,
  mode,
  onAddNode,
  onAddEdge,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
  onUpdateNodePosition,
  onSetStartNode,
  onSetEndNode,
}: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [edgeSourceId, setEdgeSourceId] = useState<string | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle outside click to clear editing/active states
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (editingEdgeId) {
        setEditingEdgeId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [editingEdgeId]);

  const getSVGCoordinates = (e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    // Standardize to 800x500 coordinates inside the viewBox
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 500;
    return { x: Math.round(x), y: Math.round(y) };
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode === 'addNode') {
      const { x, y } = getSVGCoordinates(e);
      // Check if click is too close to another node
      const tooClose = nodes.some(n => Math.hypot(n.x - x, n.y - y) < 45);
      if (!tooClose && x > 20 && x < 780 && y > 20 && y < 480) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const usedLabels = new Set(nodes.map(n => n.label));
        // Find first unused label
        let label = '';
        for (let i = 0; i < 100; i++) {
          const nextLabel = i < 26 ? letters[i] : `N${i}`;
          if (!usedLabels.has(nextLabel)) {
            label = nextLabel;
            break;
          }
        }
        onAddNode(label, x, y);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getSVGCoordinates(e);
    setMousePos(coords);

    if (draggingNodeId) {
      // Keep within bounds
      const x = Math.max(25, Math.min(775, coords.x - dragOffset.x));
      const y = Math.max(25, Math.min(475, coords.y - dragOffset.y));
      onUpdateNodePosition(draggingNodeId, x, y);
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: Node) => {
    e.stopPropagation();
    if (mode === 'select' || mode === 'addNode' || mode === 'setStart' || mode === 'setEnd') {
      const coords = getSVGCoordinates(e as unknown as React.MouseEvent<SVGSVGElement>);
      setDraggingNodeId(node.id);
      setDragOffset({
        x: coords.x - node.x,
        y: coords.y - node.y
      });
    } else if (mode === 'addEdge') {
      setEdgeSourceId(node.id);
    }
  };

  const handleNodeMouseUp = (e: React.MouseEvent, node: Node) => {
    e.stopPropagation();
    if (draggingNodeId) {
      setDraggingNodeId(null);
    } else if (mode === 'addEdge' && edgeSourceId && edgeSourceId !== node.id) {
      // Check if edge already exists
      const edgeExists = edges.some(edge => 
        (edge.source === edgeSourceId && edge.target === node.id) ||
        (!edge.directed && edge.source === node.id && edge.target === edgeSourceId)
      );
      if (!edgeExists) {
        onAddEdge(edgeSourceId, node.id, 5, false);
      }
      setEdgeSourceId(null);
    } else if (mode === 'setStart') {
      onSetStartNode(node.id);
    } else if (mode === 'setEnd') {
      onSetEndNode(node.id);
    }
  };

  const handleGlobalMouseUp = () => {
    if (draggingNodeId) setDraggingNodeId(null);
    if (edgeSourceId) setEdgeSourceId(null);
  };

  const getNodeColorClass = (id: string) => {
    const isStart = id === startNode;
    const isEnd = id === endNode;
    const state = visualState?.nodeStates[id] || 'default';

    switch (state) {
      case 'current':
        return {
          bg: 'fill-amber-400 stroke-amber-600',
          ring: 'stroke-amber-400/50 animate-ping',
          text: 'fill-slate-900 font-bold',
        };
      case 'visiting':
        return {
          bg: 'fill-sky-100 stroke-sky-500 stroke-2',
          ring: 'stroke-sky-300/60 animate-pulse',
          text: 'fill-sky-900 font-medium',
        };
      case 'visited':
        return {
          bg: 'fill-indigo-600 stroke-indigo-800',
          ring: 'stroke-indigo-400/20',
          text: 'fill-white font-medium',
        };
      case 'path':
        return {
          bg: 'fill-emerald-500 stroke-emerald-700',
          ring: 'stroke-emerald-400/40 animate-pulse',
          text: 'fill-white font-bold',
        };
      case 'obstacle':
        return {
          bg: 'fill-rose-500 stroke-rose-700',
          ring: 'stroke-rose-400/30',
          text: 'fill-white font-medium',
        };
      default:
        if (isStart) {
          return {
            bg: 'fill-emerald-50 stroke-emerald-600 stroke-2',
            ring: 'stroke-emerald-300/40',
            text: 'fill-emerald-900 font-semibold',
          };
        }
        if (isEnd) {
          return {
            bg: 'fill-rose-50 stroke-rose-600 stroke-2',
            ring: 'stroke-rose-300/40',
            text: 'fill-rose-900 font-semibold',
          };
        }
        return {
          bg: 'fill-slate-50 stroke-slate-300 hover:fill-slate-100 transition-colors',
          ring: 'stroke-transparent',
          text: 'fill-slate-700',
        };
    }
  };

  const getEdgeStyle = (edge: Edge) => {
    const state = visualState?.edgeStates[edge.id] || 'default';
    switch (state) {
      case 'visiting':
        return {
          stroke: '#0ea5e9',
          strokeWidth: 3,
          strokeDasharray: '5,5',
        };
      case 'visited':
        return {
          stroke: '#6366f1',
          strokeWidth: 3,
        };
      case 'path':
        return {
          stroke: '#10b981',
          strokeWidth: 4.5,
        };
      default:
        return {
          stroke: '#cbd5e1',
          strokeWidth: 2,
        };
    }
  };

  return (
    <div id="canvas-container" className="relative flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner flex flex-col h-[500px]">
      {/* Canvas Top Bar Controls & Mode Status Info */}
      <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-center pointer-events-none">
        <div className="bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 shadow-md text-xs text-slate-300 flex items-center gap-2 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            {mode === 'select' && 'Select/Drag nodes or double-click nodes to delete'}
            {mode === 'addNode' && 'Click in empty area to create a new node'}
            {mode === 'addEdge' && 'Click & drag from source node to target node'}
            {mode === 'setStart' && 'Click a node to set as Start Point'}
            {mode === 'setEnd' && 'Click a node to set as Goal Point'}
          </span>
        </div>

        {/* Legend */}
        <div className="bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-800 shadow-md text-2xs text-slate-400 flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600"></span>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-100 border border-sky-400"></span>
            <span>Visiting</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 border border-indigo-800"></span>
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-700"></span>
            <span>Path</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Workspace */}
      <svg
        id="graph-svg-canvas"
        ref={svgRef}
        viewBox="0 0 800 500"
        className="w-full h-full select-none"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleGlobalMouseUp}
      >
        <defs>
          {/* Directed edge arrow markers */}
          <marker id="arrow-default" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#cbd5e1" />
          </marker>
          <marker id="arrow-visiting" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0ea5e9" />
          </marker>
          <marker id="arrow-visited" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
          </marker>
          <marker id="arrow-path" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
          </marker>
        </defs>

        {/* Draw Edges */}
        {edges.map((edge) => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;

          const style = getEdgeStyle(edge);
          const markerId = edge.directed
            ? `url(#arrow-${visualState?.edgeStates[edge.id] || 'default'})`
            : undefined;

          const midX = (sourceNode.x + targetNode.x) / 2;
          const midY = (sourceNode.y + targetNode.y) / 2;

          return (
            <g
              key={edge.id}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredEdgeId(edge.id)}
              onMouseLeave={() => setHoveredEdgeId(null)}
              onClick={(e) => {
                e.stopPropagation();
                setEditingEdgeId(edge.id);
              }}
            >
              {/* Invisible thicker interaction helper line */}
              <line
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke="transparent"
                strokeWidth={14}
              />
              <line
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                {...style}
                markerEnd={markerId}
                className="transition-all duration-300"
              />

              {/* Edge Weight Value Box */}
              <g transform={`translate(${midX}, ${midY})`} className="pointer-events-auto">
                <rect
                  x={-18}
                  y={-10}
                  width={36}
                  height={20}
                  rx={4}
                  className="fill-slate-950 stroke-slate-800 shadow"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-slate-200 text-3xs font-semibold font-mono"
                >
                  {edge.weight}
                </text>
              </g>

              {/* Quick weight edit popup button / settings panel if hovered */}
              {hoveredEdgeId === edge.id && !editingEdgeId && (
                <g transform={`translate(${midX}, ${midY - 25})`} className="pointer-events-auto">
                  <rect
                    x={-45}
                    y={-12}
                    width={90}
                    height={24}
                    rx={6}
                    className="fill-slate-950 stroke-slate-700 shadow-lg"
                  />
                  <g transform="translate(-30, 0)" onClick={(e) => {
                    e.stopPropagation();
                    onUpdateEdge(edge.id, edge.weight + 1, edge.directed);
                  }}>
                    <circle r={7} className="fill-slate-800 stroke-slate-600 hover:fill-slate-700 cursor-pointer" />
                    <text textAnchor="middle" dominantBaseline="central" className="fill-slate-200 text-3xs pointer-events-none font-bold">+</text>
                  </g>
                  <g transform="translate(-12, 0)" onClick={(e) => {
                    e.stopPropagation();
                    onUpdateEdge(edge.id, Math.max(-20, edge.weight - 1), edge.directed);
                  }}>
                    <circle r={7} className="fill-slate-800 stroke-slate-600 hover:fill-slate-700 cursor-pointer" />
                    <text textAnchor="middle" dominantBaseline="central" className="fill-slate-200 text-3xs pointer-events-none font-bold">-</text>
                  </g>
                  <g transform="translate(10, 0)" onClick={(e) => {
                    e.stopPropagation();
                    onUpdateEdge(edge.id, edge.weight, !edge.directed);
                  }}>
                    <rect x={-8} y={-7} width={16} height={14} rx={2} className="fill-slate-800 stroke-slate-600 hover:fill-slate-700 cursor-pointer" />
                    <text textAnchor="middle" dominantBaseline="central" className="fill-slate-300 text-[8px] font-bold pointer-events-none">Dir</text>
                  </g>
                  <g transform="translate(32, 0)" onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEdge(edge.id);
                  }}>
                    <circle r={7} className="fill-rose-950 stroke-rose-800 hover:fill-rose-900 cursor-pointer" />
                    <text textAnchor="middle" dominantBaseline="central" className="fill-rose-300 text-[8px] pointer-events-none font-bold">x</text>
                  </g>
                </g>
              )}
            </g>
          );
        })}

        {/* Temporary Edge Drawing indicator */}
        {mode === 'addEdge' && edgeSourceId && (
          <line
            x1={nodes.find(n => n.id === edgeSourceId)?.x || 0}
            y1={nodes.find(n => n.id === edgeSourceId)?.y || 0}
            x2={mousePos.x}
            y2={mousePos.y}
            stroke="#0ea5e9"
            strokeWidth={2}
            strokeDasharray="4,4"
          />
        )}

        {/* Draw Nodes */}
        {nodes.map((node) => {
          const colors = getNodeColorClass(node.id);
          const isStart = node.id === startNode;
          const isEnd = node.id === endNode;

          return (
            <g
              key={node.id}
              className="cursor-grab active:cursor-grabbing"
              transform={`translate(${node.x}, ${node.y})`}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onMouseUp={(e) => handleNodeMouseUp(e, node)}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onDeleteNode(node.id);
              }}
            >
              {/* Outer pulsing ring for active modes */}
              <circle r={28} className={`fill-none stroke-2 ${colors.ring}`} />

              {/* Node core circle */}
              <circle r={18} className={`${colors.bg} shadow-md transition-colors duration-200`} />

              {/* Compact Node ID inside circle */}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-xs select-none pointer-events-none font-mono font-bold ${colors.text}`}
              >
                {node.id}
              </text>

              {/* Descriptive Node Label underneath */}
              {node.label && node.label !== node.id && (
                <g transform="translate(0, 30)">
                  {/* Background pill for text visibility on dark SVG canvas */}
                  <rect
                    x={-Math.max(28, node.label.length * 3.5 + 6)}
                    y={-8}
                    width={Math.max(56, node.label.length * 7 + 12)}
                    height={16}
                    rx={4}
                    className="fill-slate-950/95 stroke-slate-800/60 stroke"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-slate-200 text-[9px] font-sans font-semibold select-none pointer-events-none"
                  >
                    {node.label}
                  </text>
                </g>
              )}

              {/* Start / Goal Flag Tags */}
              {isStart && (
                <g transform="translate(0, -25)">
                  <rect x={-14} y={-6} width={28} height={12} rx={3} className="fill-emerald-500 stroke-none" />
                  <text textAnchor="middle" dominantBaseline="central" className="fill-white text-[8px] font-extrabold">START</text>
                </g>
              )}
              {isEnd && (
                <g transform="translate(0, -25)">
                  <rect x={-12} y={-6} width={24} height={12} rx={3} className="fill-rose-500 stroke-none" />
                  <text textAnchor="middle" dominantBaseline="central" className="fill-white text-[8px] font-extrabold">GOAL</text>
                </g>
              )}

              {/* Delete helper button if node is hovered and in selection mode */}
              {hoveredNodeId === node.id && mode === 'select' && (
                <g transform="translate(18, -18)" className="pointer-events-auto cursor-pointer" onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNode(node.id);
                }}>
                  <circle r={8} className="fill-rose-950 stroke-rose-800 hover:fill-rose-900" />
                  <text textAnchor="middle" dominantBaseline="central" className="fill-rose-300 text-[8px] font-extrabold font-sans">x</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Canvas Mode Quick Buttons */}
      <div className="absolute bottom-3 left-3 flex gap-2 pointer-events-auto">
        <div className="bg-slate-950/95 border border-slate-800 p-1 rounded-lg shadow-xl flex gap-1">
          <button
            onClick={() => onAddNode(`N${nodes.length + 1}`, Math.floor(Math.random() * 400 + 200), Math.floor(Math.random() * 200 + 150))}
            className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow"
          >
            <Plus size={13} />
            <span>Node</span>
          </button>
        </div>
      </div>
    </div>
  );
}
