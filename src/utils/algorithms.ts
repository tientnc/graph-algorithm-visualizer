import { Node, Edge, Graph, VisualizationStep, VisualState } from '../types';

// Helper to calculate Euclidean distance (heuristic for A*)
const getDistance = (n1: Node, n2: Node): number => {
  return Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2));
};

// Deep copy helper for visual state
const createInitialVisualState = (graph: Graph): VisualState => {
  const nodeStates: VisualState['nodeStates'] = {};
  const edgeStates: VisualState['edgeStates'] = {};
  graph.nodes.forEach((n) => {
    nodeStates[n.id] = 'default';
  });
  graph.edges.forEach((e) => {
    edgeStates[e.id] = 'default';
  });
  return { nodeStates, edgeStates, distances: {}, parents: {}, queueState: [] };
};

// Union-Find for Kruskal's
class DisjointSet {
  parent: Record<string, string> = {};

  constructor(nodes: Node[]) {
    nodes.forEach((n) => {
      this.parent[n.id] = n.id;
    });
  }

  find(id: string): string {
    if (this.parent[id] === id) return id;
    return this.parent[id] = this.find(this.parent[id]);
  }

  union(id1: string, id2: string): boolean {
    const r1 = this.find(id1);
    const r2 = this.find(id2);
    if (r1 !== r2) {
      this.parent[r1] = r2;
      return true;
    }
    return false;
  }
}

// 1. Breadth First Search (BFS)
export const generateBFS = (graph: Graph, startNodeId: string, endNodeId?: string): VisualizationStep[] => {
  const steps: VisualizationStep[] = [];
  const visualState = createInitialVisualState(graph);
  
  if (!startNodeId) return [];

  // Step 0: Initialize
  visualState.nodeStates[startNodeId] = 'visiting';
  visualState.queueState = [startNodeId];
  steps.push({
    description: `Initialize BFS from Node ${startNodeId}. Queue: [${startNodeId}]`,
    state: JSON.parse(JSON.stringify(visualState)),
    highlightLines: [1, 2],
  });

  const queue: string[] = [startNodeId];
  const visited = new Set<string>([startNodeId]);
  const parent: Record<string, string | null> = { [startNodeId]: null };

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    visualState.nodeStates[currentId] = 'current';
    visualState.queueState = [...queue];
    
    steps.push({
      description: `Dequeue and examine Node ${currentId}.`,
      state: JSON.parse(JSON.stringify(visualState)),
      highlightLines: [3, 4],
    });

    if (currentId === endNodeId) {
      visualState.nodeStates[currentId] = 'path';
      let curr = currentId;
      const pathNodes = [curr];
      while (parent[curr]) {
        const p = parent[curr]!;
        visualState.nodeStates[p] = 'path';
        // Find edge connecting parent and child
        const edge = graph.edges.find(e => 
          (e.source === p && e.target === curr) || 
          (!e.directed && e.source === curr && e.target === p)
        );
        if (edge) {
          visualState.edgeStates[edge.id] = 'path';
        }
        curr = p;
        pathNodes.push(curr);
      }
      steps.push({
        description: `Target node ${endNodeId} found! Backtracking path: ${pathNodes.reverse().join(' -> ')}`,
        state: JSON.parse(JSON.stringify(visualState)),
        highlightLines: [5],
      });
      return steps;
    }

    // Get neighbors
    const neighbors: { nodeId: string; edgeId: string }[] = [];
    graph.edges.forEach((edge) => {
      if (edge.source === currentId) {
        neighbors.push({ nodeId: edge.target, edgeId: edge.id });
      } else if (!edge.directed && edge.target === currentId) {
        neighbors.push({ nodeId: edge.source, edgeId: edge.id });
      }
    });

    for (const neighbor of neighbors) {
      const { nodeId, edgeId } = neighbor;
      if (!visited.has(nodeId)) {
        visited.add(nodeId);
        parent[nodeId] = currentId;
        queue.push(nodeId);

        // Visual update
        visualState.nodeStates[nodeId] = 'visiting';
        visualState.edgeStates[edgeId] = 'visiting';
        visualState.queueState = [...queue];

        steps.push({
          description: `Discover neighbor Node ${nodeId} via edge. Enqueue it.`,
          state: JSON.parse(JSON.stringify(visualState)),
          highlightLines: [6, 7],
        });
      }
    }

    visualState.nodeStates[currentId] = 'visited';
    // Mark edges as fully visited
    graph.edges.forEach((edge) => {
      if (visualState.edgeStates[edge.id] === 'visiting') {
        visualState.edgeStates[edge.id] = 'visited';
      }
    });

    steps.push({
      description: `Finished processing Node ${currentId}. Mark as visited.`,
      state: JSON.parse(JSON.stringify(visualState)),
      highlightLines: [8],
    });
  }

  steps.push({
    description: `BFS completed. Visited all reachable nodes.`,
    state: JSON.parse(JSON.stringify(visualState)),
    highlightLines: [9],
  });

  return steps;
};

