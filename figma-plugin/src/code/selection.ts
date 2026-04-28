import type { SelectionSummary } from '../shared/messages';

export function summarizeSelection(nodes: readonly SceneNode[]): SelectionSummary {
  const types: Record<string, number> = {};
  const nodeNames: string[] = [];
  for (const node of nodes) {
    types[node.type] = (types[node.type] ?? 0) + 1;
    if (nodeNames.length < 5) nodeNames.push(node.name);
  }
  return { count: nodes.length, types, nodeNames };
}
