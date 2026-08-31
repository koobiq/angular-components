/**
 * Properties that affect the rendered width of the text and have to be mirrored onto the ruler.
 *
 * `font-variant` is deliberately absent: the shorthand does not round-trip through the computed style
 * once a field sets more than one of its longhands, so the longhands are copied instead.
 */
const RULER_INHERITED_PROPERTIES = [
    'font',
    'fontFamily',
    'fontFeatureSettings',
    'fontKerning',
    'fontOpticalSizing',
    'fontSize',
    'fontSizeAdjust',
    'fontStretch',
    'fontStyle',
    'fontSynthesis',
    'fontVariantCaps',
    'fontVariantEastAsian',
    'fontVariantLigatures',
    'fontVariantNumeric',
    'fontVariationSettings',
    'fontWeight',
    'letterSpacing',
    'textIndent',
    'textTransform'
] as const satisfies Array<keyof CSSStyleDeclaration>;

const RULER_PROPERTIES = {
    all: 'initial',
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: '0px',
    height: '0px',
    visibility: 'hidden',
    overflow: 'scroll',
    whiteSpace: 'pre',
    pointerEvents: 'none'
} as const satisfies Partial<CSSStyleDeclaration>;

/**
 * Builds a hidden element that renders text with the typography of the element `computedStyle` was taken
 * from. Append it to the document, measure through {@link kbqMeasureRulerText}, and remove it.
 *
 * @docs-private
 */
export const kbqCreateTextRuler = (document: Document, computedStyle: CSSStyleDeclaration): HTMLSpanElement => {
    const ruler: HTMLSpanElement = document.createElement('span');

    Object.assign(ruler.style, RULER_PROPERTIES);
    RULER_INHERITED_PROPERTIES.forEach((property) => {
        ruler.style[property] = computedStyle[property];
    });

    return ruler;
};

/**
 * Width of `text` in pixels, in the same coordinate space as `clientWidth` and `scrollLeft`.
 *
 * `scrollWidth`, not `getBoundingClientRect()`: the latter reports the transformed box, which disagrees
 * with the untransformed layout metrics it would be compared against under a scaled ancestor.
 *
 * @docs-private
 */
export const kbqMeasureRulerText = (ruler: HTMLSpanElement, text: string): number => {
    ruler.textContent = text;

    return ruler.scrollWidth;
};
