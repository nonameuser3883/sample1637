import { MdBuilder } from '../../markdown/builder';
import { paintToString } from '../../markdown/formatters';
import { formatTokenName } from '../../tokens/formatter';
import type { FullDSExtractor } from '../types';

export const extractAllPaintStyles: FullDSExtractor = async (_ctx) => {
  const styles = await figma.getLocalPaintStylesAsync();
  const md = new MdBuilder().h1('Paint Styles');

  if (styles.length === 0) {
    md.p('No local Paint Styles found.');
    return { markdown: md.toString(), warnings: ['Local Paint Styles list пустой.'] };
  }

  const groups = new Map<string, PaintStyle[]>();
  for (const s of styles) {
    const top = s.name.split('/')[0].trim() || 'Other';
    const arr = groups.get(top) ?? [];
    arr.push(s);
    groups.set(top, arr);
  }

  md.p(`**Total:** ${styles.length} styles in ${groups.size} groups`);

  const warnings: string[] = [`Exported ${styles.length} paint styles in ${groups.size} groups.`];

  for (const [group, list] of groups) {
    md.h2(group);
    for (const s of list) {
      const token = formatTokenName(s.name);
      if (s.paints.length === 0) {
        warnings.push(`Style "${s.name}" has no paints.`);
        md.li(`\`${token}\` — (no paint)`);
        continue;
      }
      const values = s.paints.map(paintToString).join(' + ');
      const suffix = s.description ? ` — ${s.description.replace(/\s+/g, ' ')}` : '';
      md.li(`\`${token}\` — ${values}${suffix}`);
    }
  }

  return { markdown: md.toString(), warnings };
};
