import { escapeRegExp, highlight } from './highlight-base';

describe('escapeRegExp', () => {
    it('should escape regex special characters', () => {
        expect(escapeRegExp('.*+?^${}()|[]\\')).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    });

    it('should not change a plain string without special characters', () => {
        expect(escapeRegExp('hello world')).toBe('hello world');
    });

    it('should return empty string as is', () => {
        expect(escapeRegExp('')).toBe('');
    });
});

describe('highlight', () => {
    const mark = (text: string) => `[${text}]`;

    describe('wrapping', () => {
        it('should wrap matches using the provided mark callback', () => {
            expect(highlight('Hello world', 'world', mark)).toBe('Hello [world]');
        });

        it('should support an arbitrary mark callback', () => {
            const customMark = (text: string) => `<x>${text}</x>`;

            expect(highlight('ab', 'ab', customMark)).toBe('<x>ab</x>');
        });

        it('should call mark only on matched parts', () => {
            const spy = jest.fn((text: string) => text.toUpperCase());

            highlight('a b a', 'a', spy);

            expect(spy).toHaveBeenCalledTimes(2);
            expect(spy).toHaveBeenCalledWith('a');
        });

        it('should highlight all occurrences', () => {
            expect(highlight('ab ab ab', 'ab', mark)).toBe('[ab] [ab] [ab]');
        });

        it('should not match when keyword is not found', () => {
            expect(highlight('Hello world', 'xyz', mark)).toBe('Hello world');
        });
    });

    describe('value/keyword guards', () => {
        it('should return empty string for non-string value', () => {
            expect(highlight(null, 'a', mark)).toBe('');
            expect(highlight(undefined, 'a', mark)).toBe('');
            expect(highlight(123, 'a', mark)).toBe('');
            expect(highlight(true, 'a', mark)).toBe('');
            expect(highlight({}, 'a', mark)).toBe('');
            expect(highlight([], 'a', mark)).toBe('');
        });

        it('should return escaped value without calling mark when keyword is empty or not a string', () => {
            const spy = jest.fn((text: string) => `[${text}]`);

            expect(highlight('Tom & Jerry', '', spy)).toBe('Tom &amp; Jerry');
            expect(highlight('Tom & Jerry', null, spy)).toBe('Tom &amp; Jerry');
            expect(highlight('Tom & Jerry', undefined, spy)).toBe('Tom &amp; Jerry');
            expect(highlight('plain', 123, spy)).toBe('plain');
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('case-insensitive matching', () => {
        it('should be case insensitive for latin text', () => {
            expect(highlight('Hello World', 'world', mark)).toBe('Hello [World]');
        });

        it('should be case insensitive for cyrillic text', () => {
            expect(highlight('Привет', 'привет', mark)).toBe('[Привет]');
        });
    });

    describe('match position', () => {
        it('should highlight a substring inside a word', () => {
            expect(highlight('Hello', 'ell', mark)).toBe('H[ell]o');
        });

        it('should highlight a match at the start of the string', () => {
            expect(highlight('Hello', 'He', mark)).toBe('[He]llo');
        });

        it('should highlight a match at the end of the string', () => {
            expect(highlight('Hello', 'lo', mark)).toBe('Hel[lo]');
        });

        it('should highlight adjacent repeated matches', () => {
            expect(highlight('aaa', 'a', mark)).toBe('[a][a][a]');
        });

        it('should highlight the whole string when it fully matches', () => {
            expect(highlight('test', 'test', mark)).toBe('[test]');
        });

        it('should preserve surrounding whitespace around a match', () => {
            expect(highlight('  a  ', 'a', mark)).toBe('  [a]  ');
        });

        it('should highlight cyrillic substring', () => {
            expect(highlight('Привет мир', 'вет', mark)).toBe('При[вет] мир');
        });
    });

    describe('HTML escaping (XSS-safe)', () => {
        it('should escape HTML tags in value', () => {
            expect(highlight('<script>alert("xss")</script>', '', mark)).toBe(
                '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
            );
        });

        it('should escape ampersands in value', () => {
            expect(highlight('Tom & Jerry', '', mark)).toBe('Tom &amp; Jerry');
        });

        it('should escape single quotes in value', () => {
            expect(highlight("it's", '', mark)).toBe('it&#39;s');
        });

        it('should escape HTML in matched and unmatched parts', () => {
            expect(highlight('<b>bold</b>', 'bold', mark)).toBe('&lt;b&gt;[bold]&lt;/b&gt;');
        });

        it('should not highlight inside escaped HTML entities', () => {
            expect(highlight('Tom & Jerry', 'amp', mark)).toBe('Tom &amp; Jerry');
        });

        it('should match keyword containing HTML special characters', () => {
            expect(highlight('a < b & c > d', '<', mark)).toBe('a [&lt;] b &amp; c &gt; d');
            expect(highlight('a < b & c > d', '&', mark)).toBe('a &lt; b [&amp;] c &gt; d');
        });

        it('should prevent XSS through value', () => {
            expect(highlight('<img src=x onerror=alert(1)>', '', mark)).toBe('&lt;img src=x onerror=alert(1)&gt;');
        });

        it('should prevent XSS through innerHTML injection', () => {
            expect(highlight('<a href="javascript:alert(1)">click</a>', 'click', mark)).toBe(
                '&lt;a href=&quot;javascript:alert(1)&quot;&gt;[click]&lt;/a&gt;'
            );
        });
    });

    describe('regex special characters in keyword', () => {
        it('should handle keyword with dollar sign', () => {
            expect(highlight('price is $100', '$100', mark)).toBe('price is [$100]');
        });

        it('should handle keyword with parentheses', () => {
            expect(highlight('call()', 'call()', mark)).toBe('[call()]');
        });

        it('should handle keyword with dots', () => {
            expect(highlight('file.ts', '.', mark)).toBe('file[.]ts');
        });

        it('should handle keyword with square brackets', () => {
            expect(highlight('arr[0]', '[0]', mark)).toBe('arr[[0]]');
        });
    });
});
