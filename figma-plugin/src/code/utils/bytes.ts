export function bytesToUtf8(bytes: Uint8Array): string {
  const Decoder = (globalThis as { TextDecoder?: typeof TextDecoder }).TextDecoder;
  if (typeof Decoder !== 'undefined') {
    try {
      return new Decoder('utf-8').decode(bytes);
    } catch {
      // fall through to manual decoder
    }
  }
  const chars: string[] = [];
  const len = bytes.length;
  let i = 0;
  while (i < len) {
    const b = bytes[i++];
    if (b < 0x80) {
      chars.push(String.fromCharCode(b));
    } else if (b < 0xc0) {
      chars.push('\uFFFD');
    } else if (b < 0xe0) {
      if (i >= len) {
        chars.push('\uFFFD');
        break;
      }
      chars.push(String.fromCharCode(((b & 0x1f) << 6) | (bytes[i++] & 0x3f)));
    } else if (b < 0xf0) {
      if (i + 1 >= len) {
        chars.push('\uFFFD');
        break;
      }
      chars.push(
        String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f))
      );
    } else {
      if (i + 2 >= len) {
        chars.push('\uFFFD');
        break;
      }
      const cp =
        ((b & 0x07) << 18) |
        ((bytes[i++] & 0x3f) << 12) |
        ((bytes[i++] & 0x3f) << 6) |
        (bytes[i++] & 0x3f);
      chars.push(String.fromCodePoint(cp));
    }
  }
  return chars.join('');
}
