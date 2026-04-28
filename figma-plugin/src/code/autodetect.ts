import type { Aspect } from '../shared/messages';
import { walk } from './traverse';

const ALL_ASPECTS: Aspect[] = [
  'typography',
  'background',
  'border',
  'shadow',
  'radius',
  'spacing',
  'layout',
  'icon',
  'button',
  'input',
  'card',
  'componentSet',
  'frame',
  'all'
];

export function suggestAspects(selection: readonly SceneNode[], topN = 4): Aspect[] {
  if (selection.length === 0) return [];

  const scores: Record<Aspect, number> = {
    typography: 0,
    background: 0,
    border: 0,
    shadow: 0,
    radius: 0,
    spacing: 0,
    layout: 0,
    icon: 0,
    button: 0,
    input: 0,
    card: 0,
    componentSet: 0,
    frame: 0,
    all: 0
  };

  for (const node of walk(selection)) {
    // Text
    if (node.type === 'TEXT') scores.typography += 5;

    // Fills
    const fillsNode = node as SceneNode & { fills?: readonly Paint[] | PluginAPI['mixed'] };
    if (
      Array.isArray(fillsNode.fills) &&
      fillsNode.fills.some((f) => f.visible !== false)
    ) {
      scores.background += 2;
    }

    // Strokes
    const strokesNode = node as SceneNode & { strokes?: readonly Paint[] };
    if (
      Array.isArray(strokesNode.strokes) &&
      strokesNode.strokes.some((s) => s.visible !== false)
    ) {
      scores.border += 3;
    }

    // Effects
    const effectsNode = node as SceneNode & { effects?: readonly Effect[] };
    if (
      Array.isArray(effectsNode.effects) &&
      effectsNode.effects.some((e) => e.visible !== false)
    ) {
      scores.shadow += 3;
    }

    // Corner radius
    if ('cornerRadius' in node) {
      const cr = (node as unknown as { cornerRadius: number | PluginAPI['mixed'] }).cornerRadius;
      if (cr === figma.mixed || (typeof cr === 'number' && cr > 0)) scores.radius += 2;
    }

    // Spacing / auto-layout
    const f = node as SceneNode & {
      layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
      paddingTop?: number;
      itemSpacing?: number;
    };
    if (f.layoutMode && f.layoutMode !== 'NONE') {
      scores.layout += 2;
      scores.spacing += 2;
    }
    if (typeof f.paddingTop === 'number' && f.paddingTop > 0) scores.spacing += 1;
    if (typeof f.itemSpacing === 'number' && f.itemSpacing > 0) scores.spacing += 1;

    if (node.type === 'COMPONENT_SET') scores.componentSet += 20;
    if (node.type === 'FRAME') scores.frame += 2;

    const nameL = node.name.toLowerCase();
    if (/\b(button|btn)\b/.test(nameL)) scores.button += 25;
    if (/\b(input|field|textfield|textinput)\b/.test(nameL)) scores.input += 25;
    if (/\bcard\b/.test(nameL)) scores.card += 25;
    if (/\bicon\b/.test(nameL) && node.type !== 'TEXT') scores.icon += 10;
  }

  const ranked = ALL_ASPECTS
    .filter((a) => a !== 'all')
    .map((aspect) => ({ aspect, score: scores[aspect] }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((s) => s.aspect);

  return ranked;
}
