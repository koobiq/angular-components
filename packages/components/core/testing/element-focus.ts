import { dispatchFakeEvent } from './dispatch-events';

/**
 * Patches an element's focus and blur methods to emit events consistently and predictably:
 * a browser does not fire the focus handlers at all while its window is not focused.
 */
export function patchElementFocus(element: HTMLElement) {
    element.focus = () => dispatchFakeEvent(element, 'focus');
    element.blur = () => dispatchFakeEvent(element, 'blur');
}
