// No imports: `../data` imports every area, so a value taken from there would read as `undefined` under CommonJS.

/**
 * One step inside an opening tag: a quoted value is taken whole, so neither `>` nor an attribute-like word inside
 * it counts.
 */
export const TAG_BODY = `(?:[^<>"']|"[^"]*"|'[^']*')`;
