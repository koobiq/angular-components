// `@types/jest-axe` pulls in the Jest globals, which clash with Vitest's.
declare module 'jest-axe' {
    import type { AxeResults, RunOptions } from 'axe-core';

    /** Runs axe-core on the element or HTML with jest-axe's defaults. */
    export function axe(html: Element | string, options?: RunOptions): Promise<AxeResults>;

    /** The matcher table to hand to `expect.extend()`. */
    export const toHaveNoViolations: Record<string, (results: AxeResults) => { pass: boolean; message(): string }>;
}
