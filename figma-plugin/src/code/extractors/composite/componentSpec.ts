import { MdBuilder } from '../../markdown/builder';
import type { TokenResolver } from '../../tokens/resolver';
import {
  extractContainerSpec,
  extractLabelSpec,
  findFirstText,
  fillLine,
  strokeLine,
  shadowLine,
  paddingToString,
  cornersToString,
  hasNonZeroPadding,
  hasNonZeroRadius,
  listVariantProps,
  findVariantByProps,
  type ContainerSpec,
  type LabelSpec
} from './_shared';
import { crossProduct, comboLabel } from './_matrix';
import { paintToString } from '../../markdown/formatters';

const STATE_HINTS = /state|status|focus|selected/i;
const MAX_VARIANT_VALUES_INLINE = 5;
const MAX_CONTENTS_DEPTH = 2;
const MAX_CONTENTS_CHILDREN_PER_NODE = 8;

export async function buildComponentSetSpec(
  set: ComponentSetNode,
  resolver: TokenResolver,
  tokens: Set<string>
): Promise<string> {
  const md = new MdBuilder();
  md.h1(`Component Set: ${set.name}`);
  if (set.description) md.p(`> ${set.description.replace(/\s+/g, ' ')}`);

  const variants = listVariantProps(set);
  if (variants.length === 0) {
    md.p('(no variant props)');
    return md.toString();
  }

  const meaningfulVariants = variants.filter((v) => v.values.length > 1);
  if (meaningfulVariants.length > 0) {
    md.h2('Variants');
    for (const v of meaningfulVariants) {
      md.li(`**${v.propName}**: ${formatVariantValueList(v.values)}`);
    }
  }

  const stateProp = variants.find((v) => STATE_HINTS.test(v.propName)) ?? null;
  const shapeProps = variants.filter((v) => v.propName !== stateProp?.propName);

  const defaultState = stateProp
    ? stateProp.values.find((s) => /default|normal|rest|idle|unselected/i.test(s)) ??
      stateProp.values[0]
    : null;

  const shapeCombos = crossProduct(shapeProps);
  const combos = await collectCombos(set, shapeCombos, stateProp, defaultState, resolver);

  if (combos.length === 0) {
    md.p('(no variants resolved)');
    return md.toString();
  }

  const groups = groupBySignature(combos);
  const singleGroup = groups.length === 1;

  md.h2('Structure');

  if (singleGroup) {
    const rep = groups[0][0];
    emitAnatomy(md, rep, tokens);
    await emitContents(md, rep.base, resolver, tokens);
    if (stateProp) await emitStateTable(md, set, rep.combo, stateProp, resolver, tokens);
  } else {
    for (const group of groups) {
      md.h3(formatGroupHeader(group));
      const rep = group[0];
      emitAnatomy(md, rep, tokens);
      await emitContents(md, rep.base, resolver, tokens);
      if (stateProp) await emitStateTable(md, set, rep.combo, stateProp, resolver, tokens);
    }
  }

  return md.toString();
}

export async function buildSingleComponentSpec(
  component: ComponentNode,
  resolver: TokenResolver,
  tokens: Set<string>
): Promise<string> {
  const md = new MdBuilder();
  const parent = component.parent;
  const inSet = parent?.type === 'COMPONENT_SET';

  const displayName = inSet ? parent.name : component.name;
  md.h1(`Component: ${displayName}`);
  const description = inSet ? parent.description : component.description;
  if (description) md.p(`> ${description.replace(/\s+/g, ' ')}`);

  md.h2('Structure');
  const c = await extractContainerSpec(component, resolver);
  if (c.fillToken) tokens.add(c.fillToken);
  if (c.strokeToken) tokens.add(c.strokeToken);
  if (c.shadowToken) tokens.add(c.shadowToken);

  const anatomy = anatomyParts(c);
  if (anatomy.length > 0) md.li(`**Anatomy:** ${anatomy.join(', ')}`);
  const bg = fillLine(c);
  if (bg) md.li(`**Background:** ${bg}`);
  const border = strokeLine(c);
  if (border) md.li(`**Border:** ${border}`);
  const shadow = shadowLine(c);
  if (shadow) md.li(`**Shadow:** ${shadow}`);

  const firstText = findFirstText(component);
  if (firstText) {
    const l = await extractLabelSpec(firstText, resolver);
    if (l.textStyleToken) tokens.add(l.textStyleToken);
    if (l.fillToken) tokens.add(l.fillToken);
    md.li(`**Text:** ${textLine(l)}`);
  }

  await emitContents(md, component, resolver, tokens);

  return md.toString();
}

