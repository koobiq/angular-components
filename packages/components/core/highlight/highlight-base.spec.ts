import { escapeRegExp, highlight } from './highlight-base';

describe('escapeRegExp', () => {
    it('should escape regex special characters', () => {
        expect(escapeRegExp('.*+?^${}()|[]\\')).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    });

    it('should not change a plain string without special characters', () => {
        expect(escapeRegExp('hello world')).toBe('hello world');
    });

    it('should return falsy input as is', () => {
        expect(escapeRegExp('')).toBe('');
        expect(escapeRegExp(null as any)).toBe(null);
        expect(escapeRegExp(undefined as any)).toBe(undefined);
    });
});

describe('highlight', () => {
    const mark = (text: string) => `[${text}]`;

    it('should wrap matches using the provided mark callback', () => {
        expect(highlight('Hello world', 'world', mark)).toBe('Hello [world]');
    });

    it('should support an arbitrary mark callback', () => {
        const customMark = (text: string) => `<x>${text}</x>`;

        expect(highlight('ab', 'ab', customMark)).toBe('<x>ab</x>');
    });

    it('should return empty string for non-string value', () => {
        expect(highlight(null, 'a', mark)).toBe('');
        expect(highlight(undefined, 'a', mark)).toBe('');
        expect(highlight(123, 'a', mark)).toBe('');
        expect(highlight({}, 'a', mark)).toBe('');
    });

    it('should return escaped value without calling mark when args is empty or not a string', () => {
        const spy = jest.fn((text: string) => `[${text}]`);

        expect(highlight('Tom & Jerry', '', spy)).toBe('Tom &amp; Jerry');
        expect(highlight('Tom & Jerry', null, spy)).toBe('Tom &amp; Jerry');
        expect(highlight('plain', 123, spy)).toBe('plain');
        expect(spy).not.toHaveBeenCalled();
    });

    it('should call mark only on matched parts', () => {
        const spy = jest.fn((text: string) => text.toUpperCase());

        highlight('a b a', 'a', spy);

        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledWith('a');
    });

    it('should be case insensitive', () => {
        expect(highlight('Hello World', 'world', mark)).toBe('Hello [World]');
    });

    it('should escape HTML in matched and unmatched parts', () => {
        expect(highlight('<b>bold</b>', 'bold', mark)).toBe('&lt;b&gt;[bold]&lt;/b&gt;');
    });
});
