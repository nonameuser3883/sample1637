import { MdBuilder } from '../../markdown/builder';
import type { AspectExtractor } from '../types';
import type { TokenResolver } from '../../tokens/resolver';
import {
  resolveComponentSet,
  resolveToComponent,
  listVariantProps,
  findVariantProp,
  findVariantByProps
} from '../composite/_shared';
import { crossProduct, comboLabel } from '../composite/_matrix';
import { describeNodeSpec, describeTextDescendants } from './background';

const STATE_PATTERN = /state|status|focus|selected/i;

export const extractButton: AspectExtractor = async (ctx) => {
  const md = new MdBuilder();
  const warnings: string[] = [];

  if (ctx.selection.length === 0) {
    return { markdown: '# Button\n\nНичего не выделено.\n', warnings };
  }

  for (let i = 0; i < ctx.selection.length; i++) {
    if (i > 0) md.hr();
    await extractOne(ctx.selection[i], md, warnings, ctx.resolver);
  }

  return { markdown: md.toString(), warnings };
};

async function extractOne(
  node: SceneNode,
  md: MdBuilder,
  warnings: string[],
  resolver: TokenResolver
): Promise<void> {
  const set = await resolveComponentSet(node);

  // Single component / arbitrary node — full spec
  if (!set) {
    const component = await resolveToComponent(node);
    const target = component ?? node;
    md.h1(`Button: ${target.name}`);
    await describeNodeSpec(target, md, resolver, warnings);
    await describeTextDescendants(target, md, resolver);
    return;
  }

  // Component Set — variants
  md.h1(`Button: ${set.name}`);
  if (set.description) md.p(`> ${set.description.replace(/\s+/g, ' ')}`);

  const variants = listVariantProps(set);
  const stateProp = findVariantProp(set, STATE_PATTERN);
  const shapeProps = variants.filter((v) => v.propName !== stateProp?.propName);

  if (variants.length > 0) {
    md.h2('Variants');
    for (const v of variants) {
      md.li(`**${v.propName}**: ${v.values.map((x) => `\`${x}\``).join(' | ')}`);
    }
  }

  const shapeCombos = crossProduct(shapeProps);

  for (const combo of shapeCombos) {
    if (stateProp) {
      // Per-state full spec
      md.h2(shapeCombos.length > 1 ? `Shape: ${comboLabel(combo)}` : 'States');
      for (const state of stateProp.values) {
        const props = { ...combo, [stateProp.propName]: state };
        const variant = findVariantByProps(set, props);
        md.h3(`${stateProp.propName} = \`${state}\``);
        if (!variant) {
          md.p('(вариант не найден в наборе)');
          continue;
        }
        await describeNodeSpec(variant, md, resolver, warnings);
        await describeTextDescendants(variant, md, resolver);
      }
    } else {
      const variant = findVariantByProps(set, combo);
      md.h2(shapeCombos.length > 1 ? `Variant: ${comboLabel(combo)}` : 'Spec');
      if (!variant) {
        md.p('(вариант не найден в наборе)');
        continue;
      }
      await describeNodeSpec(variant, md, resolver, warnings);
      await describeTextDescendants(variant, md, resolver);
    }
  }
}
