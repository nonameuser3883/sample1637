import { MdBuilder } from '../../markdown/builder';
import type { AspectExtractor } from '../types';
import { extractTypography } from './typography';
import { extractBackground } from './background';
import { extractBorder } from './border';
import { extractShadow } from './shadow';
import { extractRadius } from './radius';
import { extractSpacing } from './spacing';
import { extractLayout } from './layout';
import { extractIcon } from './icon';

const PIPELINE: [string, AspectExtractor][] = [
  ['Typography', extractTypography],
  ['Background', extractBackground],
  ['Border', extractBorder],
  ['Shadow', extractShadow],
  ['Radius', extractRadius],
  ['Spacing', extractSpacing],
  ['Layout', extractLayout],
  ['Icons', extractIcon]
];

const EMPTY_HINTS = [
  'Не найдено',
  'Fill не найден',
  'Stroke не найден',
  'Effect не найден',
  'Radius > 0 не найден',
  'нет TEXT-нод',
  'Не найдено иконок',
  'Нет auto-layout'
];

export const extractAll: AspectExtractor = async (ctx) => {
  const md = new MdBuilder().h1('Selection — all aspects');
  const warnings: string[] = [];
  let emittedCount = 0;

  for (const [label, extractor] of PIPELINE) {
    const result = await extractor(ctx);
    warnings.push(...result.warnings);
    const trimmed = result.markdown.trim();
    const looksEmpty = EMPTY_HINTS.some((h) => trimmed.toLowerCase().includes(h.toLowerCase()));
    if (looksEmpty) continue;
    if (emittedCount > 0) md.hr();
    md.raw(trimmed);
    emittedCount++;
    void label;
  }

  if (emittedCount === 0) {
    md.p('В выделении не найдено данных для экспорта.');
  }

  return { markdown: md.toString(), warnings };
};
