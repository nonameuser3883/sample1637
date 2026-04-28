import { MdBuilder } from '../../markdown/builder';
import { paintToString, effectToString, rgbToHex } from '../../markdown/formatters';
import type { AspectExtractor } from '../types';
import { extractCornerRadius, cornersToString, hasNonZeroRadius } from '../composite/_shared';

export const extractBackground: AspectExtractor = async (ctx) => {
  const warnings: string[] = [];

  if (ctx.selection.length === 0) {
    return {
      markdown: '# Node spec\n\nНичего не выделено.\n',
      warnings: ['Выдели нод в Figma.']
    };
  }

  const md = new MdBuilder();

  for (let i = 0; i < ctx.selection.length; i++) {
    if (i > 0) md.hr();
    const node = ctx.selection[i];
    const color = dominantColor(node);
    md.h1(color ? `Background — ${color}` : 'Background');
    await describe(node, md, ctx.resolver, warnings);
  }

  return { markdown: md.toString(), warnings };
};

export async function describeNodeSpec(
  node: SceneNode,
  md: MdBuilder,
  resolver: import('../../tokens/resolver').TokenResolver,
  warnings: string[]
): Promise<void> {
  return describe(node, md, resolver, warnings);
}

async function describe(
  node: SceneNode,
  md: MdBuilder,
  resolver: import('../../tokens/resolver').TokenResolver,
  warnings: string[]
): Promise<void> {
  // Size
  if ('width' in node && 'height' in node) {
    md.li(`**Size:** ${Math.round(node.width)} × ${Math.round(node.height)} px`);
  }

  // Radius
  const radius = extractCornerRadius(node);
  if (radius !== null && hasNonZeroRadius(radius)) {
    md.li(`**Radius:** ${cornersToString(roundCorners(radius))}`);
  }

  // Opacity / rotation
  const op = (node as SceneNode & { opacity?: number }).opacity;
  if (typeof op === 'number' && op < 1) md.li(`**Opacity:** ${Math.round(op * 100)}%`);
  const rot = (node as SceneNode & { rotation?: number }).rotation;
  if (typeof rot === 'number' && Math.abs(rot) > 0.01) {
    md.li(`**Rotation:** ${Math.round(rot * 100) / 100}°`);
  }

  // Fills
  const fillsHost = node as SceneNode & { fills?: readonly Paint[] | PluginAPI['mixed'] };
  if (fillsHost.fills === figma.mixed) {
    md.li(`**Fills:** mixed`);
    warnings.push(`"${node.name}": mixed fills.`);
  } else if (Array.isArray(fillsHost.fills) && fillsHost.fills.length > 0) {
    md.li(`**Fills:**`);
    for (let i = 0; i < fillsHost.fills.length; i++) {
      const p = fillsHost.fills[i];
      const visMark = p.visible === false ? ' _(hidden)_' : '';
      const value = richPaintToString(p);
      let token: string | null = null;
      try {
        token = (await resolver.resolveFill(node as never, i))?.tokenized ?? null;
      } catch {
        // ignore
      }
      const head = token ? `\`${token}\` (${value})` : value;
      md.raw(`  - ${head}${visMark}`);
    }
  }

  // Strokes
  const strokesHost = node as SceneNode & {
    strokes?: readonly Paint[];
    strokeWeight?: number | PluginAPI['mixed'];
    strokeAlign?: 'CENTER' | 'INSIDE' | 'OUTSIDE';
    strokeTopWeight?: number;
    strokeRightWeight?: number;
    strokeBottomWeight?: number;
    strokeLeftWeight?: number;
  };
  if (Array.isArray(strokesHost.strokes) && strokesHost.strokes.length > 0) {
    md.li(`**Strokes:**`);
    const sidesLabel = strokeSidesLabel(strokesHost);
    for (let i = 0; i < strokesHost.strokes.length; i++) {
      const p = strokesHost.strokes[i];
      const value = richPaintToString(p);
      let token: string | null = null;
      try {
        token = (await resolver.resolveStroke(node as never, i))?.tokenized ?? null;
      } catch {
        // ignore
      }
      const a = strokesHost.strokeAlign ? ` (${strokesHost.strokeAlign.toLowerCase()})` : '';
      const head = token ? `\`${token}\` (${value})` : value;
      md.raw(`  - ${sidesLabel}${head}${a}`);
    }
  }

  // Effects
  const effectsHost = node as SceneNode & { effects?: readonly Effect[] };
  if (Array.isArray(effectsHost.effects) && effectsHost.effects.length > 0) {
    md.li(`**Effects:**`);
    for (let i = 0; i < effectsHost.effects.length; i++) {
      const e = effectsHost.effects[i];
      const visMark = e.visible === false ? ' _(hidden)_' : '';
      const raw = effectToString(e);
      let token: string | null = null;
      try {
        token = (await resolver.resolveEffect(node as never, i))?.tokenized ?? null;
      } catch {
        // ignore
      }
      const head = token ? `\`${token}\` (${raw})` : `${e.type.toLowerCase()} ${raw}`;
      md.raw(`  - ${head}${visMark}`);
    }
  }

  // Text style (if it's a text node)
  if (node.type === 'TEXT') {
    const tn = node as TextNode;
    const styleToken = (await resolver.resolveText(tn))?.tokenized;
    const fontName = tn.fontName === figma.mixed ? null : (tn.fontName as FontName);
    const fontSize = tn.fontSize === figma.mixed ? null : (tn.fontSize as number);
    const fontWeight = tn.fontWeight === figma.mixed ? 'mixed' : (tn.fontWeight as number);
    md.li(`**Text:**`);
    if (styleToken) md.raw(`  - style: \`${styleToken}\``);
    if (fontName) md.raw(`  - font: ${fontName.family} ${fontName.style}`);
    if (fontSize !== null) md.raw(`  - size: ${fontSize}px`);
    if (fontWeight !== undefined) md.raw(`  - weight: ${fontWeight}`);
    const chars = tn.characters?.replace(/\s+/g, ' ').trim();
    if (chars) {
      const preview = chars.length > 80 ? chars.slice(0, 77) + '…' : chars;
      md.raw(`  - content: "${preview}"`);
    }
  }
}

