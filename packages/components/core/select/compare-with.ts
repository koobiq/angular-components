import { isDevMode } from '@angular/core';

/**
 * Runs a consumer-supplied `compareWith` defensively: a comparator that throws is reported in dev mode
 * and treated as "no match", so one bad comparison cannot take a whole selection down with it.
 *
 * Callers own the `null` policy — `KbqSelect` refuses to match a `null` option value, `KbqListSelection`
 * lets the comparator decide — so nothing is filtered here.
 *
 * @docs-private
 */
export function runCompareWith<T>(compareWith: (o1: T, o2: T) => boolean, first: T, second: T): boolean {
    try {
        return compareWith(first, second);
    } catch (error) {
        if (isDevMode()) {
            // Notify developers of errors in their comparator.
            // eslint-disable-next-line no-console
            console.warn(error);
        }

        return false;
    }
}
