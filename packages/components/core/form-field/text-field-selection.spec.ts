import { kbqRevealSelection, kbqSetSelectionRange } from './text-field-selection';

const CHAR_WIDTH = 10;
const PADDING = 8;
const VALUE = '24.01.2026';
const TEXT_WIDTH = VALUE.length * CHAR_WIDTH;

describe('text field selection', () => {
    let input: HTMLInputElement;
    let scrollLeft: number;

    /** jsdom lays nothing out, so the metrics the helper reads have to be supplied. */
    const setClientWidth = (clientWidth: number) => {
        Object.defineProperty(input, 'clientWidth', { value: clientWidth, configurable: true });
        Object.defineProperty(input, 'scrollWidth', { value: TEXT_WIDTH + PADDING * 2, configurable: true });
    };

    beforeEach(() => {
        // The ruler measures itself with `scrollWidth`, which jsdom reports as 0 for every element.
        jest.spyOn(Element.prototype, 'scrollWidth', 'get').mockImplementation(function (this: Element) {
            return (this.textContent || '').length * CHAR_WIDTH;
        });

        input = document.createElement('input');
        input.style.padding = `0 ${PADDING}px`;
        input.value = VALUE;

        scrollLeft = 0;
        Object.defineProperty(input, 'scrollLeft', {
            get: () => scrollLeft,
            set: (value: number) => (scrollLeft = value),
            configurable: true
        });

        document.body.appendChild(input);
        input.focus();
    });

    afterEach(() => {
        input.remove();
        // `clearMocks` only clears call records, so the prototype patch has to be undone by hand.
        jest.restoreAllMocks();
        // Restores the prototype getter for the tests that shadow it on the shared document.
        Reflect.deleteProperty(document, 'defaultView');
    });

    describe('kbqRevealSelection', () => {
        it('should reset an offset left over from a longer value', () => {
            setClientWidth(TEXT_WIDTH + PADDING * 2 + 40);
            scrollLeft = 30;

            kbqRevealSelection(input);

            expect(input.scrollLeft).toBe(0);
        });

        it('should scroll back to the start for the first group', () => {
            setClientWidth(100);
            scrollLeft = 16;
            input.setSelectionRange(0, 2);

            kbqRevealSelection(input);

            expect(input.scrollLeft).toBe(0);
        });

        it('should scroll the last group into view', () => {
            setClientWidth(100);
            input.setSelectionRange(6, 10);

            kbqRevealSelection(input);

            // The whole overflow: `end` sits at the very end of the value.
            expect(input.scrollLeft).toBe(TEXT_WIDTH + PADDING * 2 - 100);
        });

        it('should scroll a middle group only as far as it takes to show it', () => {
            const clientWidth = 60;

            setClientWidth(clientWidth);
            input.setSelectionRange(3, 5);

            kbqRevealSelection(input);

            // The end of the month group, one padding in from the right edge: neither end of the value.
            expect(input.scrollLeft).toBe(PADDING + 5 * CHAR_WIDTH + PADDING - clientWidth);
        });

        it('should prefer the start of a selection wider than the field', () => {
            setClientWidth(40);
            input.setSelectionRange(0, 10);

            kbqRevealSelection(input);

            expect(input.scrollLeft).toBe(0);
        });

        it('should leave a field the user has left alone', () => {
            setClientWidth(100);
            input.setSelectionRange(0, 2);
            scrollLeft = 16;
            input.blur();

            kbqRevealSelection(input);

            expect(input.scrollLeft).toBe(16);
        });

        it('should leave a field that renders something other than its value alone', () => {
            setClientWidth(100);
            input.type = 'password';
            scrollLeft = 16;

            kbqRevealSelection(input);

            expect(input.scrollLeft).toBe(16);
        });

        it('should leave a field without a view alone', () => {
            setClientWidth(100);
            scrollLeft = 16;
            Object.defineProperty(input.ownerDocument, 'defaultView', { value: null, configurable: true });

            kbqRevealSelection(input);

            expect(input.scrollLeft).toBe(16);
        });
    });

    describe('kbqSetSelectionRange', () => {
        it('should select the range and reveal it in one call', () => {
            setClientWidth(100);

            kbqSetSelectionRange(input, 6, 10);

            expect([input.selectionStart, input.selectionEnd]).toEqual([6, 10]);
            expect(input.scrollLeft).toBe(TEXT_WIDTH + PADDING * 2 - 100);
        });

        it('should not leave a ruler behind', () => {
            setClientWidth(100);

            kbqSetSelectionRange(input, 6, 10);

            expect(document.body.querySelector('span')).toBeNull();
        });
    });
});
