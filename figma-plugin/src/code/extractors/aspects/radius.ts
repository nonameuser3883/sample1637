import { MdBuilder } from '../../markdown/builder';
import { walk } from '../../traverse';
import type { AspectExtractor } from '../types';

type Entry = { tokenized: string | null; value: string; usage: number };

export const extractRadius: AspectExtractor = async (ctx) => {
  const entries = new Map<string, Entry>();

  for (const node of walk(ctx.selection)) {
    if (!('cornerRadius' in node)) continue;
    const cr = (node as unknown as { cornerRadius: number | PluginAPI['mixed'] }).cornerRadius;

    // Bound to Variable?
    let tokenized: string | null = null;
    const bv = (node as SceneNode & {
      boundVariables?: { cornerRadius?: VariableAlias; topLeftRadius?: VariableAlias };
    }).boundVariables;
    if (bv?.cornerRadius) {
      const ref = await ctx.resolver.resolveByBoundVariable(bv.cornerRadius);
      tokenized = ref?.tokenized ?? null;
    }

    if (cr === figma.mixed) {
      const get = (k: string) => (node as unknown as Record<string, number | undefined>)[k];
      const tl = get('topLeftRadius');
      const tr = get('topRightRadius');
      const bl = get('bottomLeftRadius');
      const br = get('bottomRightRadius');
      if ([tl, tr, bl, br].every((x) => typeof x === 'number')) {
        const value = `${tl} ${tr} ${br} ${bl} (per-corner)`;
        const key = tokenized ?? value;
        const existing = entries.get(key);
        if (existing) existing.usage++;
        else entries.set(key, { tokenized, value, usage: 1 });
      }
      continue;
    }
    if (typeof cr !== 'number' || cr === 0) continue;
    const value = `${cr}px`;
    const key = tokenized ?? value;
    const existing = entries.get(key);
    if (existing) existing.usage++;
    else entries.set(key, { tokenized, value, usage: 1 });
  }

  if (entries.size === 0) {
    return {
      markdown: '# Corner Radius\n\nRadius > 0 не найден.\n',
      warnings: []
    };
  }

  const md = new MdBuilder().h1('Corner Radius');
  const sorted = [...entries.values()].sort((a, b) => b.usage - a.usage);
  for (const e of sorted) {
    const head = e.tokenized ? `\`${e.tokenized}\`` : e.value;
    const tail = e.tokenized ? ` (${e.value})` : '';
    md.li(`${head}${tail} — ×${e.usage}`);
  }

  return { markdown: md.toString(), warnings: [] };
};
