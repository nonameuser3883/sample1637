import { MdBuilder } from '../../markdown/builder';
import {
  lineHeightToString,
  letterSpacingToString
} from '../../markdown/formatters';
import { formatTokenName } from '../../tokens/formatter';
import type { FullDSExtractor } from '../types';

export const extractAllTextStyles: FullDSExtractor = async (_ctx) => {
  const styles = await figma.getLocalTextStylesAsync();
  const md = new MdBuilder().h1('Text Styles');

  if (styles.length === 0) {
    md.p('No local Text Styles found.');
    return { markdown: md.toString(), warnings: ['Local Text Styles list пустой.'] };
  }

  // Group by top-level namespace, preserving Figma insertion order
  const groups = new Map<string, TextStyle[]>();
  for (const s of styles) {
    const top = s.name.split('/')[0].trim() || 'Other';
    const arr = groups.get(top) ?? [];
    arr.push(s);
    groups.set(top, arr);
  }

  md.p(`**Total:** ${styles.length} styles in ${groups.size} groups`);

  for (const [group, list] of groups) {
    md.h2(group);
    for (const s of list) {
      const token = formatTokenName(s.name);
      const lh = lineHeightToString(s.lineHeight);
      const ls = letterSpacingToString(s.letterSpacing);
      const parts = [
        `${s.fontName.family} ${s.fontSize}/${lh}`,
        s.fontName.style,
        ls !== '0' ? ls : null
      ]
        .filter(Boolean)
        .join(', ');
      const suffix = s.description ? ` — ${s.description.replace(/\s+/g, ' ')}` : '';
      md.li(`\`${token}\` — ${parts}${suffix}`);
    }
  }

  return {
    markdown: md.toString(),
    warnings: [`Exported ${styles.length} text styles in ${groups.size} groups.`]
  };
};
