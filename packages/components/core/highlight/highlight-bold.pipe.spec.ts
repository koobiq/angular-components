import { KbqHighlightBoldPipe } from './highlight-bold.pipe';
import { KbqHighlightPipe, kbqHighlightMark } from './highlight.pipe';

describe(KbqHighlightBoldPipe.name, () => {
    const pipe = new KbqHighlightBoldPipe();

    it('should wrap matched text in <mark class="kbq-highlight">', () => {
        expect(pipe.transform('Hello world', 'world')).toBe(`Hello ${kbqHighlightMark('world')}`);
    });

    it('should fold diacritics when asked', () => {
        expect(pipe.transform('Crème brûlée', 'creme', true)).toBe(`${kbqHighlightMark('Crème')} brûlée`);
    });

    it('should highlight what the deprecated mcHighlight pipe does', () => {
        const legacy = new KbqHighlightPipe();

        expect(pipe.transform('ab Ab ab', 'ab')).toBe(legacy.transform('ab Ab ab', 'ab'));
    });
});