function roundCorners(c: import('../composite/_shared').Corners): import('../composite/_shared').Corners {
  if (typeof c === 'number') return Math.round(c);
  return { tl: Math.round(c.tl), tr: Math.round(c.tr), bl: Math.round(c.bl), br: Math.round(c.br) };
}

export async function describeTextDescendants(
  node: SceneNode,
  md: MdBuilder,
  resolver: import('../../tokens/resolver').TokenResolver
): Promise<void> {
  const texts: TextNode[] = [];
  collectTexts(node, texts);
  if (texts.length === 0) return;

  md.li(`**Labels:**`);
  for (const tn of texts) {
    const styleToken = (await resolver.resolveText(tn))?.tokenized;
    const fontName = tn.fontName === figma.mixed ? null : (tn.fontName as FontName);
    const fontSize = tn.fontSize === figma.mixed ? null : (tn.fontSize as number);
    const fontWeight = tn.fontWeight === figma.mixed ? 'mixed' : (tn.fontWeight as number);

    let fillStr: string | null = null;
    const fills = tn.fills;
    if (Array.isArray(fills) && fills.length > 0) {
      const visible = fills.find((f) => f.visible !== false);
      if (visible) {
        const idx = fills.indexOf(visible);
        try {
          const tk = (await resolver.resolveFill(tn as never, idx))?.tokenized;
          fillStr = tk ? `\`${tk}\` (${paintToString(visible)})` : paintToString(visible);
        } catch {
          fillStr = paintToString(visible);
        }
      }
    }

    if (styleToken) md.raw(`  - style: \`${styleToken}\``);
    if (fontName) md.raw(`    - font: ${fontName.family} ${fontName.style}`);
    if (fontSize !== null) md.raw(`    - size: ${Math.round(fontSize)}px`);
    if (fontWeight !== undefined) md.raw(`    - weight: ${fontWeight}`);
    if (fillStr) md.raw(`    - color: ${fillStr}`);
    md.raw(`    - size box: ${Math.round(tn.width)} × ${Math.round(tn.height)} px`);
  }
}

function collectTexts(node: SceneNode, out: TextNode[]): void {
  if (node.type === 'TEXT') {
    out.push(node as TextNode);
    return;
  }
  if ('children' in node) {
    for (const child of (node as SceneNode & { children: readonly SceneNode[] }).children) {
      collectTexts(child, out);
    }
  }
}

function richPaintToString(p: Paint): string {
  if (
    p.type === 'GRADIENT_LINEAR' ||
    p.type === 'GRADIENT_RADIAL' ||
    p.type === 'GRADIENT_ANGULAR' ||
    p.type === 'GRADIENT_DIAMOND'
  ) {
    const g = p as GradientPaint;
    const stops = g.gradientStops
      .map((s) => `${rgbToHex(s.color)} ${(s.position * 100).toFixed(0)}%`)
      .join(', ');
    if (p.type === 'GRADIENT_LINEAR') {
      const angle = linearGradientAngle(g.gradientTransform);
      return `linear-gradient(${angle}deg, ${stops})`;
    }
    if (p.type === 'GRADIENT_RADIAL') {
      const meta = radialGradientMeta(g.gradientTransform);
      return `radial-gradient(${meta}, ${stops})`;
    }
    if (p.type === 'GRADIENT_ANGULAR') {
      const angle = linearGradientAngle(g.gradientTransform);
      return `conic-gradient(from ${angle}deg, ${stops})`;
    }
    return `diamond-gradient(${stops})`;
  }
  return paintToString(p);
}

