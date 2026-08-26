import { createSearchPredicate, findSearchMatchRanges, normalizeSearchValue, tokenizeSearchQuery } from './search-base';

describe('normalizeSearchValue', () => {
    it('should lowercase using the current locale', () => {
        expect(normalizeSearchValue('HELLO')).toBe('hello');
    });

    it('should trim leading and trailing whitespace but preserve internal whitespace', () => {
        expect(normalizeSearchValue('  a  b  ')).toBe('a  b');
    });

    it('should strip diacritics via NFKD decomposition', () => {
        expect(normalizeSearchValue('café')).toBe('cafe');
        expect(normalizeSearchValue('Ångström')).toBe('angstrom');
    });

    it('should leave punctuation intact', () => {
        expect(normalizeSearchValue('10.125.123.0/24 - all')).toBe('10.125.123.0/24 - all');
    });

    it('should return empty string for empty or non-string input', () => {
        expect(normalizeSearchValue('')).toBe('');
        expect(normalizeSearchValue(null as unknown as string)).toBe('');
        expect(normalizeSearchValue(undefined as unknown as string)).toBe('');
    });

    it('should keep Cyrillic й distinct from и despite NFKD decomposing it to и + a combining breve', () => {
        expect(normalizeSearchValue('мой')).toBe('мой');
        expect(normalizeSearchValue('мои')).toBe('мои');
        expect(normalizeSearchValue('Йошкар-Ола')).toBe('йошкар-ола');
    });

    it('should still fold ё to е like any other diacritic', () => {
        expect(normalizeSearchValue('ёлка')).toBe('елка');
    });
});

describe('tokenizeSearchQuery', () => {
    it('should split bare words on whitespace', () => {
        expect(tokenizeSearchQuery('foo bar')).toEqual(['foo', 'bar']);
    });

    it('should collapse repeated whitespace between tokens', () => {
        expect(tokenizeSearchQuery('foo   bar\tbaz')).toEqual(['foo', 'bar', 'baz']);
    });

    it('should keep a quoted phrase as a single token', () => {
        expect(tokenizeSearchQuery('"exact phrase"')).toEqual(['exact phrase']);
    });

    it('should mix bare tokens and quoted phrases', () => {
        expect(tokenizeSearchQuery('foo "exact phrase" bar')).toEqual(['foo', 'exact phrase', 'bar']);
    });

    it('should keep an unmatched quote as part of its token instead of dropping it', () => {
        expect(() => tokenizeSearchQuery('foo "bar baz')).not.toThrow();
        expect(tokenizeSearchQuery('foo "bar baz')).toEqual(['foo', '"bar', 'baz']);
    });

    it('should return an empty array for an empty or whitespace-only query', () => {
        expect(tokenizeSearchQuery('')).toEqual([]);
        expect(tokenizeSearchQuery('   ')).toEqual([]);
    });
});

describe('createSearchPredicate', () => {
    it('should match case-insensitively', () => {
        expect(createSearchPredicate('WORLD')('Hello world')).toBe(true);
    });

    it('should match starting from the very first character, with no minimum length', () => {
        expect(createSearchPredicate('a')('all')).toBe(true);
    });

    it('should ignore leading/trailing whitespace in the query and the haystack', () => {
        expect(createSearchPredicate('  all  ')('  10.125.123.0/24 - all  ')).toBe(true);
    });

    it('should AND-combine multiple tokens, regardless of order', () => {
        expect(createSearchPredicate('10.125 all')('10.125.123.0/24 - all')).toBe(true);
        expect(createSearchPredicate('all 10.125')('10.125.123.0/24 - all')).toBe(true);
    });

    it('should not match when one of the required tokens is missing', () => {
        expect(createSearchPredicate('10.125 missing')('10.125.123.0/24 - all')).toBe(false);
    });

    it('should match a quoted phrase only as an exact substring', () => {
        expect(createSearchPredicate('"123.0/24"')('10.125.123.0/24 - all')).toBe(true);
        expect(createSearchPredicate('"0/24 123"')('10.125.123.0/24 - all')).toBe(false);
    });

    it('should combine bare tokens and quoted phrases with AND', () => {
        expect(createSearchPredicate('all "123.0/24"')('10.125.123.0/24 - all')).toBe(true);
        expect(createSearchPredicate('missing "123.0/24"')('10.125.123.0/24 - all')).toBe(false);
    });

    it('should be diacritic-insensitive in both directions', () => {
        expect(createSearchPredicate('cafe')('Café Wi-Fi')).toBe(true);
        expect(createSearchPredicate('café')('Cafe Wi-Fi')).toBe(true);
    });

    it('should OR-match across an array of fields while AND-combining tokens', () => {
        const predicate = createSearchPredicate('10.125 guest');

        expect(predicate(['10.125.11.0/24', 'guest network'])).toBe(true);
        expect(predicate(['10.125.11.0/24', 'admin network'])).toBe(false);
    });

    it('should match everything for an empty or whitespace-only query', () => {
        const predicate = createSearchPredicate('   ');

        expect(predicate('anything')).toBe(true);
        expect(predicate('')).toBe(true);
    });
});

describe('findSearchMatchRanges', () => {
    it('should map a diacritic-folded match back onto the accented original', () => {
        expect(findSearchMatchRanges('Café Wi-Fi', ['cafe'])).toEqual([[0, 4]]);
    });

    it('should return ranges for every token independently', () => {
        expect(findSearchMatchRanges('10.125.123.0/24 - all', ['10.125', 'all'])).toEqual([
            [0, 6],
            [18, 21]
        ]);
    });

    it('should merge overlapping ranges from different tokens', () => {
        expect(findSearchMatchRanges('café', ['caf', 'afe'])).toEqual([[0, 4]]);
    });

    it('should be case-insensitive', () => {
        expect(findSearchMatchRanges('Café', ['CAFE'])).toEqual([[0, 4]]);
    });

    it('should return an empty array when nothing matches', () => {
        expect(findSearchMatchRanges('Café', ['xyz'])).toEqual([]);
    });

    it('should return an empty array for an empty or whitespace-only token list', () => {
        expect(findSearchMatchRanges('Café', [])).toEqual([]);
        expect(findSearchMatchRanges('Café', [''])).toEqual([]);
    });

    it('should keep й distinct from и, consistent with normalizeSearchValue', () => {
        expect(findSearchMatchRanges('мой дом', ['мои'])).toEqual([]);
        expect(findSearchMatchRanges('мой дом', ['мой'])).toEqual([[0, 3]]);
    });
});
