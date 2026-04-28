import { MdBuilder } from '../../markdown/builder';
import { effectToString } from '../../markdown/formatters';
import { formatTokenName } from '../../tokens/formatter';
import type { FullDSExtractor } from '../types';

export const extractAllEffectStyles: FullDSExtractor = async () => {
  const styles = await figma.getLocalEffectStylesAsync();
  const md = new MdBuilder().h1('Effect Styles');

  if (styles.length === 0) {
    md.p('No local Effect Styles found.');
    return { markdown: md.toString(), warnings: ['Нет локальных Effect Styles.'] };
  }

  const warnings: string[] = [`Exported ${styles.length} effect styles.`];

  const groups = new Map<string, EffectStyle[]>();
  for (const s of styles) {
    const top = s.name.split('/')[0].trim() || 'Other';
    const arr = groups.get(top) ?? [];
    arr.push(s);
    groups.set(top, arr);
  }

  for (const [groupName, list] of groups) {
    md.h2(groupName);
    for (const s of list) {
      const token = formatTokenName(s.name);
      if (s.effects.length === 0) {
        md.li(`\`${token}\` — (no effect)`);
        continue;
      }
      const values = s.effects
        .filter((e) => e.visible !== false)
        .map((e) => effectToString(e))
        .join(' + ');
      const desc = s.description ? ` — ${s.description.replace(/\s+/g, ' ')}` : '';
      md.li(`\`${token}\` — ${values}${desc}`);
    }
  }

  return { markdown: md.toString(), warnings };
};
