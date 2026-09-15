import {
    kbqCreateTextRuler,
    kbqCreateWrappingTextRuler,
    kbqMeasureRulerText,
    kbqMeasureRulerTextOffset
} from './text-ruler';

/**
 * Rectangle occupied by a text insertion point or a text selection, in viewport coordinates.
 *
 * Shaped after the virtual origin a CDK `FlexibleConnectedPositionStrategy` accepts, so it can be handed to
 * `setOrigin()` as it is and every placement, offset and fallback keeps working against it.
 */
export interface KbqCaretRect {
    /** Distance from the left edge of the viewport, in pixels. */
    x: number;
    /** Distance from the top edge of the viewport, in pixels. */
    y: number;
    /** Width of the selection, or `0` for a collapsed caret. */
    width: number;
    /** Height of one line of text in the field. */
    height: number;
}

/** Anything the caret helpers can measure: a text field, or an element the user edits directly. */
export type KbqTextAnchor = HTMLInputElement | HTMLTextAreaElement | HTMLElement;

/** Fields that render something other than their value, so measuring the value tells nothing. */
const OPAQUE_INPUT_TYPES = ['password', 'color', 'file', 'image', 'range'];

const isTextArea = (element: KbqTextAnchor): element is HTMLTextAreaElement => element.tagName === 'TEXTAREA';

const isInput = (element: KbqTextAnchor): element is HTMLInputElement => element.tagName === 'INPUT';

/**
 * Rectangle of the caret in `element`, in viewport coordinates, or `null` when there is nothing to measure —
 * the element holds no selection, or it is detached from a rendered document.
 *
 * Falls back to the element's own box for fields whose rendered text is not their value (`password` and
 * friends) and for right-to-left text, where the visual order of a bidi line is not a prefix of the value.
 * The result is always clamped to the field's visible box, so a caret scrolled out of view keeps whatever is
 * anchored to it next to the field instead of sending it off screen.
 */
export const kbqGetCaretRect = (element: KbqTextAnchor): KbqCaretRect | null => {
    return measure(element, true);
};

/**
 * Rectangle of the text selected in `element`, in viewport coordinates, collapsing to the caret rectangle
 * when nothing is selected.
 *
 * @see {@link kbqGetCaretRect}
 */
export const kbqGetSelectionRect = (element: KbqTextAnchor): KbqCaretRect | null => {
    return measure(element, false);
};

const measure = (element: KbqTextAnchor, collapse: boolean): KbqCaretRect | null => {
    const document = element.ownerDocument;
    const window = document.defaultView;

    if (!window) return null;

    const computedStyle = window.getComputedStyle(element);
    const box = element.getBoundingClientRect();

    if (isInput(element) || isTextArea(element)) {
        const { selectionStart, selectionEnd } = element;

        // A field that reports no selection has never been focused, and there is no position to anchor to.
        if (selectionStart === null || selectionEnd === null) return null;

        const start = selectionStart;
        const end = collapse ? selectionStart : selectionEnd;

        if (computedStyle.direction === 'rtl' || (isInput(element) && OPAQUE_INPUT_TYPES.includes(element.type))) {
            return fieldRect(box);
        }

        const rect = isTextArea(element)
            ? measureTextArea(element, computedStyle, box, start, end)
            : measureInput(element, computedStyle, box, start, end);

        return clampToField(rect, element, computedStyle, box);
    }

    return measureSelection(element, window, box, collapse);
};

/** The element's own box, used wherever the caret inside it cannot be located. */
const fieldRect = ({ left, top, width, height }: DOMRect): KbqCaretRect => ({ x: left, y: top, width, height });

const measureInput = (
    element: HTMLInputElement,
    computedStyle: CSSStyleDeclaration,
    box: DOMRect,
    start: number,
    end: number
): KbqCaretRect => {
    const document = element.ownerDocument;
    const { value, scrollLeft } = element;
    const lineHeight = resolveLineHeight(computedStyle);
    const inset = numeric(computedStyle.borderLeftWidth) + numeric(computedStyle.paddingLeft);
    const ruler = kbqCreateTextRuler(document, computedStyle);

    document.body.appendChild(ruler);

    const startOffset = kbqMeasureRulerText(ruler, value.slice(0, start));
    // A caret is the common case on the typing path, and measuring it twice costs a second layout.
    const endOffset = end === start ? startOffset : kbqMeasureRulerText(ruler, value.slice(0, end));

    ruler.remove();

    return {
        x: box.left + inset + startOffset - scrollLeft,
        // An input renders its single line vertically centred in the content box, wherever the box ends up.
        y: box.top + (box.height - lineHeight) / 2,
        width: endOffset - startOffset,
        height: lineHeight
    };
};

