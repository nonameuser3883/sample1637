import { MdBuilder } from '../../markdown/builder';
import type { AspectExtractor } from '../types';
import type { TokenResolver } from '../../tokens/resolver';
import { describeNodeSpec } from './background';

const MAX_HEADING = 6;

export const extractStack: AspectExtractor = async (ctx) => {
  const warnings: string[] = [];

  if (ctx.selection.length === 0) {
    return {
      markdown: '# Stack\n\nНичего не выделено.\n',
      warnings: ['Выдели сложный фрейм в Figma.']
    };
  }

  const md = new MdBuilder();

  for (let i = 0; i < ctx.selection.length; i++) {
    if (i > 0) md.hr();
    const root = ctx.selection[i];
    const tone = colorTone(root);
    md.h1(tone ? `Stack — ${tone}` : 'Stack');
    await describeNodeSpec(root, md, ctx.resolver, warnings);

    if ('children' in root) {
      const kids = (root as SceneNode & { children?: readonly SceneNode[] }).children;
      if (kids && kids.length > 0) {
        for (const child of kids) {
          await walkNode(child, md, ctx.resolver, warnings, 2);
        }
      }
    }
  }

  return { markdown: md.toString(), warnings };
};

async function walkNode(
  node: SceneNode,
  md: MdBuilder,
  resolver: TokenResolver,
  warnings: string[],
  level: number
): Promise<void> {
  const headingLevel = Math.min(level, MAX_HEADING);
  const prefix = '#'.repeat(headingLevel);
  const tone = colorTone(node);
  const head = tone ? `${node.type.toLowerCase()} — ${tone}` : node.type.toLowerCase();
  md.raw(`${prefix} ${head}`);

  await describeNodeSpec(node, md, resolver, warnings);

  if ('children' in node) {
    const kids = (node as SceneNode & { children?: readonly SceneNode[] }).children;
    if (kids && kids.length > 0) {
      for (const child of kids) {
        await walkNode(child, md, resolver, warnings, level + 1);
      }
    }
  }
}

// ============================================================
// Color naming
// ============================================================

function colorTone(node: SceneNode): string | null {
  const fills = (node as SceneNode & { fills?: readonly Paint[] | PluginAPI['mixed'] }).fills;
  if (!Array.isArray(fills)) return null;
  for (const p of fills) {
    if (p.visible === false) continue;
    if (p.type === 'SOLID') return colorWord((p as SolidPaint).color);
    if (
      p.type === 'GRADIENT_LINEAR' ||
      p.type === 'GRADIENT_RADIAL' ||
      p.type === 'GRADIENT_ANGULAR' ||
      p.type === 'GRADIENT_DIAMOND'
    ) {
      const stops = (p as GradientPaint).gradientStops;
      if (!stops || stops.length === 0) continue;
      const avg = averageColor(stops.map((s) => s.color));
      return colorWord(avg);
    }
  }
  return null;
}

function averageColor(rgbs: { r: number; g: number; b: number }[]): {
  r: number;
  g: number;
  b: number;
} {
  let r = 0, g = 0, b = 0;
  for (const c of rgbs) {
    r += c.r;
    g += c.g;
    b += c.b;
  }
  const n = rgbs.length || 1;
  return { r: r / n, g: g / n, b: b / n };
}

function colorWord(rgb: { r: number; g: number; b: number }): string {
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
