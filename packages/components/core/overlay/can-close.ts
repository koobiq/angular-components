import { from, isObservable, Observable, of } from 'rxjs';
import { catchError, defaultIfEmpty, take } from 'rxjs/operators';

/** The way the close of an overlay-based component (sidepanel, modal) was attempted. */
export type KbqCloseReason = 'backdrop' | 'escape' | 'close' | 'programmatic';

/**
 * Guard intercepting a close attempt of an overlay-based component. Returning `true` lets the
 * close proceed; `false` keeps the component open. Async results are awaited, and repeated
 * triggers are ignored while a decision is pending.
 */
export type KbqCanClose = (reason: KbqCloseReason) => boolean | Promise<boolean> | Observable<boolean>;

/**
 * Normalizes a guard decision to exactly one boolean: the first value wins; an error and an
 * observable that completes without a value resolve to `false` (keep the component open).
 */
export function coerceCanCloseDecision(decision: Promise<boolean> | Observable<boolean>): Observable<boolean> {
    return (isObservable(decision) ? decision : from(decision)).pipe(
        take(1),
        catchError(() => of(false)),
        defaultIfEmpty(false)
    );
}
