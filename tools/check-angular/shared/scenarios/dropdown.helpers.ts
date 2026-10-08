import { DOWN_ARROW, END, ENTER, ESCAPE, HOME, LEFT_ARROW, RIGHT_ARROW, UP_ARROW } from '@koobiq/components/core';

// Built with the native constructors: the `dispatch*Event` helpers of `@koobiq/components/core` pass the global
// `window` as `view`, which in this runner is Node's global and is rejected by jsdom — so no `view` here either.

const KEYS: Record<number, string> = {
    [DOWN_ARROW]: 'ArrowDown',
    [END]: 'End',
    [ENTER]: 'Enter',
    [ESCAPE]: 'Escape',
    [HOME]: 'Home',
    [LEFT_ARROW]: 'ArrowLeft',
    [RIGHT_ARROW]: 'ArrowRight',
    [UP_ARROW]: 'ArrowUp'
};

/** A `keydown` the way a browser fires it, carrying the legacy `keyCode` the library reads. */
export function pressKey(keyCode: number, target: Element = document.activeElement!): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key: KEYS[keyCode], bubbles: true, cancelable: true });

    Object.defineProperty(event, 'keyCode', { get: () => keyCode });
    target.dispatchEvent(event);

    return event;
}

/** ENTER on a focused `<button>`: the browser turns it into a click unless the keydown was prevented. */
export function pressEnterOnButton(target: HTMLElement = document.activeElement as HTMLElement): void {
    if (!pressKey(ENTER, target).defaultPrevented) target.click();
}

function dispatchMouse(target: Element, type: string, bubbles = true): MouseEvent {
    const event = new MouseEvent(type, { bubbles, cancelable: true, button: 0 });

    target.dispatchEvent(event);

    return event;
}

/**
 * jsdom has no `Element.scrollTo`, which the panel's scrollbar viewport calls once it has rendered; without it every
 * open logs `TypeError: el.scrollTo is not a function` through the `ErrorHandler`. Returns the restore function.
 */
export function stubElementScrollTo(): () => void {
    if ('scrollTo' in Element.prototype) return () => undefined;

    Object.defineProperty(Element.prototype, 'scrollTo', {
        configurable: true,
        writable: true,
        value: () => undefined
    });

    return () => delete (Element.prototype as Partial<Element>).scrollTo;
}

/** A primary-button click: hover, press (which focuses unless prevented), release, click. */
export function clickWithMouse(element: HTMLElement): void {
    dispatchMouse(element, 'mouseenter', false);

    if (!dispatchMouse(element, 'mousedown').defaultPrevented) element.focus();

    dispatchMouse(element, 'mouseup');
    element.click();
}
