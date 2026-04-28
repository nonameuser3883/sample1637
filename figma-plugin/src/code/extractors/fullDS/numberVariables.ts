import { MdBuilder } from '../../markdown/builder';
import { formatTokenName } from '../../tokens/formatter';
import type { FullDSExtractor } from '../types';
import { variableValueToString } from './_variables';

export const extractAllNumberVariables: FullDSExtractor = async () => {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await figma.variables.getLocalVariablesAsync('FLOAT');

  const md = new MdBuilder().h1('Number Variables');

  if (vars.length === 0) {
    md.p('No local number variables found.');
    return { markdown: md.toString(), warnings: ['Нет локальных Number Variables.'] };
  }

  const warnings: string[] = [
    `Exported ${vars.length} number variables across ${collections.length} collection(s).`
  ];

  const byCollection = new Map<string, Variable[]>();
  for (const v of vars) {
    const arr = byCollection.get(v.variableCollectionId) ?? [];
    arr.push(v);
    byCollection.set(v.variableCollectionId, arr);
  }

  for (const collection of collections) {
    const list = byCollection.get(collection.id);
    if (!list || list.length === 0) continue;

    const modeSuffix =
      collection.modes.length > 1 ? ` (${collection.modes.map((m) => m.name).join(' / ')})` : '';
    md.h2(`${collection.name}${modeSuffix}`);

    const groups = new Map<string, Variable[]>();
    for (const v of list) {
      const top = v.name.split('/')[0].trim() || 'Other';
      const arr = groups.get(top) ?? [];
      arr.push(v);
      groups.set(top, arr);
    }

    for (const [groupName, groupVars] of groups) {
      md.h3(groupName);
      for (const v of groupVars) {
        const token = formatTokenName(v.name);
        const valueStrs: string[] = [];
        for (const mode of collection.modes) {
          const raw = v.valuesByMode[mode.modeId];
          const str = await variableValueToString(raw, 'FLOAT');
          valueStrs.push(collection.modes.length > 1 ? `${mode.name}: ${str}` : str);
        }
        const desc = v.description ? ` — ${v.description.replace(/\s+/g, ' ')}` : '';
        md.li(`\`${token}\` — ${valueStrs.join(', ')}${desc}`);
      }
    }
  }

  return { markdown: md.toString(), warnings };
};
