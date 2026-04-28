import { MdBuilder } from '../../markdown/builder';
import { effectToString } from '../../markdown/formatters';
import { walk } from '../../traverse';
import type { AspectExtractor } from '../types';

type Entry = {
  tokenized: string | null;
  value: string;
  type: string;
  usage: number;
};

export const extractShadow: AspectExtractor = async (ctx) => {
  const entries = new Map<string, Entry>();

  for (const node of walk(ctx.selection)) {
    const effectsNode = node as SceneNode & {
      effects?: readonly Effect[];
      effectStyleId?: string | PluginAPI['mixed'];
    };
    if (!Array.isArray(effectsNode.effects) || effectsNode.effects.length === 0) continue;

    for (let i = 0; i < effectsNode.effects.length; i++) {
      const e = effectsNode.effects[i];
      if (e.visible === false) continue;
      const token = await ctx.resolver.resolveEffect(
        node as SceneNode & { effects: readonly Effect[]; effectStyleId?: string | PluginAPI['mixed'] },
        i
      );
      const value = effectToString(e);
      const key = token?.tokenized ?? `${e.type}|${value}`;
      const existing = entries.get(key);
      if (existing) existing.usage++;
      else
        entries.set(key, {
          tokenized: token?.tokenized ?? null,
          value,
          type: e.type,
          usage: 1
        });
    }
  }

  if (entries.size === 0) {
    return {
      markdown: '# Shadows & Effects\n\nEffect не найден.\n',
      warnings: ['Selection не содержит нод с effects.']
    };
  }

  const md = new MdBuilder().h1('Shadows & Effects');
  const shadows = [...entries.values()].filter((e) => e.type.endsWith('SHADOW'));
  const blurs = [...entries.values()].filter((e) => e.type.endsWith('BLUR'));

  if (shadows.length > 0) {
    md.h2('Shadows');
    for (const e of shadows) {
      const head = e.tokenized ? `\`${e.tokenized}\`` : e.type.toLowerCase().replace('_', '-');
      md.li(`${head} — ${e.value} (×${e.usage})`);
    }
  }
  if (blurs.length > 0) {
    md.h2('Blurs');
    for (const e of blurs) {
      const head = e.tokenized ? `\`${e.tokenized}\`` : e.type.toLowerCase().replace('_', '-');
      md.li(`${head} — ${e.value} (×${e.usage})`);
    }
  }

  return { markdown: md.toString(), warnings: [] };
};
