/**
 * The contract returns resources as `result` directly (e.g. `result: Trail[]`), but
 * tolerate a keyed wrapper (`result: { trails: [...] }`) so small backend variations
 * don't break the UI.
 */
export const unwrapList = <T>(result: unknown, key: string): T[] => {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && Array.isArray((result as Record<string, unknown>)[key])) {
    return (result as Record<string, T[]>)[key];
  }
  return [];
};

export const unwrapOne = <T>(result: unknown, key: string): T | null => {
  if (!result || typeof result !== 'object') return null;
  const inner = (result as Record<string, unknown>)[key];
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) return inner as T;
  return result as T;
};
