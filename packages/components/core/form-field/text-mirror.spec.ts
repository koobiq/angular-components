import { kbqCreateTextMirror, KbqTextMirror } from './text-mirror';

const CLASS_NAME = 'test-mirror';

/** jsdom lays nothing out, so the metrics the mirror copies have to be supplied. */
const setMetrics = (field: HTMLElement, metrics: Record<string, number>) => {
    Object.entries(metrics).forEach(([name, value]) => {
        Object.defineProperty(field, name, { value, configurable: true });
    });
};

describe('kbqCreateTextMirror', () => {
    let container: HTMLElement;
    let mirror: KbqTextMirror;

    const getLayer = () => container.querySelector<HTMLElement>(`.${CLASS_NAME}`)!;

    beforeEach(() => {
        container = document.createElement('div');
        container.style.position = 'relative';
        document.body.appendChild(container);
    });

    afterEach(() => {
        mirror?.destroy();
        container.remove();
        jest.restoreAllMocks();
    });

    describe('textarea', () => {
        let textarea: HTMLTextAreaElement;

        beforeEach(() => {
            textarea = document.createElement('textarea');
            Object.assign(textarea.style, {
                fontSize: '14px',
                lineHeight: '20px',
                paddingTop: '6px',
                paddingLeft: '12px',
                borderLeftWidth: '1px',
                borderRightWidth: '1px',
                borderTopWidth: '1px',
                borderBottomWidth: '1px'
            });
            container.appendChild(textarea);
            setMetrics(textarea, { offsetLeft: 4, offsetTop: 8, clientWidth: 300, clientHeight: 80 });

            mirror = kbqCreateTextMirror(textarea, CLASS_NAME);
        });

        it('should insert a hidden, decorative layer right after the field', () => {
            const layer = getLayer();

            expect(textarea.nextElementSibling).toBe(layer);
            expect(layer.hidden).toBe(true);
            expect(layer.getAttribute('aria-hidden')).toBe('true');
            expect(layer.style.pointerEvents).toBe('none');
        });

        it('should render the hint between the transparent text around it', () => {
            expect(mirror.update('длинный тек', 'ст песни', '\nnext line')).toBe(true);

            const layer = getLayer();
            const hint = layer.querySelector(`.${CLASS_NAME}__hint`)!;

            expect(layer.hidden).toBe(false);
            expect(layer.style.color).toBe('transparent');
            // Zero-width spaces: a break opportunity before the hint, and a line box for a trailing newline.
            expect(layer.textContent).toBe('длинный тек\u200bст песни\nnext line\u200b');
            expect(hint.textContent).toBe('ст песни');
        });

        it('should take the typography and wrapping of the field', () => {
            textarea.style.whiteSpace = 'pre';
            mirror.update('a', 'b', '');

            const layer = getLayer();

            expect(layer.style.fontSize).toBe('14px');
            expect(layer.style.lineHeight).toBe('20px');
            expect(layer.style.paddingLeft).toBe('12px');
            expect(layer.style.whiteSpace).toBe('pre');
        });

        describe('hint placement', () => {
            /** jsdom lays nothing out; the rectangles below stand for a layout the browser would produce. */
            const layOut = (hintTop: number, hintLeft = 50) => {
                jest.spyOn(Element.prototype, 'getClientRects').mockImplementation(function (this: Element) {
                    if (!this.parentElement?.classList.contains(CLASS_NAME)) return [] as unknown as DOMRectList;

                    const top = this.classList.contains(`${CLASS_NAME}__hint`) ? hintTop : 20;
                    const left = this.classList.contains(`${CLASS_NAME}__hint`) ? hintLeft : 40;

                    return [{ top, left, width: 10, height: 20 }] as unknown as DOMRectList;
                });
                jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
                    top: 0,
                    left: 0,
                    width: 302,
                    height: 82
                } as DOMRect);
                setMetrics(getLayer(), { clientLeft: 1, clientTop: 1, clientWidth: 300, clientHeight: 80 });
            };

            it('should keep a hint that continues the row of the text before it', () => {
                layOut(20);

                expect(mirror.update('a', 'b', '')).toBe(true);
                expect(getLayer().hidden).toBe(false);
            });

            it('should hide a hint that the layout moved to another row', () => {
                layOut(40);

                expect(mirror.update('a', 'b', '')).toBe(false);
                expect(getLayer().hidden).toBe(true);
            });

            it('should hide a hint that is scrolled out of the visible part of the field', () => {
                layOut(20, 400);

                expect(mirror.update('a', 'b', '')).toBe(false);
                expect(getLayer().hidden).toBe(true);
            });
        });

        it('should cover the field without its scrollbar', () => {
            mirror.update('a', 'b', '');

            const layer = getLayer();

            expect(layer.style.left).toBe('4px');
            expect(layer.style.top).toBe('8px');
            expect(layer.style.width).toBe('302px');
            expect(layer.style.height).toBe('82px');
        });

        it('should follow the scroll offsets of the field', () => {
            const scrollTop = jest.spyOn(Element.prototype, 'scrollTop', 'set');
            const scrollLeft = jest.spyOn(Element.prototype, 'scrollLeft', 'set');

            setMetrics(textarea, { scrollTop: 40, scrollLeft: 0 });
            mirror.update('a', 'b', '');

            expect(scrollTop).toHaveBeenCalledWith(40);
            expect(scrollLeft).toHaveBeenCalledWith(0);
        });

        it('should hide the layer until the next update', () => {
            mirror.update('a', 'b', '');
            mirror.hide();

            expect(getLayer().hidden).toBe(true);

            mirror.update('a', 'c', '');

            expect(getLayer().hidden).toBe(false);
        });

        it('should remove the layer once destroyed', () => {
            mirror.destroy();

            expect(getLayer()).toBeNull();
        });
    });

    describe('input', () => {
        it('should keep the line unwrapped and centred in the content box', () => {
            const input = document.createElement('input');

            Object.assign(input.style, { paddingTop: '5px', paddingBottom: '5px' });
            container.appendChild(input);
            setMetrics(input, { offsetLeft: 0, offsetTop: 0, clientWidth: 200, clientHeight: 30 });

            mirror = kbqCreateTextMirror(input, CLASS_NAME);
            mirror.update('ab', 'c', '');

            expect(getLayer().style.whiteSpace).toBe('pre');
            expect(getLayer().style.lineHeight).toBe('20px');
        });
    });
});
