import { createSearchPredicate } from '@koobiq/components/core';
import { KbqSelectValue } from '../filter-bar.types';

/**
 * Search over the options of `kbq-pipe-select` / `kbq-pipe-multi-select`, matching the query against an
 * option's name and — when the dropdown actually renders it — its caption.
 *
 * `matchCaption` follows what the pipe puts on screen: a pipe template supplying a `valueTemplate` owns
 * the whole option and drops the caption, so matching it there would return rows containing no visible
 * occurrence of the query.
 *
 * Uses the library-wide search semantics (`createSearchPredicate`): case- and diacritic-insensitive,
 * whitespace-separated tokens ANDed together, `"quoted phrases"` kept whole.
 */
export const kbqFilterSelectValuesBySearch = (
    values: KbqSelectValue[] | undefined,
    search: string | null,
    matchCaption: boolean
): KbqSelectValue[] => {
    // Returned by reference rather than through the predicate, so an unsearched pipe re-emits the very
    // array it was given instead of a fresh copy on every template change.
    if (!search) return values ?? [];

    const matches = createSearchPredicate(search);

    return (values ?? []).filter((item) =>
        matches(matchCaption && item.caption ? [item.name, item.caption] : item.name)
    );
};
