import { MdBuilder } from '../../markdown/builder';
import {
  fontWeightName,
  lineHeightToString,
  letterSpacingToString
} from '../../markdown/formatters';
import { collect, isText } from '../../traverse';
import type { AspectExtractor } from '../types';

type Entry = {
  tokenized: string | null;
  family: string;
  style: string;
  weight: number;
  size: number;
  lineHeight: string;
  letterSpacing: string;
  usage: number;
  sample: string;
};

export const extractTypography: AspectExtractor = async (ctx) => {
  const warnings: string[] = [];
  const textNodes = collect(ctx.selection, isText);

  if (textNodes.length === 0) {
    return {
      markdown: '# Typography\n\nНет TEXT-нод в выделении.\n',
      warnings: ['Selection не содержит текстовых слоёв.']
    };
  }

  const entries = new Map<string, Entry>();

  for (const node of textNodes) {
    const styleRef = await ctx.resolver.resolveText(node);

    if (
      node.fontName === figma.mixed ||
      node.fontSize === figma.mixed ||
      node.fontWeight === figma.mixed
    ) {
      warnings.push(`"${node.name}": смешанное форматирование — пропущено.`);
      continue;
    }

    const fontName = node.fontName as FontName;
    const fontSize = node.fontSize as number;
    const fontWeight = node.fontWeight as number;
    const lh =
      node.lineHeight === figma.mixed
        ? 'mixed'
        : lineHeightToString(node.lineHeight as LineHeight);
    const ls =
      node.letterSpacing === figma.mixed
        ? 'mixed'
        : letterSpacingToString(node.letterSpacing as LetterSpacing);

    const key =
      styleRef?.tokenized ??
      `${fontName.family}|${fontName.style}|${fontSize}|${lh}|${ls}|${fontWeight}`;

    const existing = entries.get(key);
    if (existing) {
      existing.usage++;
    } else {
      entries.set(key, {
        tokenized: styleRef?.tokenized ?? null,
        family: fontName.family,
        style: fontName.style,
        weight: fontWeight,
        size: fontSize,
        lineHeight: lh,
        letterSpacing: ls,
        usage: 1,
        sample: node.characters.slice(0, 40)
      });
    }
  }

  const md = new MdBuilder().h1('Typography');
  const sorted = [...entries.values()].sort((a, b) => b.size - a.size);
  for (const e of sorted) {
    const head = e.tokenized ? `\`${e.tokenized}\`` : `${e.family} ${e.size}`;
    const body = [
      `${e.family} ${e.size}/${e.lineHeight}`,
      `${fontWeightName(e.weight)} (${e.weight})`,
      e.letterSpacing !== '0' ? e.letterSpacing : null,
      `×${e.usage}`
    ]
      .filter(Boolean)
      .join(', ');
    md.li(`${head} — ${body}`);
  }

  return { markdown: md.toString(), warnings };
};
