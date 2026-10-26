/**
 * Bracket- and quote-aware splitting of TypeScript type syntax.
 *
 * Angular writes its metadata into `.d.ts` as generic arguments — selectors, input maps, host
 * directives — and those arguments nest objects inside arrays inside objects. A split on `,` or
 * `;` by `String.split` cuts in the middle of them, so depth has to be tracked.
 */

const OPEN: Record<string, string> = { '<': '>', '{': '}', '[': ']', '(': ')' };
const CLOSE = new Set(['>', '}', ']', ')']);

/** Splits on any of `separators` at nesting depth zero, ignoring separators inside quotes. */
export const splitTopLevel = (input: string, separators = ','): string[] => {
    const parts: string[] = [];
    const cut = new Set(separators);

    let depth = 0;
    let quote: string | null = null;
    let current = '';

    for (const char of input) {
        if (quote) {
            current += char;
            if (char === quote) quote = null;
            continue;
        }

        if (char === '"' || char === "'") {
            quote = char;
            current += char;
            continue;
        }

        if (OPEN[char]) depth++;
        else if (CLOSE.has(char)) depth--;

        if (cut.has(char) && depth === 0) {
            if (current.trim()) parts.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    if (current.trim()) parts.push(current.trim());

    return parts;
};

export const stringLiteral = (segment: string): string | undefined => /^["']([^"']*)["']$/.exec(segment.trim())?.[1];

export const stringArray = (segment: string): string[] =>
    [...segment.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]!);

/**
 * Entries of an inline object type, as `[key, valueSource]`.
 *
 * Both separators are accepted because `.d.ts` writes `;` between members while the same syntax
 * inside a generic argument is sometimes emitted with `,`.
 */
export const objectEntries = (segment: string): [string, string][] => {
    const inner = /^\{([\s\S]*)\}$/.exec(segment.trim())?.[1];

    if (!inner) return [];

    const entries: [string, string][] = [];

    for (const entry of splitTopLevel(inner, ';,')) {
        const colon = splitPair(entry);

        if (!colon) continue;

        const key = stringLiteral(colon[0]) ?? colon[0];

        if (key) entries.push([key, colon[1]]);
    }

    return entries;
};

/** Splits `key: value` at the first top-level colon. Values hold colons of their own. */
const splitPair = (entry: string): [string, string] | null => {
    let depth = 0;
    let quote: string | null = null;

    for (let i = 0; i < entry.length; i++) {
        const char = entry[i]!;

        if (quote) {
            if (char === quote) quote = null;
            continue;
        }

        if (char === '"' || char === "'") {
            quote = char;
            continue;
        }

        if (OPEN[char]) depth++;
        else if (CLOSE.has(char)) depth--;
        else if (char === ':' && depth === 0) {
            return [entry.slice(0, i).trim(), entry.slice(i + 1).trim()];
        }
    }

    return null;
};

/** `i0.`, `i12.` and `_angular_core.` are emitter artefacts; nothing reads them. */
export const stripNamespaces = (type: string): string => type.replace(/\b(?:_angular_[a-z_]+|i\d+)\./g, '').trim();