// 2. Depth First Search (DFS)
export const generateDFS = (graph: Graph, startNodeId: string, endNodeId?: string): VisualizationStep[] => {
  const steps: VisualizationStep[] = [];
  const visualState = createInitialVisualState(graph);

  if (!startNodeId) return [];

  const visited = new Set<string>();
  const parent: Record<string, string | null> = {};
  const stack: string[] = [startNodeId];

  visualState.queueState = [...stack];
  steps.push({
    description: `Initialize DFS Stack with start node ${startNodeId}.`,
    state: JSON.parse(JSON.stringify(visualState)),
    highlightLines: [1, 2],
  });

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    visualState.queueState = [...stack];

    if (visited.has(currentId)) {
      continue;
    }

    visited.add(currentId);
    visualState.nodeStates[currentId] = 'current';

    steps.push({
      description: `Pop and visit Node ${currentId}. Mark as current.`,
      state: JSON.parse(JSON.stringify(visualState)),
      highlightLines: [3, 4],
    });

    if (currentId === endNodeId) {
      visualState.nodeStates[currentId] = 'path';
      let curr = currentId;
      const pathNodes = [curr];
      while (parent[curr]) {
        const p = parent[curr]!;
        visualState.nodeStates[p] = 'path';
        const edge = graph.edges.find(e => 
          (e.source === p && e.target === curr) || 
          (!e.directed && e.source === curr && e.target === p)
        );
        if (edge) visualState.edgeStates[edge.id] = 'path';
        curr = p;
        pathNodes.push(curr);
      }
      steps.push({
        description: `Target node ${endNodeId} found via DFS! Backtracking path: ${pathNodes.reverse().join(' -> ')}`,
        state: JSON.parse(JSON.stringify(visualState)),
        highlightLines: [5],
      });
      return steps;
    }

    // Get neighbors
    const neighbors: { nodeId: string; edgeId: string }[] = [];
    graph.edges.forEach((edge) => {
      if (edge.source === currentId) {
        neighbors.push({ nodeId: edge.target, edgeId: edge.id });
      } else if (!edge.directed && edge.target === currentId) {
        neighbors.push({ nodeId: edge.source, edgeId: edge.id });
      }
    });

    for (const neighbor of neighbors) {
      const { nodeId, edgeId } = neighbor;
      if (!visited.has(nodeId)) {
        parent[nodeId] = currentId;
        stack.push(nodeId);

        visualState.nodeStates[nodeId] = 'visiting';
        visualState.edgeStates[edgeId] = 'visiting';
        visualState.queueState = [...stack];

        steps.push({
          description: `Discover neighbor Node ${nodeId}. Push to DFS stack.`,
          state: JSON.parse(JSON.stringify(visualState)),
          highlightLines: [6, 7],
        });
      }
    }

    visualState.nodeStates[currentId] = 'visited';
    graph.edges.forEach((edge) => {
      if (visualState.edgeStates[edge.id] === 'visiting') {
        visualState.edgeStates[edge.id] = 'visited';
      }
    });
  }

  steps.push({
    description: `DFS completed. Visited all reachable nodes.`,
    state: JSON.parse(JSON.stringify(visualState)),
    highlightLines: [8],
  });

  return steps;
};

