import { kbqGetCaretRect, kbqGetSelectionRect } from './caret-rect';

const CHAR_WIDTH = 10;
const LINE_HEIGHT = 20;
const PADDING = 8;
const BORDER = 1;
const FIELD = { left: 100, top: 50, width: 200, height: 32 };
const VALUE = 'abcdefghij';

/** jsdom lays nothing out, so every metric the helpers read has to be supplied. */
const setBox = (element: HTMLElement, box: Partial<typeof FIELD> = {}) => {
    const { left, top, width, height } = { ...FIELD, ...box };

    element.getBoundingClientRect = () =>
        ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top }) as DOMRect;

    Object.defineProperty(element, 'clientWidth', { value: width - BORDER * 2, configurable: true });
    Object.defineProperty(element, 'clientHeight', { value: height - BORDER * 2, configurable: true });
};

const styleAsField = (element: HTMLElement) => {
    Object.assign(element.style, {
        paddingLeft: `${PADDING}px`,
        paddingRight: `${PADDING}px`,
        paddingTop: `${PADDING}px`,
        borderLeftWidth: `${BORDER}px`,
        borderTopWidth: `${BORDER}px`,
        lineHeight: `${LINE_HEIGHT}px`,
        fontSize: '16px'
    });
};

/** Left edge of the text inside a field laid out by `styleAsField`. */
const TEXT_LEFT = FIELD.left + BORDER + PADDING;
/** A single line is centred in the content box. */
const TEXT_TOP = FIELD.top + (FIELD.height - LINE_HEIGHT) / 2;
/** What the helpers return when they give up on locating the caret and anchor to the field itself. */
const FIELD_AS_RECT = { x: FIELD.left, y: FIELD.top, width: FIELD.width, height: FIELD.height };

