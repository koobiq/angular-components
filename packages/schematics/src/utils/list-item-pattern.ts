/**
 * The source of a RegExp that matches `item` (a RegExp source) together with one of its commas when it is an element
 * of a `[…]` or `{…}` list: the comma before it, or the one after it when it comes first. Deleting the match leaves
 * the list well-formed and the rest of the file untouched. An inline `type` modifier goes with a list element;
 * outside a list, `item` is matched alone.
 */
export function listItemPattern(item: string): string {
    const element = `(?:\\btype\\s+)?(?:${item})`;
    const withCommaBefore = `,\\s*${element}(?=\\s*[,\\]}])`;
    const firstOrOnly = `(?<=[\\[{]\\s*)${element}(?:\\s*,\\s*|(?=\\s*[\\]}]))`;

    return `(?:${withCommaBefore}|${firstOrOnly}|(?:${item}))`;
}
