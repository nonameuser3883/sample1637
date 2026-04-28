import { MdBuilder } from '../../markdown/builder';
import { paddingToString } from '../composite/_shared';
import type { AspectExtractor } from '../types';

type FrameLike = SceneNode & {
  layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  itemSpacing?: number;
  counterAxisSpacing?: number | null;
  primaryAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE';
  layoutWrap?: 'NO_WRAP' | 'WRAP';
  layoutSizingHorizontal?: 'FIXED' | 'HUG' | 'FILL';
  layoutSizingVertical?: 'FIXED' | 'HUG' | 'FILL';
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
};

export const extractLayout: AspectExtractor = async (ctx) => {
  const md = new MdBuilder().h1('Layout');
  const warnings: string[] = [];
  let found = 0;

  for (const node of ctx.selection) {
    const f = node as FrameLike;
    if (!f.layoutMode || f.layoutMode === 'NONE') continue;
    found++;

    md.h2(node.name);
    md.li(`Direction: **${f.layoutMode.toLowerCase()}**`);
    if (typeof f.paddingTop === 'number') {
      md.li(
        `Padding: ${paddingToString({
          top: f.paddingTop,
          right: f.paddingRight ?? 0,
          bottom: f.paddingBottom ?? 0,
          left: f.paddingLeft ?? 0
        })}`
      );
    }
    if (typeof f.itemSpacing === 'number') md.li(`Gap (main): ${f.itemSpacing}px`);
    if (typeof f.counterAxisSpacing === 'number' && f.counterAxisSpacing !== null) {
      md.li(`Gap (cross): ${f.counterAxisSpacing}px`);
    }
    if (f.primaryAxisAlignItems) md.li(`Main axis align: ${f.primaryAxisAlignItems.toLowerCase().replace('_', '-')}`);
    if (f.counterAxisAlignItems) md.li(`Cross axis align: ${f.counterAxisAlignItems.toLowerCase()}`);
    if (f.layoutWrap) md.li(`Wrap: ${f.layoutWrap === 'WRAP' ? 'yes' : 'no'}`);
    if (f.layoutSizingHorizontal) md.li(`Width: ${f.layoutSizingHorizontal.toLowerCase()}`);
    if (f.layoutSizingVertical) md.li(`Height: ${f.layoutSizingVertical.toLowerCase()}`);
    md.blank();
  }

  if (found === 0) {
    return {
      markdown: '# Layout\n\nНет auto-layout фреймов в выделении.\n',
      warnings: ['Выдели auto-layout frame для layout-экспорта.']
    };
  }

  return { markdown: md.toString(), warnings };
};