function linearGradientAngle(t: Transform): number {
  // Figma gradient handle goes from (0,0) → (1,0) in *gradient* space.
  // gradientTransform maps node-space → gradient-space.
  // To get the visual direction in node-space, invert and apply to (1,0).
  const a = t[0][0], b = t[0][1];
  const c = t[1][0], d = t[1][1];
  const det = a * d - b * c;
  if (det === 0) return 0;
  // Inverse * (1, 0) = ( d/det, -c/det )
  const dx = d / det;
  const dy = -c / det;
  // Math angle (0 = right, CCW). Y is flipped in Figma (down is positive).
  const mathDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  // Convert to CSS: 0deg = up, clockwise.
  let css = (90 - mathDeg) % 360;
  if (css < 0) css += 360;
  return Math.round(css);
}

function radialGradientMeta(t: Transform): string {
  // For radial: gradientTransform's translation (column 3) plus scale gives center+radii.
  // Figma centers gradient at the inverse-transformed origin.
  const a = t[0][0], b = t[0][1], tx = t[0][2];
  const c = t[1][0], d = t[1][1], ty = t[1][2];
  const det = a * d - b * c;
  if (det === 0) return 'circle';
  const cx = (b * ty - d * tx) / det;
  const cy = (c * tx - a * ty) / det;
  const rx = Math.hypot(d / det, c / det);
  const ry = Math.hypot(b / det, a / det);
  return `at ${(cx * 100).toFixed(0)}% ${(cy * 100).toFixed(0)}%, rx ${rx.toFixed(2)} ry ${ry.toFixed(2)}`;
}

function strokeSidesLabel(host: {
  strokeWeight?: number | PluginAPI['mixed'];
  strokeTopWeight?: number;
  strokeRightWeight?: number;
  strokeBottomWeight?: number;
  strokeLeftWeight?: number;
}): string {
  if (typeof host.strokeWeight === 'number') {
    return host.strokeWeight > 0 ? `${host.strokeWeight}px ` : '';
  }
  const sides: { name: string; w: number }[] = [
    { name: 'top', w: host.strokeTopWeight ?? 0 },
    { name: 'right', w: host.strokeRightWeight ?? 0 },
    { name: 'bottom', w: host.strokeBottomWeight ?? 0 },
    { name: 'left', w: host.strokeLeftWeight ?? 0 }
  ];
  const active = sides.filter((s) => s.w > 0);
  if (active.length === 0) return '';
  if (active.length === 4) {
    const allSame = active.every((s) => s.w === active[0].w);
    if (allSame) return `${active[0].w}px `;
  }
  return active.map((s) => `${s.name} ${s.w}px`).join(', ') + ' — ';
}

function dominantColor(node: SceneNode): string | null {
  const fills = (node as SceneNode & { fills?: readonly Paint[] | PluginAPI['mixed'] }).fills;
  if (!Array.isArray(fills)) return null;
  for (const p of fills) {
    if (p.visible === false) continue;
    if (p.type === 'SOLID') return colorName((p as SolidPaint).color);
    if (
      p.type === 'GRADIENT_LINEAR' ||
      p.type === 'GRADIENT_RADIAL' ||
      p.type === 'GRADIENT_ANGULAR' ||
      p.type === 'GRADIENT_DIAMOND'
    ) {
      const stops = (p as GradientPaint).gradientStops;
      if (stops && stops.length > 0) return colorName(stops[0].color);
    }
  }
  return null;
}

void rgbToHex; // legacy import kept for potential reuse

function colorName(rgb: { r: number; g: number; b: number }): string {
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  if (l < 0.06) return 'black';
  if (l > 0.95) return 'white';
  if (s < 0.08) {
    if (l < 0.25) return 'almost black';
    if (l < 0.45) return 'dark gray';
    if (l < 0.65) return 'gray';
    if (l < 0.85) return 'light gray';
    return 'off-white';
  }

  const hue = hueName(h);
  const tone =
    l < 0.2 ? 'deep' :
    l < 0.35 ? 'dark' :
    l < 0.55 ? '' :
    l < 0.75 ? 'light' :
    'pale';
  const sat = s < 0.25 ? 'muted ' : s > 0.75 && l > 0.4 && l < 0.7 ? 'vivid ' : '';
  return `${sat}${tone ? tone + ' ' : ''}${hue}`.trim();
}

function hueName(h: number): string {
  // h in [0, 360)
  if (h < 15) return 'red';
  if (h < 35) return 'orange';
  if (h < 55) return 'amber';
  if (h < 70) return 'yellow';
  if (h < 95) return 'lime';
  if (h < 150) return 'green';
  if (h < 175) return 'teal';
  if (h < 200) return 'cyan';
  if (h < 230) return 'sky';
  if (h < 260) return 'blue';
  if (h < 285) return 'violet';
  if (h < 320) return 'magenta';
  if (h < 345) return 'pink';
  return 'red';
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return { h, s, l };
}
