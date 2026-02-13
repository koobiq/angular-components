import { KbqHighlightPipe } from './highlight.pipe';

const mark = (text: string): string => `<mark class="kbq-highlight">${text}</mark>`;

describe(KbqHighlightPipe.name, () => {
    let pipe: KbqHighlightPipe;

    beforeEach(() => {
        pipe = new KbqHighlightPipe();
    });

    it('should wrap matched text in mark tag', () => {
        expect(pipe.transform('Hello world', 'world')).toBe(`Hello ${mark('world')}`);
    });

    it('should be case insensitive', () => {
        expect(pipe.transform('Hello World', 'world')).toBe(`Hello ${mark('World')}`);
    });

    it('should highlight all occurrences', () => {
        expect(pipe.transform('ab ab ab', 'ab')).toBe(`${mark('ab')} ${mark('ab')} ${mark('ab')}`);
    });

    it('should return escaped value when search is empty', () => {
        expect(pipe.transform('Hello', '')).toBe('Hello');
    });

    it('should return escaped value when search is null', () => {
        expect(pipe.transform('Hello', null)).toBe('Hello');
    });

    it('should return escaped value when search is undefined', () => {
        expect(pipe.transform('Hello', undefined)).toBe('Hello');
    });

    it('should return escaped value when search is not a string', () => {
        expect(pipe.transform('Hello', 123)).toBe('Hello');
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

    it('should escape single quotes in value', () => {
        expect(pipe.transform("it's", '')).toBe('it&#39;s');
    });

    it('should escape HTML in value when highlighting', () => {
        expect(pipe.transform('<b>bold</b>', 'bold')).toBe(`&lt;b&gt;${mark('bold')}&lt;/b&gt;`);
    });

    it('should match search term containing HTML special characters', () => {
        expect(pipe.transform('a < b & c > d', '<')).toBe(`a ${mark('&lt;')} b &amp; c &gt; d`);
        expect(pipe.transform('a < b & c > d', '&')).toBe(`a &lt; b ${mark('&amp;')} c &gt; d`);
    });

    it('should prevent XSS through value', () => {
        expect(pipe.transform('<img src=x onerror=alert(1)>', '')).toBe('&lt;img src=x onerror=alert(1)&gt;');
    });

    it('should prevent XSS through innerHTML injection', () => {
        expect(pipe.transform('<a href="javascript:alert(1)">click</a>', 'click')).toBe(
            '&lt;a href=&quot;javascript:alert(1)&quot;&gt;<mark class=\"kbq-highlight\">click</mark>&lt;/a&gt;'
        );
    });

    it('should handle search term with regex special characters', () => {
        expect(pipe.transform('price is $100', '$100')).toBe(`price is ${mark('$100')}`);
    });

    it('should handle search term with parentheses', () => {
        expect(pipe.transform('call()', 'call()')).toBe(mark('call()'));
    });

    it('should handle search term with dots', () => {
        expect(pipe.transform('file.ts', '.')).toBe(`file${mark('.')}ts`);
    });

    it('should handle search term with square brackets', () => {
        expect(pipe.transform('arr[0]', '[0]')).toBe(`arr${mark('[0]')}`);
    });
});
