import { MdBuilder } from '../../markdown/builder';
import { walk } from '../../traverse';
import type { AspectExtractor } from '../types';

type Entry = { tokenized: string | null; value: number; usage: number };

export const extractSpacing: AspectExtractor = async (ctx) => {
  const paddings = new Map<string, Entry>();
  const gaps = new Map<string, Entry>();

  for (const node of walk(ctx.selection)) {
    const bv = (node as SceneNode & { boundVariables?: Record<string, VariableAlias> }).boundVariables;

    for (const prop of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] as const) {
      if (prop in node) {
        const v = (node as unknown as Record<string, number | undefined>)[prop];
        if (typeof v !== 'number' || v === 0) continue;
        let tokenized: string | null = null;
        if (bv?.[prop]) {
          const ref = await ctx.resolver.resolveByBoundVariable(bv[prop]);
          tokenized = ref?.tokenized ?? null;
        }
        addEntry(paddings, tokenized, v);
      }
    }

    if ('itemSpacing' in node) {
      const v = (node as unknown as { itemSpacing: number }).itemSpacing;
      if (typeof v === 'number' && v > 0) {
        let tokenized: string | null = null;
        if (bv?.['itemSpacing']) {
          const ref = await ctx.resolver.resolveByBoundVariable(bv['itemSpacing']);
          tokenized = ref?.tokenized ?? null;
        }
        addEntry(gaps, tokenized, v);
      }
    }
  }

  if (paddings.size === 0 && gaps.size === 0) {
    return {
      markdown: '# Spacing\n\nНе найдено padding/gap > 0 в выделении.\n',
      warnings: []
    };
  }

  const md = new MdBuilder().h1('Spacing');
  if (paddings.size > 0) {
    md.h2('Padding');
    for (const e of [...paddings.values()].sort((a, b) => b.usage - a.usage)) {
      const head = e.tokenized ? `\`${e.tokenized}\`` : `${e.value}px`;
      const tail = e.tokenized ? ` (${e.value}px)` : '';
      md.li(`${head}${tail} — ×${e.usage}`);
    }
  }
  if (gaps.size > 0) {
    md.h2('Gap / ItemSpacing');
    for (const e of [...gaps.values()].sort((a, b) => b.usage - a.usage)) {
      const head = e.tokenized ? `\`${e.tokenized}\`` : `${e.value}px`;
      const tail = e.tokenized ? ` (${e.value}px)` : '';
      md.li(`${head}${tail} — ×${e.usage}`);
    }
  }

  return { markdown: md.toString(), warnings: [] };
};

function addEntry(
  map: Map<string, { tokenized: string | null; value: number; usage: number }>,
  tokenized: string | null,
  value: number
): void {
  const key = tokenized ?? `${value}`;
  const existing = map.get(key);
  if (existing) existing.usage++;
  else map.set(key, { tokenized, value, usage: 1 });
}