// --- Helpers ---

type ComboData = {
  combo: Record<string, string>;
  base: ComponentNode;
  container: ContainerSpec;
  text: LabelSpec | null;
  signature: string;
};

async function collectCombos(
  set: ComponentSetNode,
  shapeCombos: Record<string, string>[],
  stateProp: { propName: string; values: string[] } | null,
  defaultState: string | null,
  resolver: TokenResolver
): Promise<ComboData[]> {
  const result: ComboData[] = [];
  for (const combo of shapeCombos) {
    const baseProps =
      stateProp && defaultState ? { ...combo, [stateProp.propName]: defaultState } : combo;
    const base = findVariantByProps(set, baseProps);
    if (!base) continue;
    const container = await extractContainerSpec(base, resolver);
    const firstText = findFirstText(base);
    const text = firstText ? await extractLabelSpec(firstText, resolver) : null;
    result.push({
      combo,
      base,
      container,
      text,
      signature: fingerprint(container, text)
    });
  }
  return result;
}

export async function computeVariantFingerprint(
  component: ComponentNode,
  resolver: TokenResolver
): Promise<string> {
  const container = await extractContainerSpec(component, resolver);
  const firstText = findFirstText(component);
  const text = firstText ? await extractLabelSpec(firstText, resolver) : null;
  const childrenHash = await hashChildren(component, resolver);
  return JSON.stringify({ core: fingerprint(container, text), children: childrenHash });
}

async function hashChildren(node: SceneNode, resolver: TokenResolver): Promise<string> {
  if (!('children' in node)) return '';
  const parts: string[] = [];
  for (const child of node.children as readonly SceneNode[]) {
    if (child.type === 'TEXT') {
      const l = await extractLabelSpec(child, resolver);
      parts.push(
        `T:${l.textStyleToken ?? ''}:${l.fillToken ?? l.fillValue ?? ''}:${l.fontSize}:${l.fontFamily}`
      );
      continue;
    }
    if (child.type === 'INSTANCE') {
      try {
        const main = await child.getMainComponentAsync();
        const name = main?.parent?.type === 'COMPONENT_SET' ? main.parent.name : main?.name ?? '';
        parts.push(`I:${name}`);
      } catch {
        parts.push('I:?');
      }
      continue;
    }
    const c = await extractContainerSpec(child, resolver);
    parts.push(
      `N:${child.type}:${Math.round(child.width)}x${Math.round(child.height)}:${c.fillToken ?? c.fill ?? ''}:${c.strokeToken ?? c.stroke ?? ''}`
    );
  }
  return parts.join('|');
}

function fingerprint(c: ContainerSpec, t: LabelSpec | null): string {
  return JSON.stringify({
    w: c.width,
    h: c.height,
    l: c.layout,
    p: c.padding,
    g: c.itemSpacing,
    r: c.radius,
    fT: c.fillToken,
    f: c.fill,
    sT: c.strokeToken,
    s: c.stroke,
    sw: c.strokeWeight,
    shT: c.shadowToken,
    sh: c.shadow,
    tT: t?.textStyleToken ?? null,
    tC: t?.fillToken ?? t?.fillValue ?? null,
    tS: t?.fontSize ?? null,
    tF: t?.fontFamily ?? null,
    tW: t?.fontWeight ?? null
  });
}

function groupBySignature(combos: ComboData[]): ComboData[][] {
  const groups = new Map<string, ComboData[]>();
  for (const c of combos) {
    const arr = groups.get(c.signature) ?? [];
    arr.push(c);
    groups.set(c.signature, arr);
  }
  return [...groups.values()];
}