// 3. Dijkstra's Shortest Path
export const generateDijkstra = (graph: Graph, startNodeId: string, endNodeId?: string): VisualizationStep[] => {
  const steps: VisualizationStep[] = [];
  const visualState = createInitialVisualState(graph);

  if (!startNodeId) return [];

  const distances: Record<string, number> = {};
  const parent: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  graph.nodes.forEach((node) => {
    distances[node.id] = Infinity;
    parent[node.id] = null;
    unvisited.add(node.id);
  });

  distances[startNodeId] = 0;
  visualState.distances = { ...distances };
  visualState.queueState = Object.keys(distances).map(id => `${id}:${distances[id] === Infinity ? '∞' : distances[id]}`);

  steps.push({
    description: `Initialize Dijkstra: Set distance to start Node ${startNodeId} to 0, all others to ∞.`,
    state: JSON.parse(JSON.stringify(visualState)),
    highlightLines: [1, 2],
  });

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let currentId: string | null = null;
    let minDistance = Infinity;

    for (const id of unvisited) {
      if (distances[id] < minDistance) {
        minDistance = distances[id];
        currentId = id;
      }
    }

    if (currentId === null || minDistance === Infinity) {
      break;
    }

    unvisited.delete(currentId);
    visualState.nodeStates[currentId] = 'current';
    visualState.queueState = Array.from(unvisited).map(id => `${id}:${distances[id] === Infinity ? '∞' : distances[id]}`);

    steps.push({
      description: `Select unvisited node with minimum distance: Node ${currentId} (Dist: ${minDistance})`,
      state: JSON.parse(JSON.stringify(visualState)),
      highlightLines: [3, 4],
    });

    if (currentId === endNodeId) {
      // Reconstruct path
      let curr = currentId;
      const pathNodes = [curr];
      while (parent[curr]) {
        const p = parent[curr]!;
        visualState.nodeStates[p] = 'path';
        const edge = graph.edges.find(e => 
          (e.source === p && e.target === curr) || 
          (!e.directed && e.source === curr && e.target === p)
        );
        if (edge) visualState.edgeStates[edge.id] = 'path';
        curr = p;
        pathNodes.push(curr);
      }
      visualState.nodeStates[currentId] = 'path';
      steps.push({
        description: `Reached target node ${endNodeId}! Shortest distance is ${minDistance}. Backtracking path.`,
        state: JSON.parse(JSON.stringify(visualState)),
        highlightLines: [5],
      });
      return steps;
    }

    // Relax neighbors
    const neighbors: { nodeId: string; edgeId: string; weight: number }[] = [];
    graph.edges.forEach((edge) => {
      if (edge.source === currentId) {
        neighbors.push({ nodeId: edge.target, edgeId: edge.id, weight: edge.weight });
      } else if (!edge.directed && edge.target === currentId) {
        neighbors.push({ nodeId: edge.source, edgeId: edge.id, weight: edge.weight });
      }
    });

    for (const neighbor of neighbors) {
      const { nodeId, edgeId, weight } = neighbor;
      if (unvisited.has(nodeId)) {
        const alt = distances[currentId] + weight;
        visualState.edgeStates[edgeId] = 'visiting';
        
        if (alt < distances[nodeId]) {
          distances[nodeId] = alt;
          parent[nodeId] = currentId;
          visualState.distances = { ...distances };
          visualState.nodeStates[nodeId] = 'visiting';
          
          steps.push({
            description: `Relaxing edge to Node ${nodeId}. New shorter distance found: ${alt} (previous: ${distances[nodeId] === alt ? '∞' : distances[nodeId]})`,
            state: JSON.parse(JSON.stringify(visualState)),
            highlightLines: [6, 7],
          });
        } else {
          steps.push({
            description: `Relaxing edge to Node ${nodeId}. No update needed (alternative dist: ${alt} is not smaller than existing ${distances[nodeId] === Infinity ? '∞' : distances[nodeId]})`,
            state: JSON.parse(JSON.stringify(visualState)),
            highlightLines: [6],
          });
        }
        visualState.edgeStates[edgeId] = 'visited';
      }
    }

    visualState.nodeStates[currentId] = 'visited';
  }

  steps.push({
    description: `Dijkstra completed. Found shortest paths to all reachable nodes.`,
    state: JSON.parse(JSON.stringify(visualState)),
    highlightLines: [8],
  });

  return steps;
};

