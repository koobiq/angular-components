import { kbqGetPopUpArrowShift } from './pop-up-positioning';

const panelRect = {
    left: 100,
    top: 100,
    right: 400,
    bottom: 260,
    width: 300,
    height: 160
} as DOMRect;

describe('kbqGetPopUpArrowShift', () => {
    it.each([
        { placement: 'top', point: { x: 340, y: 200 }, expected: { x: 90, y: 0 } },
        { placement: 'top-left', point: { x: 340, y: 200 }, expected: { x: 210, y: 0 } },
        { placement: 'top-right', point: { x: 100, y: 200 }, expected: { x: -240, y: 0 } },
        { placement: 'bottom', point: { x: 40, y: 200 }, expected: { x: -120, y: 0 } },
        { placement: 'bottom-left', point: { x: 450, y: 200 }, expected: { x: 240, y: 0 } },
        { placement: 'bottom-right', point: { x: 200, y: 200 }, expected: { x: -170, y: 0 } },
        { placement: 'right', point: { x: 200, y: 220 }, expected: { x: 0, y: 40 } },
        { placement: 'right-top', point: { x: 200, y: 250 }, expected: { x: 0, y: 100 } },
        { placement: 'right-bottom', point: { x: 200, y: 110 }, expected: { x: 0, y: -100 } },
        { placement: 'left', point: { x: 200, y: 50 }, expected: { x: 0, y: -50 } },
        { placement: 'left-top', point: { x: 200, y: 180 }, expected: { x: 0, y: 50 } },
        { placement: 'left-bottom', point: { x: 200, y: 180 }, expected: { x: 0, y: -50 } }
    ])('should align and clamp the arrow for $placement', ({ placement, point, expected }) => {
        expect(kbqGetPopUpArrowShift(placement, panelRect, point, 30)).toEqual(expected);
    });

    it.each([
        { placement: 'top', point: { x: 500, y: 100 } },
        { placement: 'right', point: { x: 100, y: 500 } }
    ])('should keep the arrow centered on a narrow panel for $placement', ({ placement, point }) => {
        const narrowRect = { left: 100, top: 100, right: 140, bottom: 140, width: 40, height: 40 } as DOMRect;

        expect(kbqGetPopUpArrowShift(placement, narrowRect, point, 30)).toEqual({ x: 0, y: 0 });
    });

    it('should center the arrow within a narrow edge-aligned panel', () => {
        const narrowRect = { left: 100, top: 100, right: 140, bottom: 260, width: 40, height: 160 } as DOMRect;

        expect(kbqGetPopUpArrowShift('bottom-right', narrowRect, { x: 200, y: 200 }, 30)).toEqual({ x: 10, y: 0 });
    });

    it('should use the requested arrow inset', () => {
        expect(kbqGetPopUpArrowShift('bottom-right', panelRect, { x: 200, y: 200 }, 19)).toEqual({ x: -181, y: 0 });
    });
});
