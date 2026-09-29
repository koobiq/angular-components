/** A line that opens a fenced block of code. */
const CODE_FENCE = /^\s*[~`]{3}/m;

/**
 * An `@example` as Markdown, decided the way VS Code decides it for a hover: one with a fence of its own is
 * Markdown already and is left as it is; anything else is source code, fenced here as TypeScript. A backtick
 * alone does not make an example Markdown — a template literal has them too.
 */
export const exampleAsMarkdown = (comment: string): string =>
    CODE_FENCE.test(comment) ? comment : `\`\`\`typescript\n${comment}\n\`\`\``;
