import { MdBuilder } from '../../markdown/builder';
import { formatTokenName } from '../../tokens/formatter';
import { bytesToUtf8 } from '../../utils/bytes';
import type { FullDSExtractor } from '../types';

const ICON_NAME_PATTERN = /\bicon\b|\bico\b/i;
const ICON_PAGE_PATTERN = /^icons?$/i;
const SMALL_SIZE_LIMIT = 64;

export const extractAllIcons: FullDSExtractor = async () => {
  const md = new MdBuilder().h1('Icons');
  const warnings: string[] = [];

  try {
    await figma.loadAllPagesAsync();
  } catch (e) {
    warnings.push(`loadAllPagesAsync failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  type Item = { node: ComponentNode | ComponentSetNode; pageName: string };
  const items: Item[] = [];
  const seenIds = new Set<string>();

  for (const page of figma.root.children) {
    if (page.type !== 'PAGE') continue;
    const pageMatches = ICON_PAGE_PATTERN.test(page.name) || ICON_NAME_PATTERN.test(page.name);

    const found = page.findAll((n) => {
      if (n.type !== 'COMPONENT' && n.type !== 'COMPONENT_SET') return false;
      if (n.type === 'COMPONENT' && n.parent?.type === 'COMPONENT_SET') return false; // set handles children
      if (ICON_NAME_PATTERN.test(n.name)) return true;
      if (pageMatches && n.width === n.height && n.width <= SMALL_SIZE_LIMIT) return true;
      return false;
    });

    for (const node of found) {
      if (seenIds.has(node.id)) continue;
      seenIds.add(node.id);
      items.push({ node: node as ComponentNode | ComponentSetNode, pageName: page.name });
    }
  }

  if (items.length === 0) {
    md.p('No icon components found.');
    return {
      markdown: md.toString(),
      warnings: [
        ...warnings,
        'Критерии поиска: имя содержит "icon" ИЛИ страница называется "Icons" + квадратный размер ≤64px.'
      ]
    };
  }

  items.sort((a, b) => a.node.name.localeCompare(b.node.name));

  let exportedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (const item of items) {
    const node = item.node;

    if (node.type === 'COMPONENT_SET') {
      md.h2(node.name);
      const variantChildren = node.children.filter((c): c is ComponentNode => c.type === 'COMPONENT');
      for (const variant of variantChildren) {
        const result = await tryExportSvg(variant);
        const label = `${formatTokenName(node.name)} / ${variant.name}`;
        md.h3(label);
        md.raw(`${Math.round(variant.width)}×${Math.round(variant.height)}`);
        if (result.svg) {
          md.code('svg', result.svg);
          exportedCount++;
        } else {
          md.p('(SVG export failed)');
          failedCount++;
          errors.push(`"${label}": ${result.error ?? 'unknown'}`);
        }
      }
      continue;
    }

    const result = await tryExportSvg(node);
    const label = formatTokenName(node.name);
    md.h2(label);
    md.raw(`${Math.round(node.width)}×${Math.round(node.height)}`);
    if (result.svg) {
      md.code('svg', result.svg);
      exportedCount++;
    } else {
      md.p('(SVG export failed)');
      failedCount++;
      errors.push(`"${label}": ${result.error ?? 'unknown'}`);
    }
  }

  if (errors.length > 0) warnings.push(...errors.slice(0, 5));
  if (errors.length > 5) warnings.push(`+${errors.length - 5} more errors`);

  warnings.unshift(
    `Exported ${exportedCount} icon${exportedCount === 1 ? '' : 's'} as SVG` +
      (failedCount > 0 ? ` (${failedCount} failed)` : '') +
      ` across ${items.length} component${items.length === 1 ? '' : 's'}.`
  );

  return { markdown: md.toString(), warnings };
};

async function tryExportSvg(
  node: ComponentNode
): Promise<{ svg: string | null; error?: string }> {
  try {
    const bytes = await node.exportAsync({ format: 'SVG' });
    return { svg: bytesToUtf8(bytes) };
  } catch (e) {
    return { svg: null, error: e instanceof Error ? e.message : String(e) };
  }
}
