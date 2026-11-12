import { createSearchPredicate } from '@koobiq/components/core';
import { KbqSelectValue } from '../filter-bar.types';

/**
 * Stable translation key of a select option: its own nonempty `nameKey`, or the key borrowed from the
 * single current option with the same `id`. Returns `undefined` for zero/duplicate matches, a missing
 * id, or no key on either side.
 */
export const kbqFilterSelectValueNameKey = (
    value: KbqSelectValue,
    values: KbqSelectValue[] | undefined
): string | undefined => {
    if (value.nameKey) return value.nameKey;

    if (value.id === undefined || value.id === null || !values) return undefined;

    const matches = values.filter((item) => item.id === value.id);

    return matches.length === 1 ? matches[0].nameKey : undefined;
};

/**
 * Search over the options of `kbq-pipe-select` / `kbq-pipe-multi-select`: matches the resolved name,
 * and the caption when `matchCaption`. Pass `false` where a `valueTemplate` hides the caption.
 *
 * The `resolveName` callback resolves an option's name so a translation re-filters the list without
 * touching the option objects.
 */
export const kbqFilterSelectValuesBySearch = (
    values: KbqSelectValue[] | undefined,
    search: string | null,
    matchCaption: boolean,
    resolveName: (value: KbqSelectValue) => string
): KbqSelectValue[] => {
    // By reference, so an unsearched pipe re-emits the array it was given rather than a fresh copy.
    if (!search) return values ?? [];

    const matches = createSearchPredicate(search);

    return (values ?? []).filter((item) => {
        const name = resolveName(item);

        return matches(matchCaption && item.caption ? [name, item.caption] : name);
    });
};
