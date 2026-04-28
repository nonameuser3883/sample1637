import { paintToString, effectToString } from '../../markdown/formatters';
import type { TokenResolver } from '../../tokens/resolver';
import { walk } from '../../traverse';

export type Padding = { top: number; right: number; bottom: number; left: number };
export type Corners = number | { tl: number; tr: number; bl: number; br: number };

export type ContainerSpec = {
  name: string;
  width: string;
  height: string;
  layout: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  itemSpacing: number | null;
  padding: Padding | null;
  radius: Corners | null;
  fill: string | null;
  fillToken: string | null;
  stroke: string | null;
  strokeToken: string | null;
  strokeWeight: number | null;
  strokeAlign: string | null;
  shadow: string | null;
  shadowToken: string | null;
};

export type LabelSpec = {
  characters: string;
  textStyleToken: string | null;
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  fontStyle: string;
  fillToken: string | null;
  fillValue: string | null;
};

export async function resolveComponentSet(node: SceneNode): Promise<ComponentSetNode | null> {
  if (node.type === 'COMPONENT_SET') return node;
  if (node.type === 'COMPONENT') {
    return node.parent?.type === 'COMPONENT_SET' ? node.parent : null;
  }
  if (node.type === 'INSTANCE') {
    const main = await node.getMainComponentAsync();
    if (main?.parent?.type === 'COMPONENT_SET') return main.parent;
  }
  return null;
}

export async function resolveToComponent(node: SceneNode): Promise<ComponentNode | null> {
  if (node.type === 'COMPONENT') return node;
  if (node.type === 'INSTANCE') return await node.getMainComponentAsync();
  return null;
}

export function extractPadding(node: SceneNode): Padding | null {
  if (
    'paddingTop' in node &&
    'paddingRight' in node &&
    'paddingBottom' in node &&
    'paddingLeft' in node
  ) {
    return {
      top: (node as unknown as { paddingTop: number }).paddingTop,
      right: (node as unknown as { paddingRight: number }).paddingRight,
      bottom: (node as unknown as { paddingBottom: number }).paddingBottom,
      left: (node as unknown as { paddingLeft: number }).paddingLeft
    };
  }
  return null;
}

export function extractCornerRadius(node: SceneNode): Corners | null {
  if (!('cornerRadius' in node)) return null;
  const cr = (node as unknown as { cornerRadius: number | PluginAPI['mixed'] }).cornerRadius;
  if (cr === figma.mixed) {
    const get = (k: string) =>
      (node as unknown as Record<string, number | undefined>)[k];
    const tl = get('topLeftRadius');
    const tr = get('topRightRadius');
    const bl = get('bottomLeftRadius');
    const br = get('bottomRightRadius');
    if ([tl, tr, bl, br].every((x) => typeof x === 'number')) {
      return { tl: tl!, tr: tr!, bl: bl!, br: br! };
    }
    return null;
  }
  return cr;
}

export function paddingToString(p: Padding): string {
  const { top, right, bottom, left } = p;
  if (top === right && right === bottom && bottom === left) return `${top}px`;
  if (top === bottom && left === right) return `${top}px ${right}px`;
  return `${top}px ${right}px ${bottom}px ${left}px`;
}

export function cornersToString(c: Corners): string {
  if (typeof c === 'number') return `${c}px`;
  const { tl, tr, bl, br } = c;
  if (tl === tr && tr === bl && bl === br) return `${tl}px`;
  return `${tl}px ${tr}px ${br}px ${bl}px`;
}

export function findFirstText(node: SceneNode): TextNode | null {
  for (const n of walk([node])) {
    if (n.type === 'TEXT') return n;
  }
  return null;
}

