import { MdBuilder } from '../../markdown/builder';
import { formatTokenName } from '../../tokens/formatter';
import { bytesToUtf8 } from '../../utils/bytes';
import type { AspectExtractor } from '../types';

const EXPORTABLE_SHAPE_TYPES = new Set([
  'VECTOR',
  'BOOLEAN_OPERATION',
  'STAR',
  'POLYGON'
]);

type Collected = { key: string; name: string; exportable: SceneNode };

export const extractIcon: AspectExtractor = async (ctx) => {
  const md = new MdBuilder();
  const warnings: string[] = [];
  const collected = new Map<string, Collected>();

  const add = (key: string, name: string, exportable: SceneNode) => {
    if (collected.has(key)) return;
    collected.set(key, { key, name, exportable });
  };

  const process = async (n: SceneNode): Promise<void> => {
    if (n.type === 'COMPONENT') {
      const setParent = n.parent?.type === 'COMPONENT_SET' ? n.parent : null;
      const name = setParent ? `${setParent.name} / ${n.name}` : n.name;
      add(n.id, name, n);
      return;
    }
    if (n.type === 'COMPONENT_SET') {
      for (const child of n.children) {
        if (child.type === 'COMPONENT') add(child.id, `${n.name} / ${child.name}`, child);
      }
      return;
    }
    if (n.type === 'INSTANCE') {
      let key = n.id;
      let name = n.name;
      try {
        const main = await n.getMainComponentAsync();
        if (main) {
          key = main.id;
          const setParent = main.parent?.type === 'COMPONENT_SET' ? main.parent : null;
          name = setParent ? `${setParent.name} / ${main.name}` : main.name;
        }
      } catch {
        // fall back to instance id
      }
      add(key, name, n);
      return;
    }
    if (EXPORTABLE_SHAPE_TYPES.has(n.type)) {
      add(n.id, n.name, n);
      return;
    }
    if ('children' in n) {
      for (const child of n.children as readonly SceneNode[]) {
        await process(child);
      }
    }
  };

  for (const top of ctx.selection) {
    await process(top);
  }

  if (collected.size === 0) {
    return {
      markdown: '# Icons\n\nВ выделении не найдено иконок.\n',
      warnings: [
        'Выдели компоненты/инстансы/vector-ноды. Можно выделить фрейм — плагин зайдёт внутрь.'
      ]
    };
  }

  const items = [...collected.values()].sort((a, b) => a.name.localeCompare(b.name));

  let success = 0;
  const errors: string[] = [];
  for (const item of items) {
    md.h1(formatTokenName(item.name));
    const result = await tryExportSvg(item.exportable);
    if (result.svg) {
      md.code('svg', result.svg);
      success++;
    } else {
      md.p('(SVG export failed)');
      errors.push(`"${item.name}": ${result.error ?? 'unknown error'}`);
    }
  }

  const failed = items.length - success;
  warnings.unshift(
    `Exported ${success}/${items.length} icon${items.length === 1 ? '' : 's'} as SVG${
      failed > 0 ? ` (${failed} failed)` : ''
    }.`
  );
  if (errors.length > 0) warnings.push(...errors.slice(0, 5));
  if (errors.length > 5) warnings.push(`+${errors.length - 5} more errors`);

  return { markdown: md.toString(), warnings };
};

async function tryExportSvg(node: SceneNode): Promise<{ svg: string | null; error?: string }> {
  try {
    const exportable = node as SceneNode & {
      exportAsync?: (opts: { format: 'SVG' }) => Promise<Uint8Array>;
    };
    if (typeof exportable.exportAsync !== 'function') {
      return { svg: null, error: `node type ${node.type} not exportable` };
    }
    const bytes = await exportable.exportAsync({ format: 'SVG' });
    return { svg: bytesToUtf8(bytes) };
  } catch (e) {
    return { svg: null, error: e instanceof Error ? e.message : String(e) };
  }
}