// 4. A* Search
export const generateAStar = (graph: Graph, startNodeId: string, endNodeId: string): VisualizationStep[] => {
  const steps: VisualizationStep[] = [];
  const visualState = createInitialVisualState(graph);

  if (!startNodeId || !endNodeId) return [];

  const startNode = graph.nodes.find(n => n.id === startNodeId);
  const endNode = graph.nodes.find(n => n.id === endNodeId);
  if (!startNode || !endNode) return [];

  const gScore: Record<string, number> = {}; // cost from start
  const fScore: Record<string, number> = {}; // total estimated cost
  const parent: Record<string, string | null> = {};
  const openSet = new Set<string>([startNodeId]);

  graph.nodes.forEach((node) => {
    gScore[node.id] = Infinity;
    fScore[node.id] = Infinity;
    parent[node.id] = null;
  });

  gScore[startNodeId] = 0;
  fScore[startNodeId] = getDistance(startNode, endNode);

  visualState.distances = { ...gScore };
  visualState.queueState = [`${startNodeId} (f:${fScore[startNodeId].toFixed(1)})`];

  steps.push({
    description: `Initialize A* Search. gScore(Start)=0, fScore(Start)=h(Start)=${fScore[startNodeId].toFixed(1)}.`,
    state: JSON.parse(JSON.stringify(visualState)),
    highlightLines: [1, 2],
  });

  while (openSet.size > 0) {
    // Find node in openSet with lowest fScore
    let currentId: string | null = null;
    let minF = Infinity;

    for (const id of openSet) {
      if (fScore[id] < minF) {
        minF = fScore[id];
        currentId = id;
      }
    }

    if (currentId === null) break;

    const currentNode = graph.nodes.find(n => n.id === currentId)!;

    openSet.delete(currentId);
    visualState.nodeStates[currentId] = 'current';
    visualState.queueState = Array.from(openSet).map(id => `${id} (f:${fScore[id].toFixed(1)})`);

    steps.push({
      description: `Pop Node ${currentId} from Open Set with minimum fScore = ${minF.toFixed(1)}.`,
      state: JSON.parse(JSON.stringify(visualState)),
      highlightLines: [3, 4],
    });

    if (currentId === endNodeId) {
      let curr = currentId;
      const pathNodes = [curr];
      while (parent[curr]) {
        const p = parent[curr]!;
        visualState.nodeStates[p] = 'path';
        const edge = graph.edges.find(e => 
          (e.source === p && e.target === curr) || 
          (!e.directed && e.source === curr && e.target === p)
        );
        if (edge) visualState.edgeStates[edge.id] = 'path';
        curr = p;
        pathNodes.push(curr);
      }
      visualState.nodeStates[currentId] = 'path';
      steps.push({
        description: `Target Node ${endNodeId} reached! Path trace completed.`,
        state: JSON.parse(JSON.stringify(visualState)),
        highlightLines: [5],
      });
      return steps;
    }

    // Neighbors
    const neighbors: { nodeId: string; edgeId: string; weight: number }[] = [];
    graph.edges.forEach((edge) => {
      if (edge.source === currentId) {
        neighbors.push({ nodeId: edge.target, edgeId: edge.id, weight: edge.weight });
      } else if (!edge.directed && edge.target === currentId) {
        neighbors.push({ nodeId: edge.source, edgeId: edge.id, weight: edge.weight });
      }
    });

    for (const neighbor of neighbors) {
      const { nodeId, edgeId, weight } = neighbor;
      const neighborNode = graph.nodes.find(n => n.id === nodeId)!;
      const tentativeGScore = gScore[currentId] + weight;

      visualState.edgeStates[edgeId] = 'visiting';

      if (tentativeGScore < gScore[nodeId]) {
        parent[nodeId] = currentId;
        gScore[nodeId] = tentativeGScore;
        const h = getDistance(neighborNode, endNode);
        fScore[nodeId] = tentativeGScore + h;
        
        visualState.distances = { ...gScore };

        if (!openSet.has(nodeId)) {
          openSet.add(nodeId);
          visualState.nodeStates[nodeId] = 'visiting';
          steps.push({
            description: `Found better path to Node ${nodeId}. gScore: ${tentativeGScore}, h(heuristic): ${h.toFixed(1)}, fScore: ${fScore[nodeId].toFixed(1)}. Added to Open Set.`,
            state: JSON.parse(JSON.stringify(visualState)),
            highlightLines: [6, 7],
          });
        } else {
          steps.push({
            description: `Updated better path to Node ${nodeId} already in Open Set. New fScore: ${fScore[nodeId].toFixed(1)}.`,
            state: JSON.parse(JSON.stringify(visualState)),
            highlightLines: [6],
          });
        }
      } else {
        steps.push({
          description: `Examine Node ${nodeId}. Path via ${currentId} (g: ${tentativeGScore}) is worse or equal to existing (g: ${gScore[nodeId] === Infinity ? '∞' : gScore[nodeId]}).`,
          state: JSON.parse(JSON.stringify(visualState)),
          highlightLines: [6],
        });
      }
      visualState.edgeStates[edgeId] = 'visited';
    }

    visualState.nodeStates[currentId] = 'visited';
  }

  steps.push({
    description: `A* search finished. Target is unreachable.`,
    state: JSON.parse(JSON.stringify(visualState)),
    highlightLines: [8],
  });

  return steps;
};

