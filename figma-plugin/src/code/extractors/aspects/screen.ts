import type { AspectExtractor } from '../types';
import type { TokenResolver } from '../../tokens/resolver';
import { paintToString, effectToString, rgbToHex } from '../../markdown/formatters';
import {
  extractPadding,
  extractCornerRadius,
  type Padding,
  type Corners
} from '../composite/_shared';

// ============================================================
// Typed tree
// ============================================================

export type Abs = { x: number; y: number; w: number; h: number };

export type PaintSpec = {
  type: string;
  token?: string;
  color?: string;
  opacity?: number;
  raw: string;
};

export type StrokeSpec = PaintSpec & {
  weight?: number;
  align?: string;
};

export type EffectSpec = {
  type: string;
  token?: string;
  raw: string;
};

export type TextSpec = {
  characters: string;
  style?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  color?: { token?: string; value?: string };
};

export type ScreenNode = {
  id: string;
  name: string;
  type: string;
  abs: Abs;
  layout?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  padding?: Padding;
  gap?: number;
  radius?: Corners;
  fills?: PaintSpec[];
  strokes?: StrokeSpec[];
  effects?: EffectSpec[];
  opacity?: number;
  rotation?: number;
  text?: TextSpec;
  instanceOf?: string;
  children?: ScreenNode[];
};

// ============================================================
// AspectExtractor entry — returns markdown by default
// ============================================================

export const extractScreen: AspectExtractor = async (ctx) => {
  const warnings: string[] = [];
  if (ctx.selection.length === 0) {
    return { markdown: '# Screen\n\nНичего не выделено.\n', warnings };
  }
  const trees = await buildScreenTrees(ctx.selection, ctx.resolver, warnings);
  return { markdown: screenToMarkdown(trees), warnings };
};

export async function buildScreenTrees(
  selection: readonly SceneNode[],
  resolver: TokenResolver,
  warnings: string[]
): Promise<ScreenNode[]> {
  const out: ScreenNode[] = [];
  for (const root of selection) {
    const rootAbs = absBox(root);
    out.push(await buildNode(root, resolver, rootAbs, warnings));
  }
  return out;
}

// ============================================================
// Tree builder
// ============================================================

async function buildNode(
  node: SceneNode,
  resolver: TokenResolver,
  rootAbs: { x: number; y: number },
  warnings: string[]
): Promise<ScreenNode> {
  const bb = absBox(node);
  const out: ScreenNode = {
    id: node.id,
    name: node.name,
    type: node.type,
    abs: {
      x: Math.round(bb.x - rootAbs.x),
      y: Math.round(bb.y - rootAbs.y),
      w: Math.round(bb.w),
      h: Math.round(bb.h)
    }
  };

  const fl = node as SceneNode & {
    layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
    itemSpacing?: number;
  };
  if (fl.layoutMode && fl.layoutMode !== 'NONE') out.layout = fl.layoutMode;
  const pad = extractPadding(node);
  if (pad && (pad.top || pad.right || pad.bottom || pad.left)) out.padding = pad;
  if (typeof fl.itemSpacing === 'number' && fl.itemSpacing > 0) out.gap = fl.itemSpacing;
  const radius = extractCornerRadius(node);
  if (radius !== null && nonZeroRadius(radius)) out.radius = radius;

  const op = (node as SceneNode & { opacity?: number }).opacity;
  if (typeof op === 'number' && op < 1) out.opacity = round2(op);
  const rot = (node as SceneNode & { rotation?: number }).rotation;
  if (typeof rot === 'number' && Math.abs(rot) > 0.01) out.rotation = round2(rot);

  const fillsHost = node as SceneNode & { fills?: readonly Paint[] | PluginAPI['mixed'] };
  if (Array.isArray(fillsHost.fills) && fillsHost.fills.length > 0) {
    const fills: PaintSpec[] = [];
    for (let i = 0; i < fillsHost.fills.length; i++) {
      const p = fillsHost.fills[i];
      if (p.visible === false) continue;
      const spec = paintToSpec(p);
      try {
        const t = (await resolver.resolveFill(node as never, i))?.tokenized;
        if (t) spec.token = t;
      } catch {
        // ignore
      }
      fills.push(spec);
    }
    if (fills.length > 0) out.fills = fills;
  }

  const strokesHost = node as SceneNode & {
    strokes?: readonly Paint[];
    strokeWeight?: number | PluginAPI['mixed'];
    strokeAlign?: 'CENTER' | 'INSIDE' | 'OUTSIDE';
  };
  if (Array.isArray(strokesHost.strokes) && strokesHost.strokes.length > 0) {
    const strokes: StrokeSpec[] = [];
    for (let i = 0; i < strokesHost.strokes.length; i++) {
      const p = strokesHost.strokes[i];
      if (p.visible === false) continue;
      const s: StrokeSpec = { ...paintToSpec(p) };
      try {
        const t = (await resolver.resolveStroke(node as never, i))?.tokenized;
        if (t) s.token = t;
      } catch {
        // ignore
      }
      if (typeof strokesHost.strokeWeight === 'number') s.weight = strokesHost.strokeWeight;
      if (strokesHost.strokeAlign) s.align = strokesHost.strokeAlign;
      strokes.push(s);
    }
    if (strokes.length > 0) out.strokes = strokes;
  }

  const effectsHost = node as SceneNode & { effects?: readonly Effect[] };
  if (Array.isArray(effectsHost.effects) && effectsHost.effects.length > 0) {
    const effects: EffectSpec[] = [];
    for (let i = 0; i < effectsHost.effects.length; i++) {
      const e = effectsHost.effects[i];
      if (e.visible === false) continue;
      const spec: EffectSpec = { type: e.type, raw: effectToString(e) };
      try {
        const t = (await resolver.resolveEffect(node as never, i))?.tokenized;
        if (t) spec.token = t;
      } catch {
        // ignore
      }
      effects.push(spec);
    }
    if (effects.length > 0) out.effects = effects;
  }

  if (node.type === 'TEXT') {
    out.text = await buildTextSpec(node as TextNode, resolver);
  }

  if (node.type === 'INSTANCE') {
    try {
      const main = await (node as InstanceNode).getMainComponentAsync();
      out.instanceOf =
        main?.parent?.type === 'COMPONENT_SET' ? main.parent.name : main?.name ?? '(unknown)';
    } catch {
      out.instanceOf = '(unknown)';
    }
  }

  if ('children' in node) {
    const kids = (node as SceneNode & { children?: readonly SceneNode[] }).children;
    if (kids && kids.length > 0) {
      out.children = [];
      for (const child of kids) {
        out.children.push(await buildNode(child, resolver, rootAbs, warnings));
      }
    }
  }

  return out;
}

