import { kbqGetBoundingClientRect, kbqGetClientRects } from './ssr';

const makeSsrElement = (overrides: Partial<Element> = {}): Element => ({ ...overrides }) as unknown as Element;

describe('kbqGetClientRects', () => {
    it('should return the element client rects in browser', () => {
        const rects = [{ height: 20 }] as unknown as DOMRect[];
        const element = makeSsrElement({ getClientRects: () => rects as unknown as DOMRectList });

        expect(kbqGetClientRects(element)).toBe(rects);
    });

    it('should return an empty array when getClientRects is unavailable (SSR)', () => {
        const element = makeSsrElement();

        expect(kbqGetClientRects(element)).toEqual([]);
    });
});

describe('kbqGetBoundingClientRect', () => {
    it('should return the element bounding rect in browser', () => {
        const rect = { width: 100, height: 50 } as DOMRect;
        const element = makeSsrElement({ getBoundingClientRect: () => rect });

        expect(kbqGetBoundingClientRect(element)).toBe(rect);
    });

    it('should return a zero-rect when getBoundingClientRect is unavailable (SSR)', () => {
        const element = makeSsrElement();
        const result = kbqGetBoundingClientRect(element);

        expect(result.width).toBe(0);
        expect(result.height).toBe(0);
        expect(result.top).toBe(0);
        expect(result.right).toBe(0);
        expect(result.bottom).toBe(0);
        expect(result.left).toBe(0);
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
    });
});
