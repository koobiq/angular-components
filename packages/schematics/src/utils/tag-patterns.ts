// RegExp sources the template rewrites of v20-upgrade and v21-upgrade build on. They live here rather than in a
// `data.ts`: v21-upgrade's `data.ts` imports every area module, so an area that read them from there would get
// `undefined` under CommonJS.

/**
 * One step inside an opening tag: a quoted value is taken whole, so neither `>` nor an attribute-like word inside
 * it counts.
 */
export const TAG_BODY = `(?:[^<>"']|"[^"]*"|'[^']*')`;

/**
 * The start of an attribute on an opening `<kbq-code-block>` tag that does not bind `name` itself, captured as
 * `$1` together with a `[` that opens a binding.
 */
export const codeBlockTagWithout = (name: string): string =>
    String.raw`(<kbq-code-block(?![\w-])(?!${TAG_BODY}*[\s\[]${name}[\]\s=/>])${TAG_BODY}*?\s\[?)`;

/** An opening `<kbq-code-block>` tag that binds both `first` and `second`. */
export const codeBlockTagWith = (first: string, second: string): string =>
    String.raw`<kbq-code-block(?![\w-])(?=${TAG_BODY}*[\s\[]${first}[\]\s=/>])(?=${TAG_BODY}*[\s\[]${second}[\]\s=/>])`;
