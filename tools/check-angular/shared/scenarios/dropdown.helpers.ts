import { dispatchMouseEvent, ENTER } from '@koobiq/components/core';
import { focusedElement, keydown } from './dom.helpers';

/** ENTER on a focused `<button>`: the browser turns it into a click unless the keydown was prevented. */
export function pressEnterOnButton(target: HTMLElement = focusedElement() as HTMLElement): void {
    if (!keydown(ENTER, { target }).defaultPrevented) target.click();
}

// Built natively: `createMouseEvent` of `@koobiq/components/core` neither bubbles nor can be cancelled.
function dispatchPress(target: Element, type: 'mousedown' | 'mouseup'): MouseEvent {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0 });

    target.dispatchEvent(event);

    return event;
}

/** A primary-button click: hover, press (which focuses unless prevented), release, click. */
export function clickWithMouse(element: HTMLElement): void {
    dispatchMouseEvent(element, 'mouseenter');

    if (!dispatchPress(element, 'mousedown').defaultPrevented) element.focus();

    dispatchPress(element, 'mouseup');
    element.click();
}
