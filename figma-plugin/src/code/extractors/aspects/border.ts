import { MdBuilder } from '../../markdown/builder';
import { paintToString, strokeAlignLabel, type StrokeAlign } from '../../markdown/formatters';
import { hasStrokes, walk } from '../../traverse';
import type { AspectExtractor } from '../types';

type Entry = {
  tokenized: string | null;
  color: string;
  weight: number | 'mixed';
  align: string;
  dashes: string;
  usage: number;
};

export const extractBorder: AspectExtractor = async (ctx) => {
  const warnings: string[] = [];
  const entries = new Map<string, Entry>();

  for (const node of walk(ctx.selection)) {
    if (!hasStrokes(node)) continue;
    const strokes = node.strokes;
    if (!Array.isArray(strokes) || strokes.length === 0) continue;

    const strokeWeight =
      'strokeWeight' in node && node.strokeWeight !== undefined
        ? node.strokeWeight === figma.mixed
          ? ('mixed' as const)
          : (node.strokeWeight as number)
        : 1;
    const align: StrokeAlign =
      'strokeAlign' in node ? (node.strokeAlign as StrokeAlign) : 'CENTER';
    const dashes =
      'dashPattern' in node && Array.isArray((node as { dashPattern?: readonly number[] }).dashPattern)
        ? (node as { dashPattern: readonly number[] }).dashPattern.join(' ')
        : '';

    for (let i = 0; i < strokes.length; i++) {
      const paint = strokes[i];
      if (paint.visible === false) continue;

      const token = await ctx.resolver.resolveStroke(
        node as SceneNode & { strokes: readonly Paint[]; strokeStyleId?: string | PluginAPI['mixed'] },
        i
      );
      const color = paintToString(paint);
      const key = [token?.tokenized ?? color, strokeWeight, align, dashes].join('|');
      const existing = entries.get(key);
      if (existing) {
        existing.usage++;
      } else {
        entries.set(key, {
          tokenized: token?.tokenized ?? null,
          color,
          weight: strokeWeight,
          align: strokeAlignLabel(align),
          dashes,
          usage: 1
        });
      }
    }
  }

  if (entries.size === 0) {
    return {
      markdown: '# Borders\n\nStroke не найден в выделении.\n',
      warnings: ['Selection не содержит нод с stroke.']
    };
  }

  const md = new MdBuilder().h1('Borders');
  for (const e of [...entries.values()].sort((a, b) => b.usage - a.usage)) {
    const head = e.tokenized ? `\`${e.tokenized}\`` : e.color;
    const tail = e.tokenized ? ` (${e.color})` : '';
    const weight = e.weight === 'mixed' ? 'mixed' : `${e.weight}px`;
    const parts = [`${weight} solid ${head}${tail}`, `align: ${e.align}`];
    if (e.dashes) parts.push(`dashed [${e.dashes}]`);
    parts.push(`×${e.usage}`);
    md.li(parts.join(', '));
  }

  return { markdown: md.toString(), warnings };
};
