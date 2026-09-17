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
            mirror.update('длинный тек', 'ст песни', '\nnext line');

            const layer = getLayer();
            const hint = layer.querySelector(`.${CLASS_NAME}__hint`)!;

            expect(layer.hidden).toBe(false);
            expect(layer.style.color).toBe('transparent');
            expect(layer.textContent).toBe('длинный текст песни\nnext line');
            expect(hint.textContent).toBe('ст песни');
        });

        it('should take the typography and wrapping of the field', () => {
            mirror.update('a', 'b', '');

            const layer = getLayer();

            expect(layer.style.fontSize).toBe('14px');
            expect(layer.style.lineHeight).toBe('20px');
            expect(layer.style.paddingLeft).toBe('12px');
            expect(layer.style.whiteSpace).toBe('pre-wrap');
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
