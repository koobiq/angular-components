/**
 * What `group` of the global `pattern` captured in each of its matches in `source`. A match the group took no part
 * in adds nothing.
 */
export function capturedGroups(source: string, pattern: RegExp, group = 1): string[] {
    return [...source.matchAll(pattern)].flatMap((match) => match[group] ?? []);
}
