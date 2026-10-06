import 'vitest';

declare module 'vitest' {
    interface Assertion<T = unknown> {
        /** Registered from `jest-axe` in `tools/vitest/setup-angular.ts`. */
        toHaveNoViolations(): T;
    }
}