async function buildTextSpec(node: TextNode, resolver: TokenResolver): Promise<TextSpec> {
  const styleToken = (await resolver.resolveText(node))?.tokenized;
  const fontName = node.fontName === figma.mixed ? null : (node.fontName as FontName);
  const fontSize = node.fontSize === figma.mixed ? undefined : (node.fontSize as number);
  const fontWeight = node.fontWeight === figma.mixed ? 'mixed' : (node.fontWeight as number);

  const text: TextSpec = { characters: node.characters };
  if (styleToken) text.style = styleToken;
  if (fontName) text.fontFamily = `${fontName.family} ${fontName.style}`.trim();
  if (typeof fontSize === 'number') text.fontSize = fontSize;
  if (fontWeight !== undefined) text.fontWeight = fontWeight;

  const fills = node.fills;
  if (Array.isArray(fills) && fills.length > 0) {
    const visible = fills.find((f) => f.visible !== false);
    if (visible) {
      const idx = fills.indexOf(visible);
      const color: { token?: string; value?: string } = { value: paintToString(visible) };
      try {
        const t = (await resolver.resolveFill(node as never, idx))?.tokenized;
        if (t) color.token = t;
      } catch {
        // ignore
      }
      text.color = color;
    }
  }
  return text;
}

function paintToSpec(p: Paint): PaintSpec {
  const spec: PaintSpec = { type: p.type, raw: paintToString(p) };
  if (p.opacity !== undefined && p.opacity < 1) spec.opacity = round2(p.opacity);
  if (p.type === 'SOLID') {
    spec.color = rgbToHex((p as SolidPaint).color);
  }
  return spec;
}

// ============================================================
// Serializers
// ============================================================

export function screenToJSON(trees: ScreenNode[]): string {
  const payload = trees.length === 1 ? trees[0] : trees;
  return JSON.stringify(payload, null, 2);
}

export function screenToMarkdown(trees: ScreenNode[]): string {
  const lines: string[] = [];
  for (let i = 0; i < trees.length; i++) {
    if (i > 0) lines.push('', '---', '');
    renderNodeMD(trees[i], lines, 0, true);
  }
  const tokens = collectTokens(trees);
  const components = collectComponents(trees);
  if (tokens.length > 0) {
    lines.push('', '## Tokens used', '', tokens.map((t) => `\`${t}\``).join(', '));
  }
  if (components.length > 0) {
    lines.push('', '## Components used', '');
    for (const c of components) lines.push(`- \`${c}\``);
  }
  return lines.join('\n') + '\n';
}

