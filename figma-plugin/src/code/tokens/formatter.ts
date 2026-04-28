export type FormatOptions = {
  separator: '.' | '/' | '-';
  lowercase: boolean;
  namespace?: string;
};

export const DEFAULT_FORMAT: FormatOptions = {
  separator: '.',
  lowercase: true
};

export function formatTokenName(rawName: string, opts: FormatOptions = DEFAULT_FORMAT): string {
  const parts = rawName
    .split('/')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const normalized = parts.map((p) => {
    const slug = p.replace(/\s+/g, '-');
    return opts.lowercase ? slug.toLowerCase() : slug;
  });

  const joined = normalized.join(opts.separator);
  return opts.namespace ? `${opts.namespace}${opts.separator}${joined}` : joined;
}