// 5. Bellman-Ford
export const generateBellmanFord = (graph: Graph, startNodeId: string): VisualizationStep[] => {
  const steps: VisualizationStep[] = [];
  const visualState = createInitialVisualState(graph);

  if (!startNodeId) return [];

  const distances: Record<string, number> = {};
  const parent: Record<string, string | null> = {};

  graph.nodes.forEach((node) => {
    distances[node.id] = Infinity;
    parent[node.id] = null;
  });
  distances[startNodeId] = 0;

  visualState.distances = { ...distances };
  steps.push({
    description: `Initialize Bellman-Ford: Distances set to ∞ except start node ${startNodeId} which is 0.`,
    state: JSON.parse(JSON.stringify(visualState)),
    highlightLines: [1, 2],
  });

  const V = graph.nodes.length;
  // Relax edges V - 1 times
  for (let i = 1; i <= V - 1; i++) {
    let relaxedAny = false;
    
    steps.push({
      description: `--- Iteration ${i} of ${V - 1} ---`,
      state: JSON.parse(JSON.stringify(visualState)),
      highlightLines: [3],
    });

    for (const edge of graph.edges) {
      const u = edge.source;
      const v = edge.target;
      const w = edge.weight;

      // Undirected edges can be relaxed both ways, directed only source -> target
      const directions = edge.directed ? [{ src: u, dest: v }] : [{ src: u, dest: v }, { src: v, dest: u }];

      for (const { src, dest } of directions) {
        if (distances[src] !== Infinity) {
          visualState.nodeStates[src] = 'current';
          visualState.edgeStates[edge.id] = 'visiting';

          if (distances[src] + w < distances[dest]) {
            distances[dest] = distances[src] + w;
            parent[dest] = src;
            relaxedAny = true;
            visualState.distances = { ...distances };
            visualState.nodeStates[dest] = 'visiting';

            steps.push({
              description: `Relaxing Edge (${src} -> ${dest}): New shorter distance is ${distances[dest]}`,
              state: JSON.parse(JSON.stringify(visualState)),
              highlightLines: [4, 5],
            });
          } else {
            steps.push({
              description: `Relaxing Edge (${src} -> ${dest}): No update (Dist: ${distances[dest] === Infinity ? '∞' : distances[dest]} <= ${distances[src]} + ${w})`,
              state: JSON.parse(JSON.stringify(visualState)),
              highlightLines: [4],
            });
          }

          // Reset transient states
          visualState.nodeStates[src] = 'visited';
          visualState.nodeStates[dest] = 'visited';
          visualState.edgeStates[edge.id] = 'visited';
        }
      }
    }

    if (!relaxedAny) {
      steps.push({
        description: `No edges relaxed during Iteration ${i}. Shortest paths found early! Skipping further iterations.`,
        state: JSON.parse(JSON.stringify(visualState)),
        highlightLines: [6],
      });
      break;
    }
  }

  // Check for negative-weight cycles
  for (const edge of graph.edges) {
    const u = edge.source;
    const v = edge.target;
    const w = edge.weight;

    const directions = edge.directed ? [{ src: u, dest: v }] : [{ src: u, dest: v }, { src: v, dest: u }];
    for (const { src, dest } of directions) {
      if (distances[src] !== Infinity && distances[src] + w < distances[dest]) {
        visualState.nodeStates[src] = 'obstacle';
        visualState.nodeStates[dest] = 'obstacle';
        visualState.edgeStates[edge.id] = 'visiting';

        steps.push({
          description: `ALERT: Negative weight cycle detected involving Node ${src} and Node ${dest}! Infinite loops possible.`,
          state: JSON.parse(JSON.stringify(visualState)),
          highlightLines: [7],
        });
        return steps;
      }
    }
  }

  steps.push({
    description: `Bellman-Ford completed successfully. No negative cycles found.`,
    state: JSON.parse(JSON.stringify(visualState)),
    highlightLines: [8],
  });

  return steps;
};