const measureTextArea = (
    element: HTMLTextAreaElement,
    computedStyle: CSSStyleDeclaration,
    box: DOMRect,
    start: number,
    end: number
): KbqCaretRect => {
    const document = element.ownerDocument;
    const { value, scrollLeft, scrollTop, clientWidth } = element;
    const lineHeight = resolveLineHeight(computedStyle);
    const contentWidth = clientWidth - numeric(computedStyle.paddingLeft) - numeric(computedStyle.paddingRight);
    const ruler = kbqCreateWrappingTextRuler(document, computedStyle, contentWidth);

    document.body.appendChild(ruler);

    const startOffset = kbqMeasureRulerTextOffset(ruler, value.slice(0, start));
    const endOffset = end === start ? startOffset : kbqMeasureRulerTextOffset(ruler, value.slice(0, end));

    ruler.remove();

    const x = box.left + numeric(computedStyle.borderLeftWidth) + startOffset.left - scrollLeft;
    const y = box.top + numeric(computedStyle.borderTopWidth) + startOffset.top - scrollTop;

    return {
        x,
        y,
        // A selection spanning several lines has no single rectangle; the caret line is the half worth
        // anchoring to, so the width collapses as soon as the selection wraps.
        width: endOffset.top === startOffset.top ? endOffset.left - startOffset.left : 0,
        height: lineHeight
    };
};

/**
 * Rectangle of the document selection inside `element` — the branch that serves `contenteditable`, where the
 * browser lays the text out and the range can be measured directly.
 */
const measureSelection = (
    element: HTMLElement,
    window: Window,
    box: DOMRect,
    collapse: boolean
): KbqCaretRect | null => {
    const selection = window.getSelection();

    if (!selection?.rangeCount) return null;

    const range = selection.getRangeAt(0);

    if (!element.contains(range.commonAncestorContainer)) return null;

    const measured = range.cloneRange();

    if (collapse) {
        measured.collapse(true);
    }

    // A collapsed range, and a range whose only content is a line break, are laid out without a box of their
    // own. The first client rect of the uncollapsed range still carries the line, and the element's own box
    // is the last resort.
    const rect = nonEmptyRect(measured.getBoundingClientRect()) ?? nonEmptyRect(range.getClientRects()[0]);

    if (!rect) return fieldRect(box);

    return { x: rect.left, y: rect.top, width: collapse ? 0 : rect.width, height: rect.height };
};

const nonEmptyRect = (rect: DOMRect | undefined): DOMRect | null => (rect && rect.height > 0 ? rect : null);

/**
 * Pulls the caret rectangle back into the part of the field the user can see.
 *
 * A caret scrolled out of a field is still a valid position, and anchoring to it would push a pop-up away
 * from the control it belongs to — or off screen entirely for a long value.
 */
const clampToField = (
    rect: KbqCaretRect,
    element: HTMLInputElement | HTMLTextAreaElement,
    computedStyle: CSSStyleDeclaration,
    box: DOMRect
): KbqCaretRect => {
    const left = box.left + numeric(computedStyle.borderLeftWidth);
    const top = box.top + numeric(computedStyle.borderTopWidth);
    const right = left + element.clientWidth;
    const bottom = top + element.clientHeight;

    const x = clamp(rect.x, left, right);

    return {
        x,
        y: clamp(rect.y, top, Math.max(bottom - rect.height, top)),
        width: Math.max(Math.min(rect.x + rect.width, right) - x, 0),
        height: rect.height
    };
};

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const numeric = (value: string): number => parseFloat(value) || 0;

/**
 * Height of one line of text in the field.
 *
 * `line-height: normal` computes to the keyword rather than to a length in every browser but Firefox, and
 * the font size is the closest stand-in available without laying a line out.
 */
const resolveLineHeight = (computedStyle: CSSStyleDeclaration): number =>
    numeric(computedStyle.lineHeight) || numeric(computedStyle.fontSize);
