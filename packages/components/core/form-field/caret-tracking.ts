import { Renderer2 } from '@angular/core';

/**
 * Events after which the caret of a text field may stand somewhere else.
 *
 * `scroll` is one of them because a field scrolls its own text without any ancestor scrolling, so neither the
 * `ScrollDispatcher` nor an overlay scroll strategy ever hears about it.
 */
const CARET_MOVE_EVENTS = ['input', 'keyup', 'click', 'select', 'scroll'] as const;

/**
 * Calls `callback` whenever the caret of `element` may have moved — the user typed, moved the caret, selected
 * text or scrolled the field — and returns the function that stops listening.
 *
 * The listeners are bound in the zone the caller runs it in.
 */
export const kbqListenForCaretMoves = (
    renderer: Renderer2,
    element: HTMLElement,
    callback: () => void
): (() => void) => {
    const unbinders = CARET_MOVE_EVENTS.map((name) => renderer.listen(element, name, callback));

    return () => unbinders.forEach((unbind) => unbind());
};
