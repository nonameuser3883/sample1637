export function* walk(nodes: readonly SceneNode[]): Generator<SceneNode> {
  for (const node of nodes) {
    yield node;
    if ('children' in node) {
      yield* walk(node.children);
    }
  }
}

export function collect<T extends SceneNode>(
  nodes: readonly SceneNode[],
  predicate: (n: SceneNode) => n is T
): T[] {
  const result: T[] = [];
  for (const n of walk(nodes)) if (predicate(n)) result.push(n);
  return result;
}

export function collectWhere(
  nodes: readonly SceneNode[],
  predicate: (n: SceneNode) => boolean
): SceneNode[] {
  const result: SceneNode[] = [];
  for (const n of walk(nodes)) if (predicate(n)) result.push(n);
  return result;
}

export const isText = (n: SceneNode): n is TextNode => n.type === 'TEXT';

export const hasFills = (
  n: SceneNode
): n is SceneNode & { readonly fills: readonly Paint[] | PluginAPI['mixed'] } =>
  'fills' in n;

export const hasStrokes = (
  n: SceneNode
): n is SceneNode & { readonly strokes: readonly Paint[] } =>
  'strokes' in n && Array.isArray((n as { strokes?: unknown }).strokes);

export const hasEffects = (
  n: SceneNode
): n is SceneNode & { readonly effects: readonly Effect[] } =>
  'effects' in n && Array.isArray((n as { effects?: unknown }).effects);
