import { AlgorithmType } from '../types';

export interface CodeLine {
  line: number;
  code: string;
  indent: number;
}

export const PSEUDOCODES: Record<AlgorithmType, CodeLine[]> = {
  bfs: [
    { line: 1, code: 'procedure BFS(G, start_node):', indent: 0 },
    { line: 2, code: 'let Q be a queue, mark start_node as visited', indent: 1 },
    { line: 3, code: 'while Q is not empty:', indent: 1 },
    { line: 4, code: 'v = Q.dequeue()', indent: 2 },
    { line: 5, code: 'if v is target node: return PATH', indent: 2 },
    { line: 6, code: 'for each neighbor w of v:', indent: 2 },
    { line: 7, code: 'if w is not visited: mark visited, parent[w] = v, Q.enqueue(w)', indent: 3 },
    { line: 8, code: 'mark v as fully processed', indent: 2 },
    { line: 9, code: 'end BFS', indent: 0 },
  ],
  dfs: [
    { line: 1, code: 'procedure DFS(G, start_node):', indent: 0 },
    { line: 2, code: 'let S be a stack, S.push(start_node)', indent: 1 },
    { line: 3, code: 'while S is not empty:', indent: 1 },
    { line: 4, code: 'v = S.pop()', indent: 2 },
    { line: 5, code: 'if v is target: return PATH', indent: 2 },
    { line: 6, code: 'if v is not visited: mark visited', indent: 2 },
    { line: 7, code: 'for each neighbor w of v: parent[w] = v, S.push(w)', indent: 3 },
    { line: 8, code: 'end DFS', indent: 0 },
  ],
  dijkstra: [
    { line: 1, code: 'procedure Dijkstra(G, start_node):', indent: 0 },
    { line: 2, code: 'dist[start_node] = 0, dist[others] = infinity, parent = null', indent: 1 },
    { line: 3, code: 'while unvisited set is not empty:', indent: 1 },
    { line: 4, code: 'u = node with min dist in unvisited', indent: 2 },
    { line: 5, code: 'if u is target: return PATH', indent: 2 },
    { line: 6, code: 'for each unvisited neighbor v of u:', indent: 2 },
    { line: 7, code: 'if dist[u] + weight(u,v) < dist[v]: dist[v] = updated, parent[v] = u', indent: 3 },
    { line: 8, code: 'mark u as visited / processed', indent: 2 },
  ],
  astar: [
    { line: 1, code: 'procedure A*(G, start, target):', indent: 0 },
    { line: 2, code: 'gScore[start] = 0, fScore[start] = heuristic(start, target), openSet = {start}', indent: 1 },
    { line: 3, code: 'while openSet is not empty:', indent: 1 },
    { line: 4, code: 'current = node in openSet with lowest fScore', indent: 2 },
    { line: 5, code: 'if current == target: reconstruct path and return', indent: 2 },
    { line: 6, code: 'for each neighbor of current:', indent: 2 },
    { line: 7, code: 'tentative_g = gScore[current] + weight(current, neighbor)', indent: 3 },
    { line: 8, code: 'if tentative_g < gScore[neighbor]: parent[neighbor] = current, update scores', indent: 3 },
  ],
  bellmanFord: [
    { line: 1, code: 'procedure BellmanFord(G, start_node):', indent: 0 },
    { line: 2, code: 'dist[start_node] = 0, dist[others] = infinity', indent: 1 },
    { line: 3, code: 'repeat |V|-1 times:', indent: 1 },
    { line: 4, code: 'for each edge (u, v) with weight w:', indent: 2 },
    { line: 5, code: 'if dist[u] + w < dist[v]: dist[v] = dist[u] + w, parent[v] = u', indent: 3 },
    { line: 6, code: 'if no updates made in iteration: break early', indent: 2 },
    { line: 7, code: 'check for negative cycles: if any edge can still be relaxed, error', indent: 1 },
    { line: 8, code: 'end BellmanFord', indent: 0 },
  ],
  kruskal: [
    { line: 1, code: 'procedure Kruskal(G):', indent: 0 },
    { line: 2, code: 'sort all edges in G by weight ascending, initialize DisjointSet', indent: 1 },
    { line: 3, code: 'for each edge (u, v) in sorted_edges:', indent: 1 },
    { line: 4, code: 'if find(u) != find(v):', indent: 2 },
    { line: 5, code: 'union(u, v), add edge to MST', indent: 3 },
    { line: 6, code: 'else: reject edge (creates cycle)', indent: 2 },
    { line: 7, code: 'return MST', indent: 1 },
  ],
  prim: [
    { line: 1, code: "procedure Prim(G, start_node):", indent: 0 },
    { line: 2, code: "add start_node to MST, let MST_edges = empty", indent: 1 },
    { line: 3, code: "while MST does not contain all nodes:", indent: 1 },
    { line: 4, code: "find crossing edge (u, v) with minimum weight where u in MST, v not", indent: 2 },
    { line: 5, code: "add v to MST", indent: 2 },
    { line: 6, code: "add edge (u, v) to MST_edges", indent: 2 },
    { line: 7, code: "return MST_edges", indent: 1 },
  ],
};

export const ALGORITHM_INFO: Record<AlgorithmType, { name: string; complexity: string; desc: string }> = {
  bfs: {
    name: 'Breadth First Search (BFS)',
    complexity: 'O(V + E)',
    desc: 'Explores level-by-level using a queue. Guarantees the shortest path on unweighted graphs.',
  },
  dfs: {
    name: 'Depth First Search (DFS)',
    complexity: 'O(V + E)',
    desc: 'Explores as deep as possible along each branch before backtracking using a stack/recursion.',
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    complexity: 'O((V + E) log V)',
    desc: 'Finds the single-source shortest path on graphs with non-negative edge weights using a priority queue.',
  },
  astar: {
    name: 'A* Search',
    complexity: 'O(E) (heuristic dependent)',
    desc: 'Informed pathfinding algorithm that uses distance heuristics to guide exploration toward the target quickly.',
  },
  bellmanFord: {
    name: 'Bellman-Ford Algorithm',
    complexity: 'O(V × E)',
    desc: 'Finds shortest paths from a single source. Slower than Dijkstra, but supports negative weights and detects negative-weight cycles.',
  },
  kruskal: {
    name: "Kruskal's MST Algorithm",
    complexity: 'O(E log E)',
    desc: "A greedy algorithm that finds a Minimum Spanning Tree by sorting all edges and adding them if they don't create cycles.",
  },
  prim: {
    name: "Prim's MST Algorithm",
    complexity: 'O(E log V)',
    desc: 'A greedy algorithm that grows a Minimum Spanning Tree node-by-node from a starting node, always taking the cheapest crossing edge.',
  },
};
