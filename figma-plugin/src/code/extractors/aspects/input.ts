import { MdBuilder } from '../../markdown/builder';
import type { AspectExtractor } from '../types';
import type { TokenResolver } from '../../tokens/resolver';
import {
  resolveComponentSet,
  resolveToComponent,
  extractContainerSpec,
  extractLabelSpec,
  findFirstText,
  containerLine,
  fillLine,
  strokeLine,
  labelLine,
  paddingToString,
  cornersToString,
  listVariantProps,
  findVariantProp,
  findVariantByProps
} from '../composite/_shared';
import { crossProduct, comboLabel } from '../composite/_matrix';

const STATE_PATTERN = /state|status|focus/i;

export const extractInput: AspectExtractor = async (ctx) => {
  const md = new MdBuilder();
  const warnings: string[] = [];

  if (ctx.selection.length === 0) {
    return { markdown: '# Input\n\nНичего не выделено.\n', warnings };
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
    md.h1(`Input: ${target.name}`);
    md.h2('Anatomy');
    const c = await extractContainerSpec(target, resolver);
    md.li(`Container: ${containerLine(c)}`);
    const fill = fillLine(c);
    if (fill) md.li(`Background: ${fill}`);
    const stroke = strokeLine(c);
    if (stroke) md.li(`Border: ${stroke}`);
    for (const t of collectAllText(target)) {
      const l = await extractLabelSpec(t, resolver);
      md.li(`Text "${t.name}": ${labelLine(l)}`);
    }
    warnings.push(`"${target.name}": не Component Set — выгружаю только текущий вид.`);
    return;
  }

  md.h1(`Input: ${set.name}`);
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
    ? stateProp.values.find((s) => /default|normal|rest|idle/i.test(s)) ?? stateProp.values[0]
    : null;

  const shapeCombos = crossProduct(shapeProps);
  const allTokens = new Set<string>();

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

    const textNodes = collectAllText(base);
    for (const t of textNodes) {
      const role = detectTextRole(t.name);
      const l = await extractLabelSpec(t, resolver);
      const head = l.textStyleToken
        ? `\`${l.textStyleToken}\``
        : `${l.fontFamily} ${l.fontSize}`;
      md.li(`**${role}:** ${head}`);
      if (l.textStyleToken) allTokens.add(l.textStyleToken);
    }

    if (stateProp) {
      md.blank();
      md.raw('| State | BG | Border | Text |');
      md.raw('|-------|----|--------|------|');
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
        if (cs.fillToken) allTokens.add(cs.fillToken);
        if (cs.strokeToken) allTokens.add(cs.strokeToken);
        const tx = findFirstText(variant);
        let textCell = '—';
        if (tx) {
          const l = await extractLabelSpec(tx, resolver);
          textCell = l.fillToken ? `\`${l.fillToken}\`` : l.fillValue ?? '—';
          if (l.fillToken) allTokens.add(l.fillToken);
        }
        md.raw(`| \`${state}\` | ${bgCell} | ${borderCell} | ${textCell} |`);
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

function detectTextRole(name: string): string {
  if (/placeholder/i.test(name)) return 'placeholder';
  if (/label/i.test(name)) return 'label';
  if (/helper|hint|caption/i.test(name)) return 'helper';
  if (/value/i.test(name)) return 'value';
  if (/error/i.test(name)) return 'error';
  return 'text';
}

function collectAllText(node: SceneNode): TextNode[] {
  const result: TextNode[] = [];
  const visit = (n: SceneNode) => {
    if (n.type === 'TEXT') result.push(n);
    if ('children' in n) for (const c of n.children) visit(c);
  };
  visit(node);
  return result;
}
