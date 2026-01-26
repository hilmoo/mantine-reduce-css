type Component = {
  name: string;
  dependency: string[];
  [key: string]: any;
};

type Graph = Record<string, Set<string>>;

function buildDependencyGraph(components: Component[]): Graph {
  const graph: Graph = {};
  for (const comp of components) {
    graph[comp.name] = new Set(comp.dependency);
  }
  return graph;
}

export function topologicalSort(components: Component[]): string[] {
  const graph = buildDependencyGraph(components);
  const reverseGraph: Record<string, Set<string>> = {};
  const indegree: Record<string, number> = {};

  for (const node of Object.keys(graph)) {
    indegree[node] = 0;
    reverseGraph[node] = new Set();
  }

  for (const [node, deps] of Object.entries(graph)) {
    for (const dep of deps) {
      if (graph[dep]) {
        reverseGraph[dep].add(node);
        indegree[node] = (indegree[node] || 0) + 1;
      }
    }
  }

  const queue: string[] = Object.keys(indegree).filter(
    (node) => indegree[node] === 0,
  );

  const result: string[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);

    const dependents = reverseGraph[node];
    if (dependents) {
      for (const dependent of dependents) {
        indegree[dependent]--;
        if (indegree[dependent] === 0) {
          queue.push(dependent);
        }
      }
    }
  }

  if (result.length !== Object.keys(graph).length) {
    throw new Error("Cycle detected in dependencies");
  }

  return result;
}
