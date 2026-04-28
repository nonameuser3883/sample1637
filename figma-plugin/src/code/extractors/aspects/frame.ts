import { MdBuilder } from '../../markdown/builder';
import type { AspectExtractor } from '../types';
import type { TokenResolver } from '../../tokens/resolver';
import {
  extractContainerSpec,
  extractLabelSpec,
  paddingToString,
  cornersToString,
  fillLine,
  strokeLine,
  shadowLine
} from '../composite/_shared';

const MAX_DEPTH = 5;
const LEAF_SHAPE_TYPES = new Set([
  'VECTOR',
  'RECTANGLE',
  'ELLIPSE',
  'POLYGON',
  'STAR',
  'LINE',
  'BOOLEAN_OPERATION'
]);
const CONTAINER_TYPES = new Set([
  'FRAME',
  'COMPONENT',
  'COMPONENT_SET',
  'GROUP',
  'SECTION'
]);

type FrameContext = {
  md: MdBuilder;
  resolver: TokenResolver;
  tokens: Set<string>;
  components: Set<string>;
  warnings: string[];
};

export const extractFrame: AspectExtractor = async (ctx) => {
  const md = new MdBuilder();
  const warnings: string[] = [];
  const tokens = new Set<string>();
  const components = new Set<string>();

  if (ctx.selection.length === 0) {
    return { markdown: '# Frame\n\nНичего не выделено.\n', warnings };
  }

  const fc: FrameContext = { md, resolver: ctx.resolver, tokens, components, warnings };

  for (let i = 0; i < ctx.selection.length; i++) {
    if (i > 0) md.hr();
    await describeRoot(ctx.selection[i], fc);
  }

  if (tokens.size > 0) {
    md.h2('Tokens used');
    md.p([...tokens].map((t) => `\`${t}\``).join(', '));
  }
  if (components.size > 0) {
    md.h2('Components used');
    for (const c of components) md.li(`\`${c}\``);
  }

  return { markdown: md.toString(), warnings };
};

async function describeRoot(node: SceneNode, fc: FrameContext): Promise<void> {
  const { md } = fc;
  md.h1(`Frame: ${node.name}`);

  const c = await extractContainerSpec(node, fc.resolver);
  const summary: string[] = [];
  if (c.width !== 'auto') summary.push(`w ${c.width}`);
  if (c.height !== 'auto') summary.push(`h ${c.height}`);
  if (c.layout !== 'NONE') summary.push(`${c.layout.toLowerCase()}-layout`);
  if (c.padding) summary.push(`padding ${paddingToString(c.padding)}`);
  if (c.itemSpacing !== null && c.itemSpacing > 0) summary.push(`gap ${c.itemSpacing}px`);
  if (c.radius !== null) summary.push(`radius ${cornersToString(c.radius)}`);
  if (summary.length > 0) md.p(summary.join(', '));

  const bg = fillLine(c);
  if (bg) {
    md.li(`**Background:** ${bg}`);
    if (c.fillToken) fc.tokens.add(c.fillToken);
  }
  const border = strokeLine(c);
  if (border) {
    md.li(`**Border:** ${border}`);
    if (c.strokeToken) fc.tokens.add(c.strokeToken);
  }
  const shadow = shadowLine(c);
  if (shadow) {
    md.li(`**Shadow:** ${shadow}`);
    if (c.shadowToken) fc.tokens.add(c.shadowToken);
  }

  md.h2('Structure');
  if ('children' in node && node.children.length > 0) {
    for (const child of node.children as readonly SceneNode[]) {
      await walkNode(child, fc, 0);
    }
  } else {
    md.p('(no children)');
    fc.warnings.push(`"${node.name}": leaf node — нечего обходить.`);
  }
}

async function walkNode(node: SceneNode, fc: FrameContext, depth: number): Promise<void> {
  const { md, resolver, tokens, components } = fc;
  const indent = '  '.repeat(depth);

  if (node.type === 'INSTANCE') {
    const main = await node.getMainComponentAsync();
    const componentName =
      main?.parent?.type === 'COMPONENT_SET' ? main.parent.name : main?.name ?? '(unknown)';
    components.add(componentName);
    md.raw(`${indent}- **${node.name}** → instance \`${componentName}\``);
    return;
  }

  if (node.type === 'TEXT') {
    const l = await extractLabelSpec(node, resolver);
    if (l.textStyleToken) tokens.add(l.textStyleToken);
    if (l.fillToken) tokens.add(l.fillToken);
    const style = l.textStyleToken
      ? `\`${l.textStyleToken}\``
      : `${l.fontFamily} ${l.fontSize}`;
    const color = l.fillToken ? `, color \`${l.fillToken}\`` : '';
    md.raw(`${indent}- **${node.name}**: text — ${style}${color}`);
    return;
  }

  if (LEAF_SHAPE_TYPES.has(node.type)) {
    const c = await extractContainerSpec(node, resolver);
    if (c.fillToken) tokens.add(c.fillToken);
    if (c.strokeToken) tokens.add(c.strokeToken);
    const size = `${Math.round(node.width)}×${Math.round(node.height)}`;
    const parts: string[] = [size];
    const bg = fillLine(c);
    if (bg) parts.push(`fill ${bg}`);
    const border = strokeLine(c);
    if (border) parts.push(`stroke ${border}`);
    md.raw(`${indent}- **${node.name}** (${node.type.toLowerCase()}): ${parts.join(', ')}`);
    return;
  }

  if (CONTAINER_TYPES.has(node.type)) {
    const c = await extractContainerSpec(node, resolver);
    if (c.fillToken) tokens.add(c.fillToken);
    if (c.strokeToken) tokens.add(c.strokeToken);
    if (c.shadowToken) tokens.add(c.shadowToken);

    const parts: string[] = [node.type.toLowerCase()];
    if (c.width !== 'auto') parts.push(`w ${c.width}`);
    if (c.height !== 'auto') parts.push(`h ${c.height}`);
    if (c.layout !== 'NONE') parts.push(c.layout.toLowerCase());
    if (c.padding) parts.push(`padding ${paddingToString(c.padding)}`);
    if (c.itemSpacing !== null && c.itemSpacing > 0) parts.push(`gap ${c.itemSpacing}px`);
    if (c.radius !== null) parts.push(`radius ${cornersToString(c.radius)}`);
    const bg = fillLine(c);
    if (bg) parts.push(`bg ${bg}`);
    const border = strokeLine(c);
    if (border) parts.push(`stroke ${border}`);
    const shadow = shadowLine(c);
    if (shadow) parts.push(`shadow`);

    md.raw(`${indent}- **${node.name}** (${parts.join(', ')})`);

    if ('children' in node && node.children.length > 0) {
      if (depth >= MAX_DEPTH - 1) {
        md.raw(`${indent}  …${node.children.length} children (depth limit ${MAX_DEPTH})`);
      } else {
        for (const child of node.children as readonly SceneNode[]) {
          await walkNode(child, fc, depth + 1);
        }
      }
    }
    return;
  }

  md.raw(`${indent}- **${node.name}** (${node.type.toLowerCase()})`);
}
