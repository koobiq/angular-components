import { KbqHighlightBackgroundPipe, kbqHighlightBackgroundMark } from './highlight-background.pipe';

describe(KbqHighlightBackgroundPipe.name, () => {
    const pipe = new KbqHighlightBackgroundPipe();

    it('should wrap matched text in <mark class="kbq-highlight-background">', () => {
        expect(kbqHighlightBackgroundMark('x')).toBe('<mark class="kbq-highlight-background">x</mark>');
        expect(pipe.transform('Hello world', 'world')).toBe(`Hello ${kbqHighlightBackgroundMark('world')}`);
    });

    it('should use the background highlight class and not the bold highlight class', () => {
        const result = pipe.transform('ab ab', 'ab');

        expect(result).toContain('class="kbq-highlight-background"');
        expect(result).not.toContain('class="kbq-highlight"');
    });
});
