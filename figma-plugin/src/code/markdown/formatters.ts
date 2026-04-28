export function rgbToHex(rgb: RGB): string {
  const to255 = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 255);
  const h = (n: number) => to255(n).toString(16).padStart(2, '0');
  return `#${h(rgb.r)}${h(rgb.g)}${h(rgb.b)}`.toUpperCase();
}

export function rgbaToCSS(rgba: RGBA, externalOpacity = 1): string {
  const alpha = rgba.a * externalOpacity;
  const to255 = (n: number) => Math.round(n * 255);
  if (alpha >= 0.999) return rgbToHex(rgba);
  return `rgba(${to255(rgba.r)}, ${to255(rgba.g)}, ${to255(rgba.b)}, ${alpha.toFixed(2)})`;
}

export function paintToString(paint: Paint): string {
  if (!paint.visible && paint.visible !== undefined) {
    // invisible paint — still describe
  }
  const opacity = paint.opacity ?? 1;

  if (paint.type === 'SOLID') {
    const rgba: RGBA = { ...paint.color, a: opacity };
    return rgbaToCSS(rgba);
  }
  if (paint.type === 'GRADIENT_LINEAR') {
    const stops = paint.gradientStops
      .map((s) => `${rgbaToCSS(s.color, opacity)} ${(s.position * 100).toFixed(0)}%`)
      .join(', ');
    return `linear-gradient(${stops})`;
  }
  if (paint.type === 'GRADIENT_RADIAL') {
    const stops = paint.gradientStops
      .map((s) => `${rgbaToCSS(s.color, opacity)} ${(s.position * 100).toFixed(0)}%`)
      .join(', ');
    return `radial-gradient(${stops})`;
  }
  if (paint.type === 'GRADIENT_ANGULAR') return 'conic-gradient(...)';
  if (paint.type === 'GRADIENT_DIAMOND') return 'diamond-gradient(...)';
  if (paint.type === 'IMAGE') return `image (${paint.scaleMode})`;
  if (paint.type === 'VIDEO') return 'video';
  if (paint.type === 'PATTERN') return 'pattern';
  return (paint as { type: string }).type;
}

export function fontWeightName(weight: number): string {
  const map: Record<number, string> = {
    100: 'Thin',
    200: 'ExtraLight',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'SemiBold',
    700: 'Bold',
    800: 'ExtraBold',
    900: 'Black'
  };
  return map[weight] ?? String(weight);
}

export function lineHeightToString(lh: LineHeight): string {
  if (lh.unit === 'AUTO') return 'auto';
  if (lh.unit === 'PERCENT') return `${round(lh.value)}%`;
  return `${round(lh.value)}`;
}

export function letterSpacingToString(ls: LetterSpacing): string {
  const v = round(ls.value);
  if (ls.unit === 'PERCENT') return `${v}%`;
  return `${v}`;
}

export function effectToString(effect: Effect): string {
  if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
    const { offset, radius, spread = 0, color } = effect;
    const prefix = effect.type === 'INNER_SHADOW' ? 'inset ' : '';
    return `${prefix}${offset.x} ${offset.y} ${radius} ${spread} ${rgbaToCSS(color)}`;
  }
  if (effect.type === 'LAYER_BLUR') return `blur(${effect.radius})`;
  if (effect.type === 'BACKGROUND_BLUR') return `backdrop-blur(${effect.radius})`;
  return (effect as { type: string }).type;
}

export type StrokeAlign = 'CENTER' | 'INSIDE' | 'OUTSIDE';

export function strokeAlignLabel(align: StrokeAlign): string {
  if (align === 'INSIDE') return 'inside';
  if (align === 'OUTSIDE') return 'outside';
  return 'center';
}

function round(n: number, digits = 2): number {
  const p = Math.pow(10, digits);
  return Math.round(n * p) / p;
}