function formatGroupHeader(group: ComboData[]): string {
  if (group.length === 1) return comboLabel(group[0].combo);
  if (group.length <= 3) return group.map((c) => comboLabel(c.combo)).join(', ');
  const first = group
    .slice(0, 2)
    .map((c) => comboLabel(c.combo))
    .join(', ');
  return `${first} … +${group.length - 2} more`;
}

function formatVariantValueList(values: string[]): string {
  if (values.length <= MAX_VARIANT_VALUES_INLINE) {
    return values.map((x) => `\`${x}\``).join(' | ');
  }
  const shown = values
    .slice(0, MAX_VARIANT_VALUES_INLINE - 1)
    .map((x) => `\`${x}\``)
    .join(' | ');
  return `${shown} … +${values.length - (MAX_VARIANT_VALUES_INLINE - 1)} more`;
}

function emitAnatomy(md: MdBuilder, combo: ComboData, tokens: Set<string>): void {
  const c = combo.container;
  if (c.fillToken) tokens.add(c.fillToken);
  if (c.strokeToken) tokens.add(c.strokeToken);
  if (c.shadowToken) tokens.add(c.shadowToken);

  const anatomy = anatomyParts(c);
  if (anatomy.length > 0) md.li(`**Anatomy:** ${anatomy.join(', ')}`);

  const bg = fillLine(c);
  if (bg) md.li(`**Background:** ${bg}`);
  const border = strokeLine(c);
  if (border) md.li(`**Border:** ${border}`);
  const shadow = shadowLine(c);
  if (shadow) md.li(`**Shadow:** ${shadow}`);

  if (combo.text) {
    if (combo.text.textStyleToken) tokens.add(combo.text.textStyleToken);
    if (combo.text.fillToken) tokens.add(combo.text.fillToken);
    md.li(`**Text:** ${textLine(combo.text)}`);
  }
}

function anatomyParts(c: ContainerSpec): string[] {
  const parts: string[] = [];
  if (c.layout !== 'NONE') parts.push(`${c.layout.toLowerCase()}-layout`);
  if (c.width !== 'auto') parts.push(`w ${c.width}`);
  if (c.height !== 'auto') parts.push(`h ${c.height}`);
  if (c.padding && hasNonZeroPadding(c.padding)) {
    parts.push(`padding ${paddingToString(c.padding)}`);
  }
  if (c.itemSpacing !== null && c.itemSpacing > 0) parts.push(`gap ${c.itemSpacing}px`);
  if (c.radius !== null && hasNonZeroRadius(c.radius)) {
    parts.push(`radius ${cornersToString(c.radius)}`);
  }
  return parts;
}

function textLine(l: LabelSpec): string {
  if (l.fontFamily === 'mixed' || l.fontSize === 0) {
    const color = l.fillToken ? ` color \`${l.fillToken}\`` : l.fillValue ? ` color ${l.fillValue}` : '';
    return `mixed styles${color}`;
  }
  const head = l.textStyleToken
    ? `\`${l.textStyleToken}\``
    : `${l.fontFamily} ${l.fontSize} ${l.fontStyle}`;
  const color = l.fillToken ? ` color \`${l.fillToken}\`` : l.fillValue ? ` color ${l.fillValue}` : '';
  return `${head}${color}`;
}

async function emitContents(
  md: MdBuilder,
  node: SceneNode,
  resolver: TokenResolver,
  tokens: Set<string>
): Promise<void> {
  const lines: string[] = [];
  await appendContentsLines(node, resolver, tokens, lines, 0);
  if (lines.length === 0) return;
  md.li('**Contents:**');
  for (const line of lines) md.raw(line);
}

