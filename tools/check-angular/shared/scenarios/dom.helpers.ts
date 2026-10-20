import {
    createKeyboardEvent,
    dispatchEvent,
    DOWN_ARROW,
    END,
    ENTER,
    ESCAPE,
    HOME,
    LEFT_ARROW,
    RIGHT_ARROW,
    SLASH,
    SPACE,
    TAB,
    UP_ARROW
} from '@koobiq/components/core';

/** `KeyboardEvent.key` of the keys the suites press, by the legacy `keyCode` the library reads. */
const KEYS: Readonly<Record<number, string>> = {
    [TAB]: 'Tab',
    [ENTER]: 'Enter',
    [ESCAPE]: 'Escape',
    [SPACE]: ' ',
    [END]: 'End',
    [HOME]: 'Home',
    [LEFT_ARROW]: 'ArrowLeft',
    [UP_ARROW]: 'ArrowUp',
    [RIGHT_ARROW]: 'ArrowRight',
    [DOWN_ARROW]: 'ArrowDown',
    [SLASH]: '/'
};

export interface KeydownInit {
    /** Defaults to the focused element, where the browser delivers a key press. */
    target?: Node;
    /** Defaults to the key of the `keyCode`. */
    key?: string;
    altKey?: boolean;
    ctrlKey?: boolean;
    shiftKey?: boolean;
}

/** The element holding the focus, or the body when nothing does. */
export function focusedElement(): Element {
    return document.activeElement ?? document.body;
}

/**
 * Dispatches a `keydown` the way a browser fires it — bubbling, cancelable, with both `key` and `keyCode` — and
 * returns it, so a caller can tell whether it was prevented.
 */
export function keydown(
    keyCode: number,
    { target = focusedElement(), key = KEYS[keyCode], ...modifiers }: KeydownInit = {}
): KeyboardEvent {
    const event: KeyboardEvent = createKeyboardEvent('keydown', keyCode, undefined, key);

    // `createKeyboardEvent` sets no modifier.
    for (const [name, value] of Object.entries(modifiers)) Object.defineProperty(event, name, { get: () => value });

    return dispatchEvent(target, event) as KeyboardEvent;
}

/**
 * jsdom implements no scrolling, and the panels call `Element.scrollTo` once they render. Registers the missing method
 * for the enclosing `describe`.
 */
export function stubElementScrollTo(): void {
    let stubbed = false;

    beforeAll(() => {
        if ('scrollTo' in Element.prototype) return;

        Object.defineProperty(Element.prototype, 'scrollTo', { configurable: true, writable: true, value: () => {} });
        stubbed = true;
    });

    afterAll(() => {
        if (stubbed) delete (Element.prototype as Partial<Element>).scrollTo;
    });
}
