import { MdBuilder } from '../../markdown/builder';
import { walk } from '../../traverse';
import type { AspectExtractor } from '../types';
import {
  buildComponentSetSpec,
  buildSingleComponentSpec,
  computeVariantFingerprint
} from '../composite/componentSpec';

type CollectedItem =
  | { kind: 'set'; set: ComponentSetNode }
  | { kind: 'variant'; component: ComponentNode };

export const extractComponentSet: AspectExtractor = async (ctx) => {
  const md = new MdBuilder();
  const warnings: string[] = [];
  const allTokens = new Set<string>();

  if (ctx.selection.length === 0) {
    return { markdown: '# Components\n\nНичего не выделено.\n', warnings };
  }

  const seenIds = new Set<string>();
  const items: CollectedItem[] = [];
  let instanceCount = 0;
  let directSetCount = 0;
  let directComponentCount = 0;
  let resolveFailures = 0;

  const addSet = (set: ComponentSetNode) => {
    if (seenIds.has(set.id)) return;
    seenIds.add(set.id);
    items.push({ kind: 'set', set });
  };

  const addVariant = (component: ComponentNode) => {
    if (seenIds.has(component.id)) return;
    seenIds.add(component.id);
    items.push({ kind: 'variant', component });
  };

  const processNode = async (n: SceneNode, isTopLevel: boolean): Promise<void> => {
    if (n.type === 'COMPONENT_SET') {
      if (isTopLevel) directSetCount++;
      // Direct selection of a ComponentSet → full matrix
      addSet(n);
      return;
    }
    if (n.type === 'COMPONENT') {
      if (isTopLevel) directComponentCount++;
      // COMPONENT (direct or inside a set) → single-variant spec
      addVariant(n);
      return;
    }
    if (n.type === 'INSTANCE') {
      instanceCount++;
      try {
        const main = await n.getMainComponentAsync();
        if (!main) {
          resolveFailures++;
          return;
        }
        // Instance always → only current variant, not whole set
        addVariant(main);
      } catch (e) {
        resolveFailures++;
        warnings.push(
          `Не удалось резолвить "${n.name}": ${e instanceof Error ? e.message : String(e)}`
        );
      }
    }
  };

  for (const top of ctx.selection) {
    await processNode(top, true);
    if ('children' in top) {
      for (const n of walk([top])) {
        if (n === top) continue;
        await processNode(n, false);
      }
    }
  }

  if (items.length === 0) {
    return {
      markdown:
        '# Components\n\nВ выделении не найдено компонентов (ни ComponentSet, ни Component, ни Instance).\n',
      warnings
    };
  }

  // Fingerprint-based dedup for variant items (collapse visually identical variants)
  const setItems = items.filter(
    (i): i is Extract<CollectedItem, { kind: 'set' }> => i.kind === 'set'
  );
  const variantItems = items.filter(
    (i): i is Extract<CollectedItem, { kind: 'variant' }> => i.kind === 'variant'
  );

  const fingerprints = await Promise.all(
    variantItems.map((i) => computeVariantFingerprint(i.component, ctx.resolver))
  );
  const seenFingerprints = new Set<string>();
  const dedupedVariants: typeof variantItems = [];
  variantItems.forEach((item, idx) => {
    const fp = fingerprints[idx];
    if (seenFingerprints.has(fp)) return;
    seenFingerprints.add(fp);
    dedupedVariants.push(item);
  });

  const collapsed = variantItems.length - dedupedVariants.length;
  items.length = 0;
  items.push(...setItems);
  items.push(...dedupedVariants);

  const summaryParts: string[] = [`${items.length} unique`];
  if (collapsed > 0) summaryParts.push(`${collapsed} identical variant${collapsed === 1 ? '' : 's'} collapsed`);
  if (instanceCount > 0)
    summaryParts.push(`${instanceCount} instance${instanceCount === 1 ? '' : 's'}`);
  if (directSetCount > 0)
    summaryParts.push(`${directSetCount} set${directSetCount === 1 ? '' : 's'} selected directly`);
  if (directComponentCount > 0)
    summaryParts.push(
      `${directComponentCount} component${directComponentCount === 1 ? '' : 's'} selected directly`
    );
  warnings.unshift(`Summary: ${summaryParts.join(', ')}.`);
  if (resolveFailures > 0) {
    warnings.push(`${resolveFailures} instance(s) не удалось резолвить (remote library?).`);
  }

  items.sort((a, b) => titleOf(a).localeCompare(titleOf(b)));

  for (let i = 0; i < items.length; i++) {
    if (i > 0) md.hr();
    const item = items[i];
    if (item.kind === 'set') {
      md.raw((await buildComponentSetSpec(item.set, ctx.resolver, allTokens)).trim());
    } else {
      md.raw((await buildSingleComponentSpec(item.component, ctx.resolver, allTokens)).trim());
    }
  }

  return { markdown: md.toString(), warnings };
};

function titleOf(item: CollectedItem): string {
  if (item.kind === 'set') return item.set.name;
  const parent = item.component.parent;
  if (parent?.type === 'COMPONENT_SET') return `${parent.name} / ${item.component.name}`;
  return item.component.name;
}
