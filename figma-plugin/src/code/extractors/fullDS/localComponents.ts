import { MdBuilder } from '../../markdown/builder';
import type { FullDSExtractor } from '../types';
import { listVariantProps } from '../composite/_shared';

export const extractAllLocalComponents: FullDSExtractor = async () => {
  const md = new MdBuilder().h1('Local Components');
  const warnings: string[] = [];

  try {
    await figma.loadAllPagesAsync();
  } catch (e) {
    warnings.push(
      `loadAllPagesAsync failed: ${e instanceof Error ? e.message : String(e)} — результат неполный.`
    );
  }

  type Item = {
    kind: 'set' | 'component';
    node: ComponentSetNode | ComponentNode;
    pageName: string;
  };
  const items: Item[] = [];

  for (const page of figma.root.children) {
    if (page.type !== 'PAGE') continue;
    const found = page.findAll(
      (n) =>
        n.type === 'COMPONENT_SET' ||
        (n.type === 'COMPONENT' && n.parent?.type !== 'COMPONENT_SET')
    );
    for (const node of found) {
      items.push({
        kind: node.type === 'COMPONENT_SET' ? 'set' : 'component',
        node: node as ComponentSetNode | ComponentNode,
        pageName: page.name
      });
    }
  }

  if (items.length === 0) {
    md.p('No local components found.');
    return {
      markdown: md.toString(),
      warnings: [...warnings, 'Нет локальных компонентов в файле.']
    };
  }

  warnings.push(
    `Exported ${items.length} local items (${items.filter((i) => i.kind === 'set').length} sets + ${items.filter((i) => i.kind === 'component').length} standalone).`
  );

  const byPage = new Map<string, Item[]>();
  for (const it of items) {
    const arr = byPage.get(it.pageName) ?? [];
    arr.push(it);
    byPage.set(it.pageName, arr);
  }

  for (const [pageName, list] of byPage) {
    md.h2(`Page: ${pageName}`);
    list.sort((a, b) => a.node.name.localeCompare(b.node.name));
    for (const item of list) {
      const node = item.node;
      const title = node.name;
      if (item.kind === 'set') {
        const set = node as ComponentSetNode;
        const variants = listVariantProps(set);
        const variantSummary =
          variants.length > 0
            ? ` — variants: ${variants
                .map((v) => `${v.propName} (${v.values.length})`)
                .join(', ')}`
            : '';
        const desc = set.description ? `  \n  > ${set.description.replace(/\s+/g, ' ')}` : '';
        md.li(`**${title}** (set, ${set.children.length} variants)${variantSummary}${desc}`);
      } else {
        const comp = node as ComponentNode;
        const desc = comp.description ? `  \n  > ${comp.description.replace(/\s+/g, ' ')}` : '';
        md.li(`**${title}** (component)${desc}`);
      }
    }
  }

  return { markdown: md.toString(), warnings };
};