describe('caret rect', () => {
    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    describe('input', () => {
        let input: HTMLInputElement;

        beforeEach(() => {
            // The ruler measures itself with `scrollWidth`, which jsdom reports as 0 for every element.
            jest.spyOn(Element.prototype, 'scrollWidth', 'get').mockImplementation(function (this: Element) {
                return (this.textContent || '').length * CHAR_WIDTH;
            });

            input = document.createElement('input');
            input.value = VALUE;
            styleAsField(input);
            document.body.appendChild(input);
            setBox(input);
            input.setSelectionRange(3, 3);
        });

        it('should measure the caret from the start of the text', () => {
            expect(kbqGetCaretRect(input)).toEqual({
                x: TEXT_LEFT + 3 * CHAR_WIDTH,
                y: TEXT_TOP,
                width: 0,
                height: LINE_HEIGHT
            });
        });

        it('should shift the caret by the field scroll offset', () => {
            Object.defineProperty(input, 'scrollLeft', { value: 12, configurable: true });

            expect(kbqGetCaretRect(input)!.x).toBe(TEXT_LEFT + 3 * CHAR_WIDTH - 12);
        });

        it('should collapse the selection for the caret rect', () => {
            input.setSelectionRange(1, 4);

            expect(kbqGetCaretRect(input)).toMatchObject({ x: TEXT_LEFT + CHAR_WIDTH, width: 0 });
        });

        it('should span the selection for the selection rect', () => {
            input.setSelectionRange(1, 4);

            expect(kbqGetSelectionRect(input)).toMatchObject({ x: TEXT_LEFT + CHAR_WIDTH, width: 3 * CHAR_WIDTH });
        });

        it('should clamp a caret scrolled past the right edge back into the field', () => {
            input.setSelectionRange(VALUE.length, VALUE.length);
            setBox(input, { width: 40 });

            expect(kbqGetCaretRect(input)!.x).toBe(FIELD.left + BORDER + input.clientWidth);
        });

        it('should clamp a selection that starts before the field to what is visible', () => {
            input.setSelectionRange(0, VALUE.length);
            Object.defineProperty(input, 'scrollLeft', { value: 1000, configurable: true });

            const rect = kbqGetSelectionRect(input)!;

            expect(rect.x).toBe(FIELD.left + BORDER);
            expect(rect.width).toBe(0);
        });

        it('should remove the ruler it measured with', () => {
            kbqGetCaretRect(input);

            expect(document.body.children).toHaveLength(1);
        });

        it('should fall back to the field box for a password field', () => {
            input.type = 'password';

            expect(kbqGetCaretRect(input)).toEqual(FIELD_AS_RECT);
        });

        it('should fall back to the field box in right-to-left text', () => {
            input.style.direction = 'rtl';

            expect(kbqGetCaretRect(input)).toEqual(FIELD_AS_RECT);
        });

        it('should return null for a field that reports no selection', () => {
            Object.defineProperty(input, 'selectionStart', { value: null, configurable: true });

            expect(kbqGetCaretRect(input)).toBeNull();
        });

        it('should fall back to the font size when the line height does not compute to a length', () => {
            input.style.lineHeight = 'normal';

            expect(kbqGetCaretRect(input)!.height).toBe(16);
        });
    });

    describe('textarea', () => {
        let textarea: HTMLTextAreaElement;

        beforeEach(() => {
            // jsdom reports 0 for both offsets; the marker is laid out one line down per newline before it.
            jest.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(function (this: HTMLElement) {
                const before = this.previousSibling?.textContent || '';

                return PADDING + (before.split('\n').length - 1) * LINE_HEIGHT;
            });
            jest.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) {
                const before = this.previousSibling?.textContent || '';

                return PADDING + (before.split('\n').pop() || '').length * CHAR_WIDTH;
            });

            textarea = document.createElement('textarea');
            textarea.value = 'ab\ncdef';
            styleAsField(textarea);
            document.body.appendChild(textarea);
            setBox(textarea, { height: 80 });
            textarea.setSelectionRange(5, 5);
        });

        it('should measure the caret on the wrapped line', () => {
            expect(kbqGetCaretRect(textarea)).toEqual({
                x: FIELD.left + BORDER + PADDING + 2 * CHAR_WIDTH,
                y: FIELD.top + BORDER + PADDING + LINE_HEIGHT,
                width: 0,
                height: LINE_HEIGHT
            });
        });

        it('should shift the caret by the vertical scroll offset', () => {
            Object.defineProperty(textarea, 'scrollTop', { value: LINE_HEIGHT, configurable: true });

            expect(kbqGetCaretRect(textarea)!.y).toBe(FIELD.top + BORDER + PADDING);
        });

        it('should span a selection that stays on one line', () => {
            textarea.setSelectionRange(3, 6);

            expect(kbqGetSelectionRect(textarea)!.width).toBe(3 * CHAR_WIDTH);
        });

        it('should collapse a selection that spans several lines', () => {
            textarea.setSelectionRange(1, 6);

            expect(kbqGetSelectionRect(textarea)!.width).toBe(0);
        });

        it('should remove the mirror it measured with', () => {
            kbqGetCaretRect(textarea);

            expect(document.body.children).toHaveLength(1);
        });
    });

    describe('contenteditable', () => {
        let host: HTMLElement;
        /** Whether the browser lays the range out; a collapsed range in an empty node gets no box. */
        let laidOut: boolean;

        const TEXT_ORIGIN = 140;

        const rectFor = (start: number, end: number, height: number): DOMRect =>
            ({
                left: TEXT_ORIGIN + start * CHAR_WIDTH,
                top: 60,
                width: (end - start) * CHAR_WIDTH,
                height
            }) as DOMRect;

        const select = (node: Node, start: number, end: number) => {
            const range = document.createRange();

            range.setStart(node, start);
            range.setEnd(node, end);

            const selection = window.getSelection()!;

            selection.removeAllRanges();
            selection.addRange(range);
        };

        beforeEach(() => {
            laidOut = true;

            // jsdom implements neither, so there is no property to spy on — they are installed and removed.
            Range.prototype.getBoundingClientRect = function (this: Range) {
                return rectFor(this.startOffset, this.endOffset, laidOut ? LINE_HEIGHT : 0);
            };

            Range.prototype.getClientRects = function (this: Range) {
                return [rectFor(this.startOffset, this.endOffset, LINE_HEIGHT)] as unknown as DOMRectList;
            };

            host = document.createElement('div');
            host.contentEditable = 'true';
            host.textContent = VALUE;
            document.body.appendChild(host);
            setBox(host);
        });

        afterEach(() => {
            Reflect.deleteProperty(Range.prototype, 'getBoundingClientRect');
            Reflect.deleteProperty(Range.prototype, 'getClientRects');
        });

        it('should measure the range the browser laid out', () => {
            select(host.firstChild!, 1, 4);

            expect(kbqGetSelectionRect(host)).toEqual({
                x: TEXT_ORIGIN + CHAR_WIDTH,
                y: 60,
                width: 3 * CHAR_WIDTH,
                height: LINE_HEIGHT
            });
        });

        it('should collapse the range for the caret rect', () => {
            select(host.firstChild!, 1, 4);

            expect(kbqGetCaretRect(host)).toEqual({
                x: TEXT_ORIGIN + CHAR_WIDTH,
                y: 60,
                width: 0,
                height: LINE_HEIGHT
            });
        });

        it('should fall back to the line rect when the collapsed range has no box', () => {
            laidOut = false;
            select(host.firstChild!, 1, 4);

            expect(kbqGetCaretRect(host)).toEqual({
                x: TEXT_ORIGIN + CHAR_WIDTH,
                y: 60,
                width: 0,
                height: LINE_HEIGHT
            });
        });

        it('should fall back to the element box when nothing can be measured', () => {
            laidOut = false;
            Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
            select(host.firstChild!, 1, 4);

            expect(kbqGetCaretRect(host)).toEqual(FIELD_AS_RECT);
        });

        it('should return null when the selection is outside the element', () => {
            const sibling = document.createElement('div');

            sibling.textContent = VALUE;
            document.body.appendChild(sibling);
            select(sibling.firstChild!, 0, 1);

            expect(kbqGetCaretRect(host)).toBeNull();
        });

        it('should return null when there is no selection at all', () => {
            window.getSelection()!.removeAllRanges();

            expect(kbqGetCaretRect(host)).toBeNull();
        });
    });
});
