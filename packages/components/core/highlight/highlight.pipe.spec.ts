import { KbqHighlightPipe, kbqHighlightMark } from './highlight.pipe';

describe(KbqHighlightPipe.name, () => {
    const pipe = new KbqHighlightPipe();

    it('should wrap matched text in <mark class="kbq-highlight">', () => {
        expect(kbqHighlightMark('x')).toBe('<mark class="kbq-highlight">x</mark>');
        expect(pipe.transform('Hello world', 'world')).toBe(`Hello ${kbqHighlightMark('world')}`);
    });

    it('should not produce the background highlight class', () => {
        const result = pipe.transform('ab ab', 'ab');

        expect(result).toContain('class="kbq-highlight"');
        expect(result).not.toContain('class="kbq-highlight-background"');
    });
});
