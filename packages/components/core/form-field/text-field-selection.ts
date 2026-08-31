import { kbqCreateTextRuler, kbqMeasureRulerText } from './text-ruler';

/**
 * Scrolls a text field horizontally so that its current selection is visible.
 *
 * Browsers scroll a field to the caret only for edits the user makes: a selection set from script leaves
 * the field at whatever offset the last keystroke produced. A masked field re-renders its value and moves
 * the caret between value parts on every keystroke, so without this the field keeps the offset of the part
 * that was edited before and clips the one being edited now.
 *
 * Leaves the field alone when it is not focused, when it renders something other than its value, and in
 * right-to-left text, where the browser's own caret following is already correct.
 */
export const kbqRevealSelection = (element: HTMLInputElement): void => {
    const document = element.ownerDocument;
    const window = document.defaultView;

    // A field the user has left is the browser's to scroll: it resets the offset on blur, and a write
    // landing after that would park the field mid-value until it is focused again.
    if (!window || document.activeElement !== element) {
        return;
    }

    // A password field renders bullets, which are not the widths of the characters behind them.
    if (element.type === 'password') {
        return;
    }

    const maxScrollLeft = element.scrollWidth - element.clientWidth;

    // The value fits, so any offset the field is left at is an artifact of an earlier, longer value.
    if (maxScrollLeft <= 0) {
        element.scrollLeft = 0;

        return;
    }

    const computedStyle = window.getComputedStyle(element);

    // Every offset below is measured from the left edge, while an RTL field scrolls into negative
    // `scrollLeft`. Mirroring that needs the visual order of a bidi line rather than a prefix of the
    // value, so the browser's own caret following is left in place instead of being overwritten.
    if (computedStyle.direction === 'rtl') {
        return;
    }

    const { value, selectionStart, selectionEnd, clientWidth } = element;
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
    const ruler = kbqCreateTextRuler(document, computedStyle);

    document.body.appendChild(ruler);

    // `scrollLeft` is measured from the start of the padding box, the text starts one `padding-left` in.
    const start = paddingLeft + kbqMeasureRulerText(ruler, value.slice(0, selectionStart ?? 0));
    // A caret is the common case on the typing path, and measuring it twice costs a second layout.
    const end =
        selectionEnd === selectionStart
            ? start
            : paddingLeft + kbqMeasureRulerText(ruler, value.slice(0, selectionEnd ?? 0));

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
