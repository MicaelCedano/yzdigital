export function normalizeUsername(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

export function hasUsernameWhitespace(value: string): boolean {
  return /\s/.test(value);
}
