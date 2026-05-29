import { KbqHighlightBackgroundPipe, kbqHighlightBackgroundMark } from './highlight-background.pipe';

describe(KbqHighlightBackgroundPipe.name, () => {
    let pipe: KbqHighlightBackgroundPipe;

    beforeEach(() => {
        pipe = new KbqHighlightBackgroundPipe();
    });

    it('should wrap matched text in mark tag', () => {
        expect(pipe.transform('Hello world', 'world')).toBe(`Hello ${kbqHighlightBackgroundMark('world')}`);
    });

    it('should be case insensitive', () => {
        expect(pipe.transform('Hello World', 'world')).toBe(`Hello ${kbqHighlightBackgroundMark('World')}`);
    });

    it('should highlight all occurrences', () => {
        expect(pipe.transform('ab ab ab', 'ab')).toBe(
            `${kbqHighlightBackgroundMark('ab')} ${kbqHighlightBackgroundMark('ab')} ${kbqHighlightBackgroundMark('ab')}`
        );
    });

    it('should return empty string for null value', () => {
        expect(pipe.transform(null, 'test')).toBe('');
        expect(pipe.transform(null, null)).toBe('');
        expect(pipe.transform(null, undefined)).toBe('');
        expect(pipe.transform(null, '')).toBe('');
    });

    it('should return empty string for undefined value', () => {
        expect(pipe.transform(undefined, 'test')).toBe('');
        expect(pipe.transform(undefined, null)).toBe('');
        expect(pipe.transform(undefined, undefined)).toBe('');
        expect(pipe.transform(undefined, '')).toBe('');
    });

    it('should return empty string for empty value', () => {
        expect(pipe.transform('', 'test')).toBe('');
        expect(pipe.transform('', null)).toBe('');
        expect(pipe.transform('', undefined)).toBe('');
        expect(pipe.transform('', '')).toBe('');
    });

    it('should return empty string for object value', () => {
        expect(pipe.transform({}, 'test')).toBe('');
        expect(pipe.transform({}, null)).toBe('');
        expect(pipe.transform([], undefined)).toBe('');
        expect(pipe.transform([], '')).toBe('');
    });

    it('should not match when search term is not found', () => {
        expect(pipe.transform('Hello world', 'xyz')).toBe('Hello world');
    });

    it('should escape HTML tags in value', () => {
        expect(pipe.transform('<script>alert("xss")</script>', '')).toBe(
            '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
        );
    });

    it('should escape ampersands in value', () => {
        expect(pipe.transform('Tom & Jerry', '')).toBe('Tom &amp; Jerry');
    });

    it('should not highlight inside escaped HTML entities', () => {
        expect(pipe.transform('Tom & Jerry', 'amp')).toBe('Tom &amp; Jerry');
    });

    it('should escape single quotes in value', () => {
        expect(pipe.transform("it's", '')).toBe('it&#39;s');
    });

    it('should escape HTML in value when highlighting', () => {
        expect(pipe.transform('<b>bold</b>', 'bold')).toBe(`&lt;b&gt;${kbqHighlightBackgroundMark('bold')}&lt;/b&gt;`);
    });

    it('should match search term containing HTML special characters', () => {
        expect(pipe.transform('a < b & c > d', '<')).toBe(`a ${kbqHighlightBackgroundMark('&lt;')} b &amp; c &gt; d`);
        expect(pipe.transform('a < b & c > d', '&')).toBe(`a &lt; b ${kbqHighlightBackgroundMark('&amp;')} c &gt; d`);
    });

    it('should prevent XSS through value', () => {
        expect(pipe.transform('<img src=x onerror=alert(1)>', '')).toBe('&lt;img src=x onerror=alert(1)&gt;');
    });

    it('should prevent XSS through innerHTML injection', () => {
        expect(pipe.transform('<a href="javascript:alert(1)">click</a>', 'click')).toBe(
            `&lt;a href=&quot;javascript:alert(1)&quot;&gt;${kbqHighlightBackgroundMark('click')}&lt;/a&gt;`
        );
    });

    it('should handle search term with regex special characters', () => {
        expect(pipe.transform('price is $100', '$100')).toBe(`price is ${kbqHighlightBackgroundMark('$100')}`);
    });

    it('should handle search term with parentheses', () => {
        expect(pipe.transform('call()', 'call()')).toBe(kbqHighlightBackgroundMark('call()'));
    });

    it('should handle search term with dots', () => {
        expect(pipe.transform('file.ts', '.')).toBe(`file${kbqHighlightBackgroundMark('.')}ts`);
    });

    it('should handle search term with square brackets', () => {
        expect(pipe.transform('arr[0]', '[0]')).toBe(`arr${kbqHighlightBackgroundMark('[0]')}`);
    });

    it('should wrap matched text in the background mark class', () => {
        expect(kbqHighlightBackgroundMark('x')).toBe('<mark class="kbq-highlight-background">x</mark>');
    });

    it('should use the background highlight class and not the bold highlight class', () => {
        const result = pipe.transform('ab ab', 'ab');

        expect(result).toContain('class="kbq-highlight-background"');
        expect(result).not.toContain('class="kbq-highlight"');
    });

    it('should highlight a substring inside a word', () => {
        expect(pipe.transform('Hello', 'ell')).toBe(`H${kbqHighlightBackgroundMark('ell')}o`);
    });

    it('should highlight a match at the start of the string', () => {
        expect(pipe.transform('Hello', 'He')).toBe(`${kbqHighlightBackgroundMark('He')}llo`);
    });

    it('should highlight a match at the end of the string', () => {
        expect(pipe.transform('Hello', 'lo')).toBe(`Hel${kbqHighlightBackgroundMark('lo')}`);
    });

    it('should highlight adjacent repeated matches', () => {
        expect(pipe.transform('aaa', 'a')).toBe(
            `${kbqHighlightBackgroundMark('a')}${kbqHighlightBackgroundMark('a')}${kbqHighlightBackgroundMark('a')}`
        );
    });

    it('should highlight the whole string when it fully matches', () => {
        expect(pipe.transform('test', 'test')).toBe(kbqHighlightBackgroundMark('test'));
    });

    it('should return empty string for non-string number and boolean values', () => {
        expect(pipe.transform(123, 'x')).toBe('');
        expect(pipe.transform(true, 'x')).toBe('');
    });

    it('should return escaped value when search term is not a string', () => {
        expect(pipe.transform('Hello', 123)).toBe('Hello');
    });

    it('should highlight cyrillic text', () => {
        expect(pipe.transform('Привет мир', 'вет')).toBe(`При${kbqHighlightBackgroundMark('вет')} мир`);
    });

    it('should be case insensitive for cyrillic text', () => {
        expect(pipe.transform('Привет', 'привет')).toBe(kbqHighlightBackgroundMark('Привет'));
    });

    it('should preserve surrounding whitespace around a match', () => {
        expect(pipe.transform('  a  ', 'a')).toBe(`  ${kbqHighlightBackgroundMark('a')}  `);
    });
});
