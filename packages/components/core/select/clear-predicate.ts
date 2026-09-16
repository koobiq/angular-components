import { isDevMode } from '@angular/core';

/**
 * Runs a consumer-supplied `clearPredicate` defensively: a predicate that throws is reported in dev mode
 * and treated as "keep this one", so a broken predicate cannot clear away what it failed to judge.
 *
 * The same call also decides whether the cleaner is offered at all, which is why refusing is the safe
 * answer: a control that would act on a broken rule is hidden instead.
 *
 * @docs-private
 */
export function runClearPredicate<T>(clearPredicate: (item: T) => boolean, item: T): boolean {
    try {
        return clearPredicate(item);
    } catch (error) {
        if (isDevMode()) {
            // Notify developers of errors in their predicate.
            // eslint-disable-next-line no-console
            console.warn(error);
        }

        return false;
    }
}
