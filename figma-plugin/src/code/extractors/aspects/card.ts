import { MdBuilder } from '../../markdown/builder';
import type { AspectExtractor } from '../types';
import type { TokenResolver } from '../../tokens/resolver';
import {
  resolveComponentSet,
  resolveToComponent,
  extractContainerSpec,
  extractLabelSpec,
  containerLine,
  fillLine,
  strokeLine,
  shadowLine,
  labelLine,
  paddingToString,
  cornersToString,
  listVariantProps,
  findVariantProp,
  findVariantByProps
} from '../composite/_shared';
import { crossProduct, comboLabel } from '../composite/_matrix';

const STATE_PATTERN = /state|status|selected/i;

export const extractCard: AspectExtractor = async (ctx) => {
  const md = new MdBuilder();
  const warnings: string[] = [];

  if (ctx.selection.length === 0) {
    return { markdown: '# Card\n\nНичего не выделено.\n', warnings };
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
  const allTokens = new Set<string>();

  if (!set) {
    const component = await resolveToComponent(node);
    const target = component ?? node;
    md.h1(`Card: ${target.name}`);
    md.h2('Anatomy');
    const c = await extractContainerSpec(target, resolver);
    md.li(`Container: ${containerLine(c)}`);
    const fill = fillLine(c);
    if (fill) md.li(`Background: ${fill}`);
    const stroke = strokeLine(c);
    if (stroke) md.li(`Border: ${stroke}`);
    const shadow = shadowLine(c);
    if (shadow) md.li(`Shadow: ${shadow}`);
    if ('children' in target && target.children.length > 0) {
      md.h2('Children');
      for (const child of target.children as readonly SceneNode[]) {
        await describeChild(child, md, resolver, allTokens, 0);
      }
    }
    warnings.push(`"${target.name}": не Component Set — выгружаю только текущий вид.`);
    return;
  }

  md.h1(`Card: ${set.name}`);
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

  const defaultState = stateProp
    ? stateProp.values.find((s) => /default|normal|rest|idle|unselected/i.test(s)) ?? stateProp.values[0]
    : null;

  const shapeCombos = crossProduct(shapeProps);
  md.h2(shapeCombos.length > 1 ? 'Structure by shape' : 'Structure');

  for (const combo of shapeCombos) {
    md.h3(comboLabel(combo));

    const baseProps =
      stateProp && defaultState ? { ...combo, [stateProp.propName]: defaultState } : combo;
    const base = findVariantByProps(set, baseProps);
    if (!base) {
      md.p('(вариант не найден)');
      continue;
    }

    const c = await extractContainerSpec(base, resolver);
    const anatomyParts: string[] = [];
    if (c.layout !== 'NONE') anatomyParts.push(`${c.layout.toLowerCase()}-layout`);
    if (c.width !== 'auto') anatomyParts.push(`w ${c.width}`);
    if (c.height !== 'auto') anatomyParts.push(`h ${c.height}`);
    if (c.padding) anatomyParts.push(`padding ${paddingToString(c.padding)}`);
    if (c.itemSpacing !== null && c.itemSpacing > 0) anatomyParts.push(`gap ${c.itemSpacing}px`);
    if (c.radius !== null) anatomyParts.push(`radius ${cornersToString(c.radius)}`);
    md.li(`**Anatomy:** ${anatomyParts.join(', ')}`);

    const bg = fillLine(c);
    if (bg) md.li(`**Background:** ${bg}`);
    const border = strokeLine(c);
    if (border) md.li(`**Border:** ${border}`);
    const shadow = shadowLine(c);
    if (shadow) md.li(`**Shadow:** ${shadow}`);
    if (c.fillToken) allTokens.add(c.fillToken);
    if (c.strokeToken) allTokens.add(c.strokeToken);
    if (c.shadowToken) allTokens.add(c.shadowToken);

    if ('children' in base && base.children.length > 0) {
      md.li('**Children:**');
      for (const child of base.children as readonly SceneNode[]) {
        await describeChild(child, md, resolver, allTokens, 1);
      }
    }

    if (stateProp) {
      md.blank();
      md.raw('| State | BG | Border | Shadow |');
      md.raw('|-------|----|--------|--------|');
      for (const state of stateProp.values) {
        const p = { ...combo, [stateProp.propName]: state };
        const variant = findVariantByProps(set, p);
        if (!variant) {
          md.raw(`| \`${state}\` | — | — | — |`);
          continue;
        }
        const cs = await extractContainerSpec(variant, resolver);
        const bgCell = cs.fillToken ? `\`${cs.fillToken}\`` : cs.fill ?? '—';
        const borderCell = cs.strokeToken ? `\`${cs.strokeToken}\`` : cs.stroke ?? '—';
        const shadowCell = cs.shadowToken ? `\`${cs.shadowToken}\`` : cs.shadow ?? '—';
        if (cs.fillToken) allTokens.add(cs.fillToken);
        if (cs.strokeToken) allTokens.add(cs.strokeToken);
        if (cs.shadowToken) allTokens.add(cs.shadowToken);
        md.raw(`| \`${state}\` | ${bgCell} | ${borderCell} | ${shadowCell} |`);
      }
      md.blank();
    }
  }

  md.h2('Tokens used');
  if (allTokens.size > 0) {
    md.p([...allTokens].map((t) => `\`${t}\``).join(', '));
  } else {
    md.p('(no tokens bound — все значения raw)');
  }
}

async function describeChild(
  node: SceneNode,
  md: MdBuilder,
  resolver: TokenResolver,
  tokens: Set<string>,
  depth: number
): Promise<void> {
  const indent = '  '.repeat(depth);
  if (node.type === 'TEXT') {
    const l = await extractLabelSpec(node, resolver);
    if (l.textStyleToken) tokens.add(l.textStyleToken);
    if (l.fillToken) tokens.add(l.fillToken);
    md.raw(`${indent}- ${node.name}: text — ${labelLine(l)}`);
    return;
  }
  // Note: labelLine already returns without text sample after _shared.ts update
  const c = await extractContainerSpec(node, resolver);
  if (c.fillToken) tokens.add(c.fillToken);
  if (c.strokeToken) tokens.add(c.strokeToken);
  const parts: string[] = [];
  const f = fillLine(c);
  if (f) parts.push(`bg ${f}`);
  const s = strokeLine(c);
  if (s) parts.push(`border ${s}`);
  if (c.radius !== null) {
    const r = typeof c.radius === 'number' ? `${c.radius}px` : 'per-corner';
    parts.push(`radius ${r}`);
  }
  const desc = parts.length > 0 ? ` — ${parts.join(', ')}` : '';
  md.raw(`${indent}- ${node.name} (${node.type.toLowerCase()})${desc}`);
  if (depth < 2 && 'children' in node) {
    for (const child of node.children as readonly SceneNode[]) {
      await describeChild(child, md, resolver, tokens, depth + 1);
    }
  }
}