async function emitStateTable(
  md: MdBuilder,
  set: ComponentSetNode,
  baseCombo: Record<string, string>,
  stateProp: { propName: string; values: string[] },
  resolver: TokenResolver,
  tokens: Set<string>
): Promise<void> {
  md.blank();
  md.raw('| State | Fill | Border | Text |');
  md.raw('|-------|------|--------|------|');
  for (const state of stateProp.values) {
    const variant = findVariantByProps(set, { ...baseCombo, [stateProp.propName]: state });
    if (!variant) {
      md.raw(`| \`${state}\` | — | — | — |`);
      continue;
    }
    const cs = await extractContainerSpec(variant, resolver);
    const fillCell = cs.fillToken ? `\`${cs.fillToken}\`` : cs.fill ?? '—';
    const borderCell = cs.strokeToken ? `\`${cs.strokeToken}\`` : cs.stroke ?? '—';
    if (cs.fillToken) tokens.add(cs.fillToken);
    if (cs.strokeToken) tokens.add(cs.strokeToken);
    const tx = findFirstText(variant);
    let textCell = '—';
    if (tx) {
      const l = await extractLabelSpec(tx, resolver);
      textCell = l.fillToken ? `\`${l.fillToken}\`` : l.fillValue ?? '—';
      if (l.fillToken) tokens.add(l.fillToken);
    }
    md.raw(`| \`${state}\` | ${fillCell} | ${borderCell} | ${textCell} |`);
  }
  md.blank();
}

async function appendContentsLines(
  node: SceneNode,
  resolver: TokenResolver,
  tokens: Set<string>,
  lines: string[],
  depth: number
): Promise<void> {
  if (!('children' in node) || node.children.length === 0) return;
  if (depth >= MAX_CONTENTS_DEPTH) {
    lines.push(`${indent(depth + 1)}…${node.children.length} children`);
    return;
  }
  const kids = node.children as readonly SceneNode[];
  const shown = kids.slice(0, MAX_CONTENTS_CHILDREN_PER_NODE);

  for (const child of shown) {
    if (child.type === 'INSTANCE') {
      let compName = '(unknown)';
      try {
        const main = await child.getMainComponentAsync();
        compName =
          main?.parent?.type === 'COMPONENT_SET' ? main.parent.name : main?.name ?? '(unknown)';
      } catch {
        // ignore
      }
      lines.push(`${indent(depth + 1)}- ${child.name} → instance \`${compName}\``);
      continue;
    }

    if (child.type === 'TEXT') {
      const l = await extractLabelSpec(child, resolver);
      if (l.textStyleToken) tokens.add(l.textStyleToken);
      if (l.fillToken) tokens.add(l.fillToken);
      lines.push(`${indent(depth + 1)}- ${child.name}: text — ${textLine(l)}`);
      continue;
    }

    const c = await extractContainerSpec(child, resolver);
    if (c.fillToken) tokens.add(c.fillToken);
    if (c.strokeToken) tokens.add(c.strokeToken);
    const parts: string[] = [`${Math.round(child.width)}×${Math.round(child.height)}`];
    const fills = (child as SceneNode & { fills?: readonly Paint[] | PluginAPI['mixed'] }).fills;
    if (Array.isArray(fills) && fills.length > 0) {
      const visible = fills.find((f) => f.visible !== false);
      if (visible) {
        const token = c.fillToken;
        parts.push(`fill ${token ? `\`${token}\`` : paintToString(visible)}`);
      }
    }
    const strokes = (child as SceneNode & { strokes?: readonly Paint[] }).strokes;
    if (Array.isArray(strokes) && strokes.length > 0) {
      const visible = strokes.find((s) => s.visible !== false);
      if (visible) {
        parts.push(`stroke ${c.strokeToken ? `\`${c.strokeToken}\`` : paintToString(visible)}`);
      }
    }
    lines.push(
      `${indent(depth + 1)}- ${child.name} (${child.type.toLowerCase()}): ${parts.join(', ')}`
    );

    if (
      'children' in child &&
      (child.children as readonly SceneNode[]).length > 0 &&
      depth + 1 < MAX_CONTENTS_DEPTH
    ) {
      await appendContentsLines(child, resolver, tokens, lines, depth + 1);
    }
  }

  if (kids.length > shown.length) {
    lines.push(`${indent(depth + 1)}…+${kids.length - shown.length} more children`);
  }
}

function indent(depth: number): string {
  return '  '.repeat(depth);
}
