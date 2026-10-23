import {
    asyncScheduler,
    defer,
    distinctUntilChanged,
    EMPTY,
    MonoTypeOperatorFunction,
    of,
    switchMap,
    timer
} from 'rxjs';

/** Timing options of `kbqDelayLoadingIndicator`. */
export type KbqDelayLoadingIndicatorOptions = {
    /** How long, in milliseconds, an operation has to run before the indicator appears. Defaults to 500. */
    delay?: number;
    /** How long, in milliseconds, the indicator stays visible once it has appeared. Defaults to 300. */
    minDuration?: number;
};

/**
 * Turns the state of an operation into the visibility of its loading indicator, so that the indicator
 * does not flash: it appears only once the operation has run for `delay`, and once shown stays visible
 * for at least `minDuration`.
 *
 * Use the result for the indicator only. State that blocks a repeated action, such as `disabled`,
 * has to follow the operation itself and change immediately.
 *
 * @example
 * ```ts
 * readonly showIndicator$ = this.loading$.pipe(kbqDelayLoadingIndicator());
 * ```
 */
export function kbqDelayLoadingIndicator(
    options: KbqDelayLoadingIndicatorOptions = {}
): MonoTypeOperatorFunction<boolean> {
    const { delay = 500, minDuration = 300 } = options;

    return (source) =>
        defer(() => {
            let shownAt: number | null = null;

            return source.pipe(
                distinctUntilChanged(),
                switchMap((loading) => {
                    if (loading) {
                        // Restarted while the indicator is still shown: keep it rather than hide and show it again.
                        if (shownAt !== null) return EMPTY;

                        const show = defer(() => {
                            shownAt = asyncScheduler.now();

                            return of(true);
                        });

                        return delay > 0 ? timer(delay).pipe(switchMap(() => show)) : show;
                    }

                    if (shownAt === null) return of(false);

                    const remaining = minDuration - (asyncScheduler.now() - shownAt);
                    const hide = defer(() => {
                        shownAt = null;

                        return of(false);
                    });

                    return remaining > 0 ? timer(remaining).pipe(switchMap(() => hide)) : hide;
                }),
                distinctUntilChanged()
            );
        });
}
