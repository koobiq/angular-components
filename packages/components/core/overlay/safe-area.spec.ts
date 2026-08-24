import { KbqTriangle, getSafeTriangleVertices, isPointInRect, isPointInTriangle } from './safe-area';

const rect = (left: number, top: number, right: number, bottom: number): DOMRect =>
    ({ left, top, right, bottom, width: right - left, height: bottom - top, x: left, y: top }) as DOMRect;

describe('isPointInRect', () => {
    const target = rect(100, 100, 200, 200);

    it('should be true for a point inside the rect', () => {
        expect(isPointInRect({ x: 150, y: 150 }, target)).toBe(true);
    });

    it('should be true for a point exactly on an edge', () => {
        expect(isPointInRect({ x: 100, y: 150 }, target)).toBe(true);
        expect(isPointInRect({ x: 200, y: 150 }, target)).toBe(true);
    });

    it('should be false for a point outside the rect', () => {
        expect(isPointInRect({ x: 50, y: 50 }, target)).toBe(false);
        expect(isPointInRect({ x: 250, y: 150 }, target)).toBe(false);
    });
});

describe('isPointInTriangle', () => {
    const triangle: KbqTriangle = { a: { x: 0, y: 0 }, b: { x: 100, y: 0 }, c: { x: 0, y: 100 } };

    it('should be true for a point inside the triangle', () => {
        expect(isPointInTriangle({ x: 10, y: 10 }, triangle)).toBe(true);
    });

    it('should be true for a point exactly on an edge', () => {
        expect(isPointInTriangle({ x: 50, y: 0 }, triangle)).toBe(true);
    });

    it('should be true for a vertex', () => {
        expect(isPointInTriangle(triangle.a, triangle)).toBe(true);
    });

    it('should be false for a point outside the triangle', () => {
        expect(isPointInTriangle({ x: 60, y: 60 }, triangle)).toBe(false);
        expect(isPointInTriangle({ x: -10, y: -10 }, triangle)).toBe(false);
    });
});

describe('getSafeTriangleVertices', () => {
    it('should use the left edge when the submenu opens to the right of the origin', () => {
        const origin = { x: 90, y: 50 };
        const target = rect(100, 0, 300, 200);

        expect(getSafeTriangleVertices(origin, target)).toEqual({
            a: origin,
            b: { x: 100, y: 0 },
            c: { x: 100, y: 200 }
        });
    });

    it('should use the right edge when the submenu opens to the left of the origin', () => {
        const origin = { x: 310, y: 50 };
        const target = rect(0, 0, 300, 200);

        expect(getSafeTriangleVertices(origin, target)).toEqual({
            a: origin,
            b: { x: 300, y: 0 },
            c: { x: 300, y: 200 }
        });
    });

    it('should pick the nearer edge when the origin is directly above the panel', () => {
        const target = rect(0, 100, 200, 300);

        expect(getSafeTriangleVertices({ x: 190, y: 50 }, target).b).toEqual({ x: 200, y: 100 });
        expect(getSafeTriangleVertices({ x: 10, y: 50 }, target).b).toEqual({ x: 0, y: 100 });
    });
});
