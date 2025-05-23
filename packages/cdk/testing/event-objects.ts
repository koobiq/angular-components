/** Creates a browser MouseEvent with the specified options. */
export function createMouseEvent(type: string, x = 0, y = 0, button = 0) {
    const event = document.createEvent('MouseEvent');

    event.initMouseEvent(
        type,
        false,
        false,
        window /* view */,
        0,
        x /* screenX */,
        y /* screenY */,
        x /* clientX */,
        y /* clientY */,
        false,
        false,
        false,
        false,
        button /* button */,
        null
    );

    return event;
}

/** Creates a browser TouchEvent with the specified pointer coordinates. */
export function createTouchEvent(type: string, pageX = 0, pageY = 0) {
    // In favor of creating events that work for most of the browsers, the event is created
    // as a basic UI Event. The necessary details for the event will be set manually.
    const event = document.createEvent('UIEvent');
    const touchDetails = { pageX, pageY };

    (event as any).initUIEvent(type, true, true, window, 0);

    // Most of the browsers don't have a "initTouchEvent" method that can be used to define
    // the touch details.
    Object.defineProperties(event, {
        touches: { value: [touchDetails] }
    });

    return event;
}

/** Dispatches a keydown event from an element. */
export function createKeyboardEvent(type: string, keyCode: number, target?: Element, key?: string) {
    const event = document.createEvent('KeyboardEvent') as any;

    // Firefox does not support `initKeyboardEvent`, but supports `initKeyEvent`.
    if (event.initKeyEvent) {
        event.initKeyEvent(type, true, true, window, 0, 0, 0, 0, 0, keyCode);
    } else {
        event.initKeyboardEvent(type, true, true, window, 0, key, 0, '', false);
    }

    // Webkit Browsers don't set the keyCode when calling the init function.
    // See related bug https://bugs.webkit.org/show_bug.cgi?id=16735
    Object.defineProperties(event, {
        keyCode: { get: () => keyCode },
        key: { get: () => key },
        target: { get: () => target }
    });

    return event;
}

/** Creates a fake event object with any desired event type. */
export function createFakeEvent(type: string, canBubble = false, cancelable = true) {
    const event = document.createEvent('Event');

    event.initEvent(type, canBubble, cancelable);

    return event;
}
