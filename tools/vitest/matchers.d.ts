import type { RunOptions } from 'axe-core';
import 'vitest';

declare module 'vitest' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- a merged declaration repeats the type parameters of Vitest's own
    interface Assertion<T = unknown> {
        /** Runs axe-core on the element, which has to be in the document. Registered in `tools/vitest/setup-angular.ts`. */
        toHaveNoViolations(options?: RunOptions): Promise<void>;
    }
}