export async function extractContainerSpec(
  node: SceneNode,
  resolver: TokenResolver
): Promise<ContainerSpec> {
  const spec: ContainerSpec = {
    name: node.name,
    width: 'auto',
    height: 'auto',
    layout: 'NONE',
    itemSpacing: null,
    padding: null,
    radius: null,
    fill: null,
    fillToken: null,
    stroke: null,
    strokeToken: null,
    strokeWeight: null,
    strokeAlign: null,
    shadow: null,
    shadowToken: null
  };

  if ('width' in node) spec.width = `${Math.round(node.width)}px`;
  if ('height' in node) spec.height = `${Math.round(node.height)}px`;

  const framelike = node as unknown as {
    layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
    itemSpacing?: number;
    layoutSizingHorizontal?: 'FIXED' | 'HUG' | 'FILL';
    layoutSizingVertical?: 'FIXED' | 'HUG' | 'FILL';
  };
  if (framelike.layoutMode) spec.layout = framelike.layoutMode;
  if (typeof framelike.itemSpacing === 'number') spec.itemSpacing = framelike.itemSpacing;
  if (framelike.layoutSizingHorizontal === 'HUG') spec.width = 'hug';
  if (framelike.layoutSizingHorizontal === 'FILL') spec.width = 'fill';
  if (framelike.layoutSizingVertical === 'HUG') spec.height = 'hug';
  if (framelike.layoutSizingVertical === 'FILL') spec.height = 'fill';

  spec.padding = extractPadding(node);
  spec.radius = extractCornerRadius(node);

  const fillsNode = node as SceneNode & { fills?: readonly Paint[] | PluginAPI['mixed'] };
  if (Array.isArray(fillsNode.fills) && fillsNode.fills.length > 0) {
    const visible = fillsNode.fills.find((f) => f.visible !== false);
    if (visible) {
      spec.fill = paintToString(visible);
      const idx = fillsNode.fills.indexOf(visible);
      const token = await resolver.resolveFill(
        node as SceneNode & { fills: readonly Paint[]; fillStyleId?: string | PluginAPI['mixed'] },
        idx
      );
      spec.fillToken = token?.tokenized ?? null;
    }
  }

  const strokesNode = node as SceneNode & {
    strokes?: readonly Paint[];
    strokeWeight?: number | PluginAPI['mixed'];
    strokeAlign?: 'CENTER' | 'INSIDE' | 'OUTSIDE';
  };
  if (Array.isArray(strokesNode.strokes) && strokesNode.strokes.length > 0) {
    const visible = strokesNode.strokes.find((s) => s.visible !== false);
    if (visible) {
      spec.stroke = paintToString(visible);
      const idx = strokesNode.strokes.indexOf(visible);
      const token = await resolver.resolveStroke(
        node as SceneNode & { strokes: readonly Paint[]; strokeStyleId?: string | PluginAPI['mixed'] },
        idx
      );
      spec.strokeToken = token?.tokenized ?? null;
      if (typeof strokesNode.strokeWeight === 'number') spec.strokeWeight = strokesNode.strokeWeight;
      spec.strokeAlign = strokesNode.strokeAlign ?? null;
    }
  }

  const effectsNode = node as SceneNode & { effects?: readonly Effect[] };
  if (Array.isArray(effectsNode.effects) && effectsNode.effects.length > 0) {
    const shadow = effectsNode.effects.find(
      (e) => (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') && e.visible !== false
    );
    if (shadow) {
      spec.shadow = effectToString(shadow);
      const idx = effectsNode.effects.indexOf(shadow);
      const token = await resolver.resolveEffect(
        node as SceneNode & { effects: readonly Effect[]; effectStyleId?: string | PluginAPI['mixed'] },
        idx
      );
      spec.shadowToken = token?.tokenized ?? null;
    }
  }

  return spec;
}

export async function extractLabelSpec(
  textNode: TextNode,
  resolver: TokenResolver
): Promise<LabelSpec> {
  const textStyleToken = (await resolver.resolveText(textNode))?.tokenized ?? null;
  const fontName = textNode.fontName === figma.mixed ? null : (textNode.fontName as FontName);
  const fontSize = textNode.fontSize === figma.mixed ? 0 : (textNode.fontSize as number);
  const fontWeight =
    textNode.fontWeight === figma.mixed ? 'mixed' : (textNode.fontWeight as number);

  let fillToken: string | null = null;
  let fillValue: string | null = null;
  const fills = textNode.fills;
  if (Array.isArray(fills) && fills.length > 0) {
    const visible = fills.find((f) => f.visible !== false);
    if (visible) {
      fillValue = paintToString(visible);
      const idx = fills.indexOf(visible);
      const token = await resolver.resolveFill(
        textNode as TextNode & { fills: readonly Paint[] },
        idx
      );
      fillToken = token?.tokenized ?? null;
    }
  }

  return {
    characters: textNode.characters.slice(0, 60),
    textStyleToken,
    fontFamily: fontName?.family ?? 'mixed',
    fontSize,
    fontWeight,
    fontStyle: fontName?.style ?? 'mixed',
    fillToken,
    fillValue
  };
}

export function containerLine(spec: ContainerSpec): string {
  const parts: string[] = [];
  parts.push(`${spec.layout === 'NONE' ? 'static' : spec.layout.toLowerCase()} layout`);
  parts.push(`${spec.width} × ${spec.height}`);
  if (spec.padding) parts.push(`padding ${paddingToString(spec.padding)}`);
  if (spec.itemSpacing !== null && spec.itemSpacing > 0) parts.push(`gap ${spec.itemSpacing}px`);
  if (spec.radius !== null) parts.push(`radius ${cornersToString(spec.radius)}`);
  return parts.join(', ');
}

export function fillLine(spec: ContainerSpec): string | null {
  if (!spec.fill) return null;
  return spec.fillToken ? `\`${spec.fillToken}\` (${spec.fill})` : spec.fill;
}

export function strokeLine(spec: ContainerSpec): string | null {
  if (!spec.stroke) return null;
  const value = spec.strokeToken ? `\`${spec.strokeToken}\` (${spec.stroke})` : spec.stroke;
  const weight = spec.strokeWeight !== null ? `${spec.strokeWeight}px` : '';
  const align = spec.strokeAlign ? ` (${spec.strokeAlign.toLowerCase()})` : '';
  return `${weight} ${value}${align}`.trim();
}

export function shadowLine(spec: ContainerSpec): string | null {
  if (!spec.shadow) return null;
  return spec.shadowToken ? `\`${spec.shadowToken}\` (${spec.shadow})` : spec.shadow;
}

export function labelLine(l: LabelSpec): string {
  if (l.fontFamily === 'mixed' || l.fontSize === 0) {
    const color = l.fillToken ? `\`${l.fillToken}\`` : l.fillValue ?? 'inherit';
    return `mixed styles, color ${color}`;
  }
  const head = l.textStyleToken
    ? `\`${l.textStyleToken}\``
    : `${l.fontFamily} ${l.fontSize} ${l.fontStyle}`;
  const color = l.fillToken ? `\`${l.fillToken}\`` : l.fillValue ?? 'inherit';
  return `${head}, color ${color}`;
}

export function hasNonZeroPadding(p: Padding): boolean {
  return p.top > 0 || p.right > 0 || p.bottom > 0 || p.left > 0;
}

export function hasNonZeroRadius(c: Corners): boolean {
  if (typeof c === 'number') return c > 0;
  return c.tl > 0 || c.tr > 0 || c.bl > 0 || c.br > 0;
}

export type VariantInfo = { propName: string; values: string[] };

export function listVariantProps(set: ComponentSetNode): VariantInfo[] {
  const defs = set.componentPropertyDefinitions;
  const result: VariantInfo[] = [];
  for (const propName of Object.keys(defs)) {
    const def = defs[propName];
    if (def.type === 'VARIANT') {
      result.push({ propName, values: [...(def.variantOptions ?? [])] });
    }
  }
  return result;
}

export function findVariantProp(set: ComponentSetNode, pattern: RegExp): VariantInfo | null {
  for (const v of listVariantProps(set)) {
    if (pattern.test(v.propName)) return v;
  }
  return null;
}

export function findVariantByProps(
  set: ComponentSetNode,
  props: Record<string, string>
): ComponentNode | null {
  for (const child of set.children) {
    if (child.type !== 'COMPONENT') continue;
    const cp = child.variantProperties;
    if (!cp) continue;
    let match = true;
    for (const [k, v] of Object.entries(props)) {
      if (cp[k] !== v) {
        match = false;
        break;
      }
    }
    if (match) return child;
  }
  return null;
}
