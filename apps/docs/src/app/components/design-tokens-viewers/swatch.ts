/**
 * Paints a colour token over a checkerboard, so a translucent value reads as translucent instead of
 * as a lighter opaque one.
 *
 * Most of the palette is alpha ramps, so this is the default way to draw a swatch here, not a
 * special case. Shared by the token tables, the semantic ramps and the colour picker.
 */
export const docsSwatchStyle = (token: string): string => [
        `linear-gradient(var(${token}), var(${token}))`,
        'repeating-conic-gradient(var(--kbq-background-bg-tertiary) 0% 25%, var(--kbq-background-bg) 0% 50%) 0 / 8px 8px'
    ].join(', ');