// 6. Kruskal's Minimum Spanning Tree (MST)
export const generateKruskal = (graph: Graph): VisualizationStep[] => {
  const steps: VisualizationStep[] = [];
  const visualState = createInitialVisualState(graph);
  visualState.mstEdges = [];

  // Sort edges by weight
  const sortedEdges = [...graph.edges].sort((a, b) => a.weight - b.weight);

  steps.push({
    description: `Initialize Kruskal's: Sort all edges by weight. Sorted: [${sortedEdges.map(e => `${e.source}-${e.target}:${e.weight}`).join(', ')}]`,
    state: JSON.parse(JSON.stringify(visualState)),
    highlightLines: [1, 2],
  });

  const ds = new DisjointSet(graph.nodes);
  const mst: Edge[] = [];

  for (const edge of sortedEdges) {
    visualState.edgeStates[edge.id] = 'visiting';
    visualState.nodeStates[edge.source] = 'current';
    visualState.nodeStates[edge.target] = 'current';

    steps.push({
      description: `Examine Edge ${edge.source} - ${edge.target} with minimum weight ${edge.weight}.`,
      state: JSON.parse(JSON.stringify(visualState)),
      highlightLines: [3],
    });

    const root1 = ds.find(edge.source);
    const root2 = ds.find(edge.target);

    if (root1 !== root2) {
      ds.union(edge.source, edge.target);
      mst.push(edge);
      visualState.edgeStates[edge.id] = 'path';
      visualState.mstEdges.push(edge.id);
      visualState.nodeStates[edge.source] = 'visited';
      visualState.nodeStates[edge.target] = 'visited';

      steps.push({
        description: `Roots differ (${root1} != ${root2}). Adding Edge to MST to avoid cycle. MST Edges: ${mst.length}`,
        state: JSON.parse(JSON.stringify(visualState)),
        highlightLines: [4, 5],
      });
    } else {
      visualState.edgeStates[edge.id] = 'default';
      visualState.nodeStates[edge.source] = 'visited';
      visualState.nodeStates[edge.target] = 'visited';

      steps.push({
        description: `Roots are the same (${root1}). Adding Edge would create a cycle! Rejecting Edge.`,
        state: JSON.parse(JSON.stringify(visualState)),
        highlightLines: [6],
      });
    }

    // Keep active MST edges permanently colored as 'path'
    mst.forEach((mstEdge) => {
      visualState.edgeStates[mstEdge.id] = 'path';
    });
  }

  // Final step
  const totalWeight = mst.reduce((sum, e) => sum + e.weight, 0);
  steps.push({
    description: `Kruskal's MST completed. Total MST weight: ${totalWeight}`,
    state: JSON.parse(JSON.stringify(visualState)),
    highlightLines: [7],
  });

  return steps;
};

