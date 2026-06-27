import { Graph } from '../types';

export const PRESETS: Record<string, { name: string; graph: Graph; startNode: string; endNode: string; description: string }> = {
  weighted: {
    name: 'Weighted Network (Dijkstra/Prim)',
    description: 'A classic test graph with multiple alternative routes of different weights.',
    startNode: 'A',
    endNode: 'F',
    graph: {
      nodes: [
        { id: 'A', label: 'A', x: 100, y: 250 },
        { id: 'B', label: 'B', x: 250, y: 120 },
        { id: 'C', label: 'C', x: 250, y: 380 },
        { id: 'D', label: 'D', x: 450, y: 120 },
        { id: 'E', label: 'E', x: 450, y: 380 },
        { id: 'F', label: 'F', x: 600, y: 250 },
      ],
      edges: [
        { id: 'e1', source: 'A', target: 'B', weight: 4, directed: false },
        { id: 'e2', source: 'A', target: 'C', weight: 2, directed: false },
        { id: 'e3', source: 'B', target: 'C', weight: 1, directed: false },
        { id: 'e4', source: 'B', target: 'D', weight: 5, directed: false },
        { id: 'e5', source: 'C', target: 'E', weight: 8, directed: false },
        { id: 'e6', source: 'C', target: 'D', weight: 8, directed: false },
        { id: 'e7', source: 'D', target: 'E', weight: 2, directed: false },
        { id: 'e8', source: 'D', target: 'F', weight: 6, directed: false },
        { id: 'e9', source: 'E', target: 'F', weight: 3, directed: false },
      ],
    },
  },
  pathfinding: {
    name: 'Coordinate Map (A* Search)',
    description: 'A map styled with physical positions where A* heuristics shine compared to Dijkstra.',
    startNode: 'S',
    endNode: 'G',
    graph: {
      nodes: [
        { id: 'S', label: 'Start (S)', x: 80, y: 250 },
        { id: 'H1', label: 'Hub 1', x: 220, y: 150 },
        { id: 'H2', label: 'Hub 2', x: 220, y: 350 },
        { id: 'M1', label: 'Mid 1', x: 380, y: 100 },
        { id: 'M2', label: 'Mid 2', x: 380, y: 400 },
        { id: 'N', label: 'Near', x: 500, y: 250 },
        { id: 'G', label: 'Goal (G)', x: 620, y: 250 },
      ],
      edges: [
        { id: 'p1', source: 'S', target: 'H1', weight: 5, directed: false },
        { id: 'p2', source: 'S', target: 'H2', weight: 6, directed: false },
        { id: 'p3', source: 'H1', target: 'M1', weight: 4, directed: false },
        { id: 'p4', source: 'H1', target: 'N', weight: 9, directed: false },
        { id: 'p5', source: 'H2', target: 'M2', weight: 4, directed: false },
        { id: 'p6', source: 'H2', target: 'N', weight: 9, directed: false },
        { id: 'p7', source: 'M1', target: 'G', weight: 8, directed: false },
        { id: 'p8', source: 'M2', target: 'G', weight: 8, directed: false },
        { id: 'p9', source: 'N', target: 'G', weight: 2, directed: false },
      ],
    },
  },
  negative: {
    name: 'Negative Cycle (Bellman-Ford)',
    description: 'Contains a negative weight cycle. Useful for demonstrating the limitations of Dijkstra.',
    startNode: '1',
    endNode: '4',
    graph: {
      nodes: [
        { id: '1', label: '1', x: 150, y: 250 },
        { id: '2', label: '2', x: 350, y: 150 },
        { id: '3', label: '3', x: 350, y: 350 },
        { id: '4', label: '4', x: 550, y: 250 },
      ],
      edges: [
        { id: 'n1', source: '1', target: '2', weight: 4, directed: true },
        { id: 'n2', source: '1', target: '3', weight: 5, directed: true },
        { id: 'n3', source: '2', target: '3', weight: -10, directed: true },
        { id: 'n4', source: '3', target: '4', weight: 3, directed: true },
        { id: 'n5', source: '3', target: '2', weight: 5, directed: true }, // Creates cycle 2 -> 3 -> 2 with sum -10 + 5 = -5
      ],
    },
  },
  binaryTree: {
    name: 'Binary Search Tree',
    description: 'Perfect for comparing depth-first traversal (DFS) vs breadth-first traversal (BFS).',
    startNode: 'R',
    endNode: 'L2',
    graph: {
      nodes: [
        { id: 'R', label: 'Root (R)', x: 350, y: 80 },
        { id: 'L1', label: 'Left 1', x: 200, y: 180 },
        { id: 'R1', label: 'Right 1', x: 500, y: 180 },
        { id: 'L2', label: 'L-Left 2', x: 100, y: 300 },
        { id: 'R2', label: 'L-Right 2', x: 280, y: 300 },
        { id: 'L3', label: 'R-Left 2', x: 420, y: 300 },
        { id: 'R3', label: 'R-Right 2', x: 600, y: 300 },
      ],
      edges: [
        { id: 't1', source: 'R', target: 'L1', weight: 1, directed: true },
        { id: 't2', source: 'R', target: 'R1', weight: 1, directed: true },
        { id: 't3', source: 'L1', target: 'L2', weight: 1, directed: true },
        { id: 't4', source: 'L1', target: 'R2', weight: 1, directed: true },
        { id: 't5', source: 'R1', target: 'L3', weight: 1, directed: true },
        { id: 't6', source: 'R1', target: 'R3', weight: 1, directed: true },
      ],
    },
  },
};
