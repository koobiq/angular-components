import { DestroyRef, effect, EnvironmentInjector, inject, QueryList, Signal, untracked } from '@angular/core';

/**
 * Keeps a `QueryList` in step with a signal query, for a public member that stays typed as `QueryList` while the
 * query behind it is a signal one. Call it in an injection context and read the member through the function it
 * returns: a read brings the list up to date, so it is filled in `ngAfterContentInit`/`ngAfterViewInit` already.
 * Call it from `ngAfterContentChecked` (a content query) or `ngAfterViewChecked` (a view query) too: that is where
 * a decorator query emitted `changes` — after new items are bound, before the owner's host bindings. The list is
 * destroyed with its owner, which completes `changes`.
 *
 * ```ts
 * private readonly optionsQuery = contentChildren(KbqOption, { descendants: true });
 * private readonly optionsList = kbqQueryListFrom(this.optionsQuery);
 *
 * get options(): QueryList<KbqOption> {
 *     return this.optionsList();
 * }
 *
 * ngAfterContentChecked(): void {
 *     this.optionsList();
 * }
 * ```
 * @docs-private
 */
export function kbqQueryListFrom<T>(query: Signal<readonly T[]>): () => QueryList<T> {
    const list = new QueryList<T>(true);
    let synced: readonly T[] | undefined;

    const sync = (): QueryList<T> => {
        const results = query();

        if (results !== synced) {
            synced = results;
            // Untracked: a subscriber to `changes` may write signals, also when a template reads the list.
            untracked(() => {
                list.reset([...results]);
                list.notifyOnChanges();
            });
        }

        return list;
    };

    // Emits `changes` for an owner whose hook does not sync the list. A root effect: a view one runs before the
    // embedded views are checked, so items added by an `@for` would reach the subscribers unbound.
    const syncEffect = effect(() => sync(), { injector: inject(EnvironmentInjector), manualCleanup: true });

    inject(DestroyRef).onDestroy(() => {
        syncEffect.destroy();
        list.destroy();
    });

    return sync;
}