// 7. Prim's Minimum Spanning Tree (MST)
export const generatePrim = (graph: Graph, startNodeId: string): VisualizationStep[] => {
  const steps: VisualizationStep[] = [];
  const visualState = createInitialVisualState(graph);
  visualState.mstEdges = [];

  if (!startNodeId) return [];

  const inMST = new Set<string>([startNodeId]);
  visualState.nodeStates[startNodeId] = 'visited';

  steps.push({
    description: `Initialize Prim's from Node ${startNodeId}. Add to MST set.`,
    state: JSON.parse(JSON.stringify(visualState)),
    highlightLines: [1, 2],
  });

  const V = graph.nodes.length;
  while (inMST.size < V) {
    let minEdge: Edge | null = null;
    let minWeight = Infinity;
    let nextNodeId = '';

    // Find cut-crossing edge with minimum weight
    for (const edge of graph.edges) {
      const u = edge.source;
      const v = edge.target;

      // Since MST is usually for undirected graphs, check both directions
      const uIn = inMST.has(u);
      const vIn = inMST.has(v);

      if ((uIn && !vIn) || (!uIn && vIn)) {
        if (edge.weight < minWeight) {
          minWeight = edge.weight;
          minEdge = edge;
          nextNodeId = uIn ? v : u;
        }
      }
    }

    if (!minEdge) {
      // Graph is disconnected
      steps.push({
        description: `No crossing edges found. Graph is disconnected! Prim's completed with forest.`,
        state: JSON.parse(JSON.stringify(visualState)),
        highlightLines: [3],
      });
      return steps;
    }

    // Visual highlights
    visualState.edgeStates[minEdge.id] = 'visiting';
    visualState.nodeStates[nextNodeId] = 'current';

    steps.push({
      description: `Evaluating candidate edges cut. Choose minimum weight edge ${minEdge.source} - ${minEdge.target} (Weight: ${minWeight}) connecting to new Node ${nextNodeId}.`,
      state: JSON.parse(JSON.stringify(visualState)),
      highlightLines: [4],
    });

    inMST.add(nextNodeId);
    visualState.nodeStates[nextNodeId] = 'visited';
    visualState.edgeStates[minEdge.id] = 'path';
    visualState.mstEdges.push(minEdge.id);

    // Keep all MST edges highlighted as path
    visualState.mstEdges.forEach((eid) => {
      visualState.edgeStates[eid] = 'path';
    });

    steps.push({
      description: `Added Node ${nextNodeId} and Edge to the MST. Current MST size: ${inMST.size} nodes.`,
      state: JSON.parse(JSON.stringify(visualState)),
      highlightLines: [5, 6],
    });
  }

  const totalWeight = graph.edges
    .filter(e => visualState.mstEdges?.includes(e.id))
    .reduce((sum, e) => sum + e.weight, 0);

  steps.push({
    description: `Prim's MST completed. Fully spanned the graph. Total MST weight: ${totalWeight}`,
    state: JSON.parse(JSON.stringify(visualState)),
    highlightLines: [7],
  });

  return steps;
};
