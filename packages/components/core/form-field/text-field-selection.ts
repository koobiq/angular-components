/**
 * Properties that affect the rendered width of the text and have to be mirrored onto the ruler.
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
    'fontVariant',
    'fontVariationSettings',
    'fontWeight',
    'letterSpacing',
    'textTransform'
] as const satisfies Array<keyof CSSStyleDeclaration>;

const RULER_PROPERTIES = {
    all: 'initial',
    position: 'absolute',
    top: '0',
    left: '0',
    visibility: 'hidden',
    whiteSpace: 'pre',
    pointerEvents: 'none'
} as const satisfies Partial<CSSStyleDeclaration>;

const createRuler = (document: Document, computedStyle: CSSStyleDeclaration): HTMLSpanElement => {
    const ruler: HTMLSpanElement = document.createElement('span');

    Object.assign(ruler.style, RULER_PROPERTIES);
    RULER_INHERITED_PROPERTIES.forEach((property) => {
        ruler.style[property] = computedStyle[property];
    });

    return ruler;
};

const measureWith = (ruler: HTMLSpanElement, text: string): number => {
    ruler.textContent = text;

    return ruler.getBoundingClientRect().width;
};

/**
 * Scrolls a text field horizontally so that its current selection is visible.
 *
 * Browsers scroll a field to the caret only for edits the user makes: a selection set from script leaves
 * the field at whatever offset the last keystroke produced. A masked field re-renders its value and moves
 * the caret between value parts on every keystroke, so without this the field keeps the offset of the part
 * that was edited before and clips the one being edited now.
 */
export const kbqRevealSelection = (element: HTMLInputElement): void => {
    const maxScrollLeft = element.scrollWidth - element.clientWidth;

    // The value fits, so any offset the field is left at is an artifact of an earlier, longer value.
    if (maxScrollLeft <= 0) {
        element.scrollLeft = 0;

        return;
    }

    const document = element.ownerDocument;
    const window = document.defaultView;

    if (!window) {
        return;
    }

    const { value, selectionStart, selectionEnd, clientWidth } = element;
    const computedStyle = window.getComputedStyle(element);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
    const ruler = createRuler(document, computedStyle);

    document.body.appendChild(ruler);

    // `scrollLeft` is measured from the start of the padding box, the text starts one `padding-left` in.
    const start = paddingLeft + measureWith(ruler, value.slice(0, selectionStart ?? 0));
    const end = paddingLeft + measureWith(ruler, value.slice(0, selectionEnd ?? 0));

    ruler.remove();

    // The smallest offset that still shows the selection, so that as much as possible of what precedes it
    // stays on screen. Deriving the offset from the selection alone, instead of nudging the current one,
    // keeps the result independent of where the last keystroke happened to leave the field.
    const minimumRevealingEnd = Math.max(end + paddingRight - clientWidth, 0);
    // A selection wider than the field cannot be shown whole; its start is the half worth keeping.
    const maximumKeepingStart = Math.max(start - paddingLeft, 0);

    element.scrollLeft = Math.min(minimumRevealingEnd, maximumKeepingStart, maxScrollLeft);
};

/**
 * Selects the `[start, end]` range of a text field and keeps it visible.
 *
 * @see {@link kbqRevealSelection}
 */
export const kbqSetSelectionRange = (element: HTMLInputElement, start: number, end: number): void => {
    element.setSelectionRange(start, end);

    kbqRevealSelection(element);
};
