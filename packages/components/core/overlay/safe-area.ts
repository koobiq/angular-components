/**
 * A simple (x, y) coordinate. Picked from the DOM's own `DOMPointReadOnly` rather than hand-rolled, so
 * a plain `{ x, y }` literal (e.g. from a `MouseEvent`) satisfies it without constructing a `DOMPoint` —
 * `DOMPoint` isn't implemented in every runtime (e.g. jsdom).
 * @docs-private
 */
export type KbqPoint = Pick<DOMPointReadOnly, 'x' | 'y'>;

/**
 * A triangle described by its three vertices.
 * @docs-private
 */
export interface KbqTriangle {
    a: KbqPoint;
    b: KbqPoint;
    c: KbqPoint;
}

/**
 * Whether `point` lies within (or on the edge of) `rect`.
 * @docs-private
 */
export function isPointInRect(point: KbqPoint, rect: DOMRect): boolean {
    return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
}

/**
 * Whether `point` lies within (or on the edge of) `triangle`.
 *
 * Uses the sign of the cross product of each triangle edge with the point: the point is inside
 * only if it's consistently on the same side of all three edges.
 * @docs-private
 */
export function isPointInTriangle(point: KbqPoint, triangle: KbqTriangle): boolean {
    const { a, b, c } = triangle;

    const sign = (p1: KbqPoint, p2: KbqPoint, p3: KbqPoint): number =>
        (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);

    const d1 = sign(point, a, b);
    const d2 = sign(point, b, c);
    const d3 = sign(point, c, a);

    const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;

    return !(hasNegative && hasPositive);
}

/**
 * Builds the "safe triangle" connecting `origin` (typically the pointer position where it left a
 * trigger) to the top and bottom corners of `targetRect` (typically a submenu panel) that are nearest
 * to `origin` — the submenu can open on either side of its trigger, so the nearest edge is picked by
 * comparing distances rather than assuming a fixed side.
 * @docs-private
 */
export function getSafeTriangleVertices(origin: KbqPoint, targetRect: DOMRect): KbqTriangle {
    const nearX =
        Math.abs(targetRect.left - origin.x) <= Math.abs(targetRect.right - origin.x)
            ? targetRect.left
            : targetRect.right;

    return { a: origin, b: { x: nearX, y: targetRect.top }, c: { x: nearX, y: targetRect.bottom } };
}
