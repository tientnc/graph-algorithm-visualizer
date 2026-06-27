export interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface Edge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  weight: number;
  directed: boolean;
}

export type AlgorithmType = 'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'bellmanFord' | 'kruskal' | 'prim';

export interface VisualState {
  nodeStates: Record<string, 'default' | 'current' | 'visiting' | 'visited' | 'path' | 'obstacle'>;
  edgeStates: Record<string, 'default' | 'visiting' | 'visited' | 'path'>;
  distances?: Record<string, number | typeof Infinity>;
  parents?: Record<string, string | null>;
  queueState?: string[]; // nodes currently in Queue/Stack
  mstEdges?: string[]; // edge IDs in MST
}

export interface VisualizationStep {
  description: string;
  state: VisualState;
  highlightLines: number[]; // code lines to highlight
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}