function renderNodeMD(n: ScreenNode, lines: string[], depth: number, isRoot: boolean): void {
  const indent = '  '.repeat(depth);
  if (isRoot) {
    lines.push(`# Screen: ${n.name}`);
    lines.push('');
    lines.push(`${n.abs.w}×${n.abs.h}px${n.layout ? `, ${n.layout.toLowerCase()}-layout` : ''}`);
    if (n.fills) for (const f of n.fills) lines.push(`- **Background:** ${paintLine(f)}`);
    if (n.strokes) for (const s of n.strokes) lines.push(`- **Border:** ${strokeLine(s)}`);
    if (n.effects) for (const e of n.effects) lines.push(`- **Effect:** ${effectLine(e)}`);
    lines.push('', '## Structure');
    if (n.children) for (const c of n.children) renderNodeMD(c, lines, 0, false);
    return;
  }

  const parts: string[] = [n.type.toLowerCase()];
  parts.push(`@(${n.abs.x},${n.abs.y})`);
  parts.push(`${n.abs.w}×${n.abs.h}`);
  if (n.layout) parts.push(n.layout.toLowerCase());
  if (n.padding) parts.push(`pad ${padToStr(n.padding)}`);
  if (n.gap) parts.push(`gap ${n.gap}`);
  if (n.radius !== undefined) parts.push(`r ${radiusToStr(n.radius)}`);
  if (n.opacity !== undefined) parts.push(`opacity ${n.opacity}`);
  if (n.rotation !== undefined) parts.push(`rot ${n.rotation}°`);

  let head = `${indent}- **${n.name}** (${parts.join(', ')})`;
  if (n.instanceOf) head += ` → instance \`${n.instanceOf}\``;
  lines.push(head);

  const sub = `${indent}  `;
  if (n.fills) for (const f of n.fills) lines.push(`${sub}- fill: ${paintLine(f)}`);
  if (n.strokes) for (const s of n.strokes) lines.push(`${sub}- stroke: ${strokeLine(s)}`);
  if (n.effects) for (const e of n.effects) lines.push(`${sub}- effect: ${effectLine(e)}`);
  if (n.text) lines.push(`${sub}- text: ${textLine(n.text)}`);

  if (n.children) for (const c of n.children) renderNodeMD(c, lines, depth + 1, false);
}

function paintLine(f: PaintSpec): string {
  return f.token ? `\`${f.token}\` (${f.raw})` : f.raw;
}

function strokeLine(s: StrokeSpec): string {
  const base = paintLine(s);
  const w = s.weight !== undefined ? `${s.weight}px ` : '';
  const a = s.align ? ` (${s.align.toLowerCase()})` : '';
  return `${w}${base}${a}`;
}

function effectLine(e: EffectSpec): string {
  return e.token ? `\`${e.token}\` (${e.raw})` : `${e.type.toLowerCase()} ${e.raw}`;
}

function textLine(t: TextSpec): string {
  const head = t.style
    ? `\`${t.style}\``
    : `${t.fontFamily ?? '?'} ${t.fontSize ?? '?'}/${t.fontWeight ?? '?'}`;
  const color = t.color
    ? t.color.token
      ? ` color \`${t.color.token}\``
      : ` color ${t.color.value}`
    : '';
  const chars = t.characters?.replace(/\s+/g, ' ').trim();
  const preview = chars ? ` — "${chars.length > 60 ? chars.slice(0, 57) + '…' : chars}"` : '';
  return `${head}${color}${preview}`;
}

function padToStr(p: Padding): string {
  const { top, right, bottom, left } = p;
  if (top === right && right === bottom && bottom === left) return `${top}`;
  if (top === bottom && left === right) return `${top} ${right}`;
  return `${top} ${right} ${bottom} ${left}`;
}

function radiusToStr(r: Corners): string {
  if (typeof r === 'number') return `${r}`;
  const { tl, tr, bl, br } = r;
  if (tl === tr && tr === bl && bl === br) return `${tl}`;
  return `${tl} ${tr} ${br} ${bl}`;
}

function collectTokens(trees: ScreenNode[]): string[] {
  const set = new Set<string>();
  const visit = (n: ScreenNode) => {
    n.fills?.forEach((f) => f.token && set.add(f.token));
    n.strokes?.forEach((s) => s.token && set.add(s.token));
    n.effects?.forEach((e) => e.token && set.add(e.token));
    if (n.text?.style) set.add(n.text.style);
    if (n.text?.color?.token) set.add(n.text.color.token);
    n.children?.forEach(visit);
  };
  trees.forEach(visit);
  return [...set];
}

function collectComponents(trees: ScreenNode[]): string[] {
  const set = new Set<string>();
  const visit = (n: ScreenNode) => {
    if (n.instanceOf) set.add(n.instanceOf);
    n.children?.forEach(visit);
  };
  trees.forEach(visit);
  return [...set];
}

// ============================================================
// Helpers
// ============================================================

function absBox(node: SceneNode): { x: number; y: number; w: number; h: number } {
  const bb = (node as SceneNode & {
    absoluteBoundingBox?: { x: number; y: number; width: number; height: number } | null;
  }).absoluteBoundingBox;
  if (bb) return { x: bb.x, y: bb.y, w: bb.width, h: bb.height };
  return {
    x: 'x' in node ? (node as SceneNode & { x: number }).x : 0,
    y: 'y' in node ? (node as SceneNode & { y: number }).y : 0,
    w: 'width' in node ? (node as SceneNode & { width: number }).width : 0,
    h: 'height' in node ? (node as SceneNode & { height: number }).height : 0
  };
}

function nonZeroRadius(c: Corners): boolean {
  if (typeof c === 'number') return c > 0;
  return c.tl > 0 || c.tr > 0 || c.bl > 0 || c.br > 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
