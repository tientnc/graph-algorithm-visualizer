import React, { useState, useEffect, useMemo } from 'react';
import { Node, Edge, AlgorithmType, VisualizationStep, Graph } from './types';
import { PRESETS } from './utils/presets';
import {
  generateBFS,
  generateDFS,
  generateDijkstra,
  generateAStar,
  generateBellmanFord,
  generateKruskal,
  generatePrim,
} from './utils/algorithms';
import GraphCanvas from './components/GraphCanvas';
import AlgorithmControls from './components/AlgorithmControls';
import ExplanationPanel from './components/ExplanationPanel';
import SampleLoader from './components/SampleLoader';
import { Network, HelpCircle, AlertCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Graph Canvas States initialized to 'Weighted Network' preset
  const initialPreset = PRESETS.weighted;
  const [nodes, setNodes] = useState<Node[]>(initialPreset.graph.nodes);
  const [edges, setEdges] = useState<Edge[]>(initialPreset.graph.edges);
  const [startNode, setStartNode] = useState<string>(initialPreset.startNode);
  const [endNode, setEndNode] = useState<string>(initialPreset.endNode);

  // Algorithm configuration
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('dijkstra');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(700);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [canvasMode, setCanvasMode] = useState<'select' | 'addNode' | 'addEdge' | 'setStart' | 'setEnd'>('select');

  // Load a preset graph structure
  const handleLoadPreset = (key: string) => {
    const preset = PRESETS[key];
    if (preset) {
      setNodes(preset.graph.nodes);
      setEdges(preset.graph.edges);
      setStartNode(preset.startNode);
      setEndNode(preset.endNode);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  };

  // Generate completely random connected graph
  const handleRandomGraph = () => {
    const count = Math.floor(Math.random() * 3) + 6; // 6 to 8 nodes
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const newNodes: Node[] = [];
    
    // Position nodes circularly or nicely spaced
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const x = Math.round(400 + 260 * Math.cos(angle) + (Math.random() * 40 - 20));
      const y = Math.round(250 + 170 * Math.sin(angle) + (Math.random() * 40 - 20));
      newNodes.push({
        id: alphabet[i],
        label: alphabet[i],
        x: Math.max(50, Math.min(750, x)),
        y: Math.max(50, Math.min(450, y)),
      });
    }

    // Connect them with random edges ensuring it is connected
    const newEdges: Edge[] = [];
    let edgeCounter = 1;

    for (let i = 0; i < count; i++) {
      // Connect each to next to form a loop (ensures connectivity)
      const nextIdx = (i + 1) % count;
      newEdges.push({
        id: `re${edgeCounter++}`,
        source: newNodes[i].id,
        target: newNodes[nextIdx].id,
        weight: Math.floor(Math.random() * 9) + 1,
        directed: false,
      });

      // Add a random cross connection with 40% probability
      if (Math.random() < 0.45) {
        const skipIdx = (i + 3) % count;
        if (skipIdx !== i && skipIdx !== nextIdx) {
          // Check redundancy
          const alreadyLinked = newEdges.some(e => 
            (e.source === newNodes[i].id && e.target === newNodes[skipIdx].id) ||
            (e.source === newNodes[skipIdx].id && e.target === newNodes[i].id)
          );
          if (!alreadyLinked) {
            newEdges.push({
              id: `re${edgeCounter++}`,
              source: newNodes[i].id,
              target: newNodes[skipIdx].id,
              weight: Math.floor(Math.random() * 9) + 1,
              directed: false,
            });
          }
        }
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setStartNode(newNodes[0].id);
    setEndNode(newNodes[Math.floor(count / 2)].id);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Clear canvas state completely
  const handleClearGraph = () => {
    setNodes([]);
    setEdges([]);
    setStartNode('');
    setEndNode('');
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Dynamic graph updates
  const handleAddNode = (label: string, x: number, y: number) => {
    const id = label;
    const newNode: Node = { id, label, x, y };
    setNodes((prev) => [...prev, newNode]);
    
    // Set as start or goal if there were none
    if (!startNode) setStartNode(id);
    else if (!endNode) setEndNode(id);
  };

  const handleAddEdge = (source: string, target: string, weight: number, directed: boolean) => {
    const id = `edge_${source}_${target}_${Date.now()}`;
    const newEdge: Edge = { id, source, target, weight, directed };
    setEdges((prev) => [...prev, newEdge]);
  };

  const handleUpdateEdge = (id: string, weight: number, directed: boolean) => {
    setEdges((prev) =>
      prev.map((e) => (e.id === id ? { ...e, weight, directed } : e))
    );
  };

  const handleDeleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
    
    // Clean up start / goal if they were deleted
    if (startNode === id) setStartNode('');
    if (endNode === id) setEndNode('');
  };

  const handleDeleteEdge = (id: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== id));
  };

  const handleUpdateNodePosition = (id: string, x: number, y: number) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x, y } : n))
    );
  };

  // Compute all visualization steps dynamically based on current graph and selections
  const steps: VisualizationStep[] = useMemo(() => {
    const graph: Graph = { nodes, edges };
    if (nodes.length === 0) return [];

    switch (selectedAlgorithm) {
      case 'bfs':
        return generateBFS(graph, startNode, endNode);
      case 'dfs':
        return generateDFS(graph, startNode, endNode);
      case 'dijkstra':
        return generateDijkstra(graph, startNode, endNode);
      case 'astar':
        return generateAStar(graph, startNode, endNode);
      case 'bellmanFord':
        return generateBellmanFord(graph, startNode);
      case 'kruskal':
        return generateKruskal(graph);
      case 'prim':
        return generatePrim(graph, startNode);
      default:
        return [];
    }
  }, [nodes, edges, startNode, endNode, selectedAlgorithm]);

  // Handle auto calculation boundary safety
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [selectedAlgorithm, startNode, endNode, nodes.length, edges.length]);

  // Timing/Interval playback mechanism
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, steps.length, speed]);

  const currentStep = steps[currentStepIndex] || null;

  // Compute description history log for display
  const narrationHistory = useMemo(() => {
    return steps.slice(0, currentStepIndex + 1).map((step, idx) => ({
      index: idx,
      description: step.description,
    }));
  }, [steps, currentStepIndex]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* 1. Header Banner */}
      <header className="border-b border-slate-900 bg-slate-950 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/10 p-2.5 rounded-xl border border-indigo-500/20 shadow-inner">
            <Network className="text-indigo-400 w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-100 font-mono">Graph Pathfinders</h1>
            <p className="text-3xs text-indigo-400/80 font-mono font-medium tracking-wide">Interactive Algorithm Playground</p>
          </div>
        </div>

        {/* Informational help badges */}
        <div className="flex items-center gap-3">
          <div className="text-slate-500 text-3xs font-medium bg-slate-900/60 py-1.5 px-3 rounded-lg border border-slate-800 flex items-center gap-1.5">
            <HelpCircle size={12} className="text-slate-400" />
            <span>Double-click nodes/edges to delete</span>
          </div>
          <div className="text-slate-500 text-3xs font-medium bg-slate-900/60 py-1.5 px-3 rounded-lg border border-slate-800 flex items-center gap-1.5">
            <BookOpen size={12} className="text-indigo-400" />
            <span>Select/Drag to adjust layout</span>
          </div>
        </div>
      </header>

      {/* 2. Main Visual Workspace (Single-Screen) */}
      <main className="flex-1 p-5 md:p-6 lg:p-7 flex flex-col gap-5 overflow-y-auto max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-5"
        >
          {/* Top Panel: Loaded Map Presets and Active Mode selections */}
          <SampleLoader
            onLoadPreset={handleLoadPreset}
            activeMode={canvasMode}
            onChangeMode={setCanvasMode}
            onClear={handleClearGraph}
            onRandomGraph={handleRandomGraph}
          />

          {/* Core Interactive Graph Canvas workspace */}
          <div className="flex flex-col xl:flex-row gap-5">
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              startNode={startNode}
              endNode={endNode}
              visualState={currentStep?.state || null}
              mode={canvasMode}
              onAddNode={handleAddNode}
              onAddEdge={handleAddEdge}
              onUpdateEdge={handleUpdateEdge}
              onDeleteNode={handleDeleteNode}
              onDeleteEdge={handleDeleteEdge}
              onUpdateNodePosition={handleUpdateNodePosition}
              onSetStartNode={setStartNode}
              onSetEndNode={setEndNode}
            />
          </div>

          {/* Boundary checks / warning if no graph exists */}
          {nodes.length === 0 && (
            <div className="bg-slate-900 border border-amber-900/30 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="text-amber-500 shrink-0" size={18} />
              <p className="text-xs text-amber-300/85">
                The canvas is empty. Use the tool belt above to place custom nodes and link them, or click 
                <button onClick={() => handleLoadPreset('weighted')} className="underline font-bold text-amber-400 hover:text-amber-300 ml-1">Weighted Network</button> to load a sample.
              </p>
            </div>
          )}

          {/* Playback Controls Panel */}
          <AlgorithmControls
            selectedAlgorithm={selectedAlgorithm}
            onSelectAlgorithm={setSelectedAlgorithm}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying((p) => !p)}
            onStepForward={() => setCurrentStepIndex((p) => Math.min(steps.length - 1, p + 1))}
            onStepBackward={() => setCurrentStepIndex((p) => Math.max(0, p - 1))}
            onReset={() => setCurrentStepIndex(0)}
            speed={speed}
            onSpeedChange={setSpeed}
            currentStepIndex={currentStepIndex}
            totalSteps={steps.length}
          />

          {/* Logic explanation, Pseudocode highlighting, and Narration Trace log lines */}
          <ExplanationPanel
            algorithm={selectedAlgorithm}
            currentStep={currentStep}
            history={narrationHistory}
            currentStepIndex={currentStepIndex}
          />
        </motion.div>
      </main>

      {/* 3. Humble Footer */}
      <footer className="border-t border-slate-900/60 bg-slate-950 px-6 py-4 text-center">
        <p className="text-3xs text-slate-600 font-mono">
          Graph Algorithm Visualizer &bull; Built in React with Tailwind & Framer Motion
        </p>
      </footer>
    </div>
  );
}
