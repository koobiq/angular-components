import { isSignal } from '@angular/core';
import { createSearchPredicate } from '@koobiq/components/core';
import { kbqResolveFilterBarName } from '../filter-bar-name';
import { KbqFilterBarName, KbqSelectValue } from '../filter-bar.types';

/**
 * Search over the options of `kbq-pipe-select` / `kbq-pipe-multi-select`: matches the resolved name,
 * and the caption when `matchCaption`. Pass `false` where a `valueTemplate` hides the caption.
 *
 * Reads a name signal, so the caller derives the result inside a `computed()` that also tracks the
 * query and the template updates: a translation re-filters without touching the option objects.
 */
export const kbqFilterSelectValuesBySearch = (
    values: KbqSelectValue[] | undefined,
    search: string | null,
    matchCaption: boolean
): KbqSelectValue[] => {
    // By reference, so an unsearched pipe re-emits the array it was given rather than a fresh copy.
    if (!search) return values ?? [];

    const matches = createSearchPredicate(search);

    return (values ?? []).filter((item) => {
        const name = kbqResolveFilterBarName(item.name);

        return matches(matchCaption && item.caption ? [name, item.caption] : name);
    });
};

/**
 * Stable identity of a select option: its `id`, or `undefined` for a legacy string-named option. A
 * signal-backed name cannot identify a value — a function has no stable, serializable value — so an
 * option that has one without an `id` is a configuration error and throws.
 */
export const kbqFilterSelectValueId = (
    value: { id?: string | number; name?: KbqFilterBarName } | null | undefined
): string | number | undefined => {
    if (value?.id !== undefined && value?.id !== null) {
        return value.id;
    }

    if (isSignal(value?.name)) {
        throw new Error(
            `A select value with a signal-backed name requires a stable "id" (name: "${kbqResolveFilterBarName(value?.name)}").`
        );
    }

    return undefined;
};
