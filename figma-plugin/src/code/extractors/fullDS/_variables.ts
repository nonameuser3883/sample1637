import { formatTokenName } from '../../tokens/formatter';
import { rgbaToCSS } from '../../markdown/formatters';

type VariableValue = Variable['valuesByMode'][string];

export function isVariableAlias(val: unknown): val is VariableAlias {
  return (
    typeof val === 'object' &&
    val !== null &&
    'type' in val &&
    (val as { type: string }).type === 'VARIABLE_ALIAS'
  );
}

export async function variableValueToString(
  val: VariableValue,
  type: VariableResolvedDataType
): Promise<string> {
  if (isVariableAlias(val)) {
    const ref = await figma.variables.getVariableByIdAsync(val.id);
    if (ref) return `→ \`${formatTokenName(ref.name)}\``;
    return '→ (unresolved)';
  }
  if (type === 'COLOR' && val && typeof val === 'object' && 'r' in val) {
    const rgb = val as RGB | RGBA;
    const a = 'a' in rgb ? rgb.a : 1;
    return rgbaToCSS({ r: rgb.r, g: rgb.g, b: rgb.b, a });
  }
  if (type === 'FLOAT') {
    return typeof val === 'number' ? `${val}` : String(val);
  }
  if (type === 'STRING') return JSON.stringify(val);
  if (type === 'BOOLEAN') return String(val);
  return '(unknown)';
}
