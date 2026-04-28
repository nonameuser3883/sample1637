import { MdBuilder } from '../../markdown/builder';
import type { AspectExtractor } from '../types';
import type { TokenResolver } from '../../tokens/resolver';
import {
  resolveComponentSet,
  resolveToComponent,
  listVariantProps,
  findVariantProp,
  findVariantByProps
} from '../composite/_shared';
import { crossProduct, comboLabel } from '../composite/_matrix';
import { describeNodeSpec, describeTextDescendants } from './background';

const STATE_PATTERN = /state|status|focus|selected/i;
const LABEL = 'Button Premium';

function colorTone(node: SceneNode): string | null {
  const fills = (node as SceneNode & { fills?: readonly Paint[] | PluginAPI['mixed'] }).fills;
  if (!Array.isArray(fills)) return findInChildren(node);

  // Average gradient stops if it's a gradient — premium buttons usually have 2-4 stops
  for (const p of fills) {
    if (p.visible === false) continue;
    if (p.type === 'SOLID') return premiumName((p as SolidPaint).color);
    if (
      p.type === 'GRADIENT_LINEAR' ||
      p.type === 'GRADIENT_RADIAL' ||
      p.type === 'GRADIENT_ANGULAR' ||
      p.type === 'GRADIENT_DIAMOND'
    ) {
      const stops = (p as GradientPaint).gradientStops;
      if (!stops || stops.length === 0) continue;
      const avg = averageColor(stops.map((s) => s.color));
      return premiumName(avg);
    }
  }
  return findInChildren(node);
}

function findInChildren(node: SceneNode): string | null {
  if (!('children' in node)) return null;
  for (const c of (node as SceneNode & { children: readonly SceneNode[] }).children) {
    const t = colorTone(c);
    if (t) return t;
  }
  return null;
}

function averageColor(rgbs: { r: number; g: number; b: number }[]): { r: number; g: number; b: number } {
  let r = 0, g = 0, b = 0;
  for (const c of rgbs) {
    r += c.r;
    g += c.g;
    b += c.b;
  }
  const n = rgbs.length || 1;
  return { r: r / n, g: g / n, b: b / n };
}

function premiumName(rgb: { r: number; g: number; b: number }): string {
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Premium-flavored buckets first
  if (s < 0.08) {
    if (l > 0.78) return 'platinum';
    if (l > 0.55) return 'silver';
    if (l < 0.2) return 'obsidian';
  }
  // Gold range — yellow/amber, mid-high lightness, high saturation
  if (h >= 30 && h <= 65 && s > 0.4 && l >= 0.35 && l <= 0.75) return 'golden';
  // Bronze — dark amber/orange
  if (h >= 15 && h <= 45 && s > 0.3 && l >= 0.18 && l < 0.4) return 'bronze';
  // Rose gold — pink/light red with amber tint
  if (h >= 0 && h <= 25 && s > 0.25 && l >= 0.55 && l <= 0.8) return 'rose gold';
  // Emerald — vivid green
  if (h >= 130 && h <= 165 && s > 0.5 && l >= 0.25 && l <= 0.55) return 'emerald';
  // Sapphire — vivid blue
  if (h >= 215 && h <= 245 && s > 0.5 && l >= 0.2 && l <= 0.5) return 'sapphire';
  // Ruby — vivid red
  if (h >= 340 || h <= 10) {
    if (s > 0.5 && l >= 0.25 && l <= 0.55) return 'ruby';
  }
  // Amethyst — vivid violet
  if (h >= 260 && h <= 290 && s > 0.4 && l >= 0.25 && l <= 0.6) return 'amethyst';

  // Fallback to generic descriptor
  return colorWord(h, s, l);
}

function colorWord(h: number, s: number, l: number): string {
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
  let sa = 0;
  if (max !== min) {
    const d = max - min;
    sa = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return { h, s: sa, l };
}

export const extractButtonPremium: AspectExtractor = async (ctx) => {
  const md = new MdBuilder();
  const warnings: string[] = [];

  if (ctx.selection.length === 0) {
    return { markdown: `# ${LABEL}\n\nНичего не выделено.\n`, warnings };
  }

  for (let i = 0; i < ctx.selection.length; i++) {
    if (i > 0) md.hr();
    await extractOne(ctx.selection[i], md, warnings, ctx.resolver);
  }

  return { markdown: md.toString(), warnings };
};

async function extractOne(
  node: SceneNode,
  md: MdBuilder,
  warnings: string[],
  resolver: TokenResolver
): Promise<void> {
  const set = await resolveComponentSet(node);

  if (!set) {
    const component = await resolveToComponent(node);
    const target = component ?? node;
    const tone = colorTone(target);
    md.h1(`${LABEL}: ${target.name}${tone ? ` — ${tone}` : ''}`);
    await describeNodeSpec(target, md, resolver, warnings);
    await describeTextDescendants(target, md, resolver);
    return;
  }

  // Take first variant for color-tone fingerprint
  const firstVariant =
    (set.children.find((c) => c.type === 'COMPONENT') as ComponentNode | undefined) ?? null;
  const tone = firstVariant ? colorTone(firstVariant) : null;
  md.h1(`${LABEL}: ${set.name}${tone ? ` — ${tone}` : ''}`);
  if (set.description) md.p(`> ${set.description.replace(/\s+/g, ' ')}`);

  const variants = listVariantProps(set);
  const stateProp = findVariantProp(set, STATE_PATTERN);
  const shapeProps = variants.filter((v) => v.propName !== stateProp?.propName);

  if (variants.length > 0) {
    md.h2('Variants');
    for (const v of variants) {
      md.li(`**${v.propName}**: ${v.values.map((x) => `\`${x}\``).join(' | ')}`);
    }
  }

  const shapeCombos = crossProduct(shapeProps);

  for (const combo of shapeCombos) {
    if (stateProp) {
      md.h2(shapeCombos.length > 1 ? `Shape: ${comboLabel(combo)}` : 'States');
      for (const state of stateProp.values) {
        const props = { ...combo, [stateProp.propName]: state };
        const variant = findVariantByProps(set, props);
        md.h3(`${stateProp.propName} = \`${state}\``);
        if (!variant) {
          md.p('(вариант не найден в наборе)');
          continue;
        }
        await describeNodeSpec(variant, md, resolver, warnings);
        await describeTextDescendants(variant, md, resolver);
      }
    } else {
      const variant = findVariantByProps(set, combo);
      md.h2(shapeCombos.length > 1 ? `Variant: ${comboLabel(combo)}` : 'Spec');
      if (!variant) {
        md.p('(вариант не найден в наборе)');
        continue;
      }
      await describeNodeSpec(variant, md, resolver, warnings);
      await describeTextDescendants(variant, md, resolver);
    }
  }
}
