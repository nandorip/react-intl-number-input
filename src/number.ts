export function resolveLocale(locale: string): string {
  try {
    return Intl.NumberFormat.supportedLocalesOf([locale])[0] || 'en-US';
  } catch {
    return 'en-US';
  }
}

export function clampToBounds(value: number, min?: number, max?: number): number {
  return Math.min(Math.max(value, min ?? -Infinity), max ?? Infinity);
}

export function createDigitMap(locale: string): Map<string, string> {
  const formatter = new Intl.NumberFormat(locale, { useGrouping: false });
  const digits = new Map<string, string>();
  for (let digit = 0; digit <= 9; digit++) {
    const ascii = String(digit);
    const localized = formatter.formatToParts(digit)
      .filter((part) => part.type === 'integer').map((part) => part.value).join('');
    digits.set(ascii, ascii);
    digits.set(localized, ascii);
  }
  return digits;
}

export function stripAffixes(text: string, prefix: string, suffix: string): string {
  if (prefix && text.startsWith(prefix)) text = text.slice(prefix.length);
  if (suffix && text.endsWith(suffix)) text = text.slice(0, -suffix.length);
  return text;
}

export function parseNumber(text: string, digits: Map<string, string>, precision: number): number {
  const negative = /[-\u2212]/.test(text);
  const ascii = Array.from(text).map((character) => digits.get(character) || '').join('');
  // Insert the implied decimal before conversion to avoid overflowing a digit string
  // that represents a finite number after scaling, and unnecessary double rounding.
  const padded = ascii.padStart(precision + 1, '0');
  const decimal = precision === 0 ? padded
    : `${padded.slice(0, -precision)}.${padded.slice(-precision)}`;
  const numeric = Number(decimal);
  return negative ? -numeric : numeric;
}

export function preserveAffixEdit(previous: string, next: string, prefix: string, suffix: string): string {
  let start = 0;
  while (start < previous.length && start < next.length && previous[start] === next[start]) start++;
  let end = previous.length;
  let nextEnd = next.length;
  while (end > start && nextEnd > start && previous[end - 1] === next[nextEnd - 1]) {
    end--;
    nextEnd--;
  }
  const numericEnd = previous.length - suffix.length;
  const onlyPrefix = prefix.length > 0 && start < prefix.length && end <= prefix.length;
  const onlySuffix = suffix.length > 0 && start >= numericEnd && end > numericEnd;
  return onlyPrefix || onlySuffix ? previous : next;
}

function decimalPlaces(value: number): number {
  const [mantissa, exponent = '0'] = String(value).toLowerCase().split('e');
  return Math.max(0, (mantissa.split('.')[1]?.length || 0) - Number(exponent));
}

export function addStep(value: number, delta: number): number {
  const places = Math.max(decimalPlaces(value), decimalPlaces(delta));
  const factor = Math.pow(10, places);
  const scaledValue = Math.round(value * factor);
  const scaledDelta = Math.round(delta * factor);
  const sum = scaledValue + scaledDelta;
  if (Number.isSafeInteger(scaledValue) && Number.isSafeInteger(scaledDelta) && Number.isSafeInteger(sum)) {
    return sum / factor;
  }
  return value + delta;
}
