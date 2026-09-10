import { createSearchPredicate } from '@koobiq/components/core';
import { KbqSelectValue } from '../filter-bar.types';

/**
 * Search over the options of `kbq-pipe-select` / `kbq-pipe-multi-select`, matching the name and, when
 * `matchCaption`, the caption. Pass `false` where a `valueTemplate` hides the caption, or the search
 * returns rows with no visible occurrence of the query.
 */
export const kbqFilterSelectValuesBySearch = (
    values: KbqSelectValue[] | undefined,
    search: string | null,
    matchCaption: boolean
): KbqSelectValue[] => {
    // By reference, so an unsearched pipe re-emits the array it was given rather than a fresh copy.
    if (!search) return values ?? [];

    const matches = createSearchPredicate(search);

    return (values ?? []).filter((item) =>
        matches(matchCaption && item.caption ? [item.name, item.caption] : item.name)
    );
};
