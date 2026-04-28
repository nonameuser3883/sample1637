import type { VariantInfo } from './_shared';

export function crossProduct(props: VariantInfo[]): Record<string, string>[] {
  if (props.length === 0) return [{}];
  let combos: Record<string, string>[] = [{}];
  for (const p of props) {
    const next: Record<string, string>[] = [];
    for (const existing of combos) {
      for (const v of p.values) {
        next.push({ ...existing, [p.propName]: v });
      }
    }
    combos = next;
  }
  return combos;
}

export function comboLabel(combo: Record<string, string>): string {
  return Object.values(combo).join(' / ') || 'base';
}
