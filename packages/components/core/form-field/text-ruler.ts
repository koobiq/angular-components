/**
 * Properties that affect the rendered width of the text and have to be mirrored onto the ruler.
 *
 * `font-variant` is deliberately absent: the shorthand does not round-trip through the computed style
 * once a field sets more than one of its longhands, so the longhands are copied instead.
 */
export const RULER_INHERITED_PROPERTIES = [
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
 * Properties that decide where a soft wrap falls and where the wrapped text sits, mirrored onto a wrapping
 * ruler on top of {@link RULER_INHERITED_PROPERTIES}.
 *
 * Padding is part of the list twice over: it shifts the text inside the box, and the offsets read back from
 * the ruler are measured from its padding edge, so a ruler without it reports the wrong first line.
 */
export const WRAPPING_RULER_INHERITED_PROPERTIES = [
    'direction',
    'hyphens',
    'lineHeight',
    'overflowWrap',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'tabSize',
    'textAlign',
    'whiteSpace',
    'wordBreak',
    'wordSpacing'
] as const satisfies Array<keyof CSSStyleDeclaration>;

const WRAPPING_RULER_PROPERTIES = {
    all: 'initial',
    position: 'absolute',
    top: '0px',
    left: '0px',
    // The content width is supplied by the caller, so the border box the field was laid out in never has to
    // be reconstructed from `box-sizing` and the border widths.
    boxSizing: 'content-box',
    visibility: 'hidden',
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
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

/**
 * Builds a hidden element that lays text out the way a soft-wrapping field of `contentWidth` pixels does,
 * with the typography and box metrics of the element `computedStyle` was taken from. Append it to the
 * document, measure through {@link kbqMeasureRulerTextOffset}, and remove it.
 *
 * `contentWidth` is the field's content box — `clientWidth` minus its horizontal padding — rather than the
 * computed `width`, which disagrees with it as soon as the field shows a scrollbar.
 *
 * @docs-private
 */
export const kbqCreateWrappingTextRuler = (
    document: Document,
    computedStyle: CSSStyleDeclaration,
    contentWidth: number
): HTMLDivElement => {
    const ruler: HTMLDivElement = document.createElement('div');

    Object.assign(ruler.style, WRAPPING_RULER_PROPERTIES);
    [...RULER_INHERITED_PROPERTIES, ...WRAPPING_RULER_INHERITED_PROPERTIES].forEach((property) => {
        ruler.style[property] = computedStyle[property];
    });
    ruler.style.width = `${contentWidth}px`;

    return ruler;
};

/**
 * Offset of the position right after `text`, in pixels from the ruler's padding edge — the same origin the
 * field's own `scrollLeft` and `scrollTop` are measured from.
 *
 * `rest` is laid out after the position without a break opportunity before it, so that a word the field wraps as
 * a whole takes the position along to the next row. The marker carries a word joiner, which also gives it a line
 * box after a trailing newline.
 *
 * @docs-private
 */
export const kbqMeasureRulerTextOffset = (
    ruler: HTMLDivElement,
    text: string,
    rest: string = ''
): { left: number; top: number } => {
    const marker = ruler.ownerDocument.createElement('span');

    marker.textContent = '\u2060';

    ruler.textContent = text;
    ruler.append(marker, rest);

    const { offsetLeft: left, offsetTop: top } = marker;

    ruler.textContent = '';

    return { left, top };
};
