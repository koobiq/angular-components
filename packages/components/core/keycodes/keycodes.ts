import {
    A,
    ALT,
    BACKSPACE,
    C,
    CONTROL,
    DELETE,
    DOWN_ARROW,
    EIGHT,
    END,
    F1,
    F12,
    FIVE,
    FOUR,
    hasModifierKey as cdkHasModifierKey,
    HOME,
    LEFT_ARROW,
    NINE,
    NUMPAD_NINE,
    NUMPAD_ZERO,
    ONE,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    SEVEN,
    SHIFT,
    SIX,
    THREE,
    TWO,
    UP_ARROW,
    Z,
    ZERO
} from '@angular/cdk/keycodes';
import { _getEventTarget } from '@angular/cdk/platform';

/**
 * Keycode constants re-exported from `@angular/cdk/keycodes` for compatibility.
 *
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 */
export {
    A,
    ALT,
    APOSTROPHE,
    AT_SIGN,
    B,
    BACKSLASH,
    BACKSPACE,
    C,
    CAPS_LOCK,
    CLOSE_SQUARE_BRACKET,
    COMMA,
    CONTEXT_MENU,
    CONTROL,
    D,
    DASH,
    DELETE,
    DOWN_ARROW,
    E,
    EIGHT,
    END,
    ENTER,
    EQUALS,
    ESCAPE,
    F,
    F1,
    F2,
    F3,
    F4,
    F5,
    F6,
    F7,
    F8,
    F9,
    F10,
    F11,
    F12,
    FF_EQUALS,
    FF_MINUS,
    FF_MUTE,
    FF_SEMICOLON,
    FF_VOLUME_DOWN,
    FF_VOLUME_UP,
    FIRST_MEDIA,
    FIVE,
    FOUR,
    G,
    H,
    HOME,
    I,
    INSERT,
    J,
    K,
    L,
    LAST_MEDIA,
    LEFT_ARROW,
    M,
    MAC_ENTER,
    MAC_META,
    MAC_WK_CMD_LEFT,
    MAC_WK_CMD_RIGHT,
    META,
    MUTE,
    N,
    NINE,
    NUM_CENTER,
    NUM_LOCK,
    NUMPAD_DIVIDE,
    NUMPAD_EIGHT,
    NUMPAD_FIVE,
    NUMPAD_FOUR,
    NUMPAD_MINUS,
    NUMPAD_MULTIPLY,
    NUMPAD_NINE,
    NUMPAD_ONE,
    NUMPAD_PERIOD,
    NUMPAD_PLUS,
    NUMPAD_SEVEN,
    NUMPAD_SIX,
    NUMPAD_THREE,
    NUMPAD_TWO,
    NUMPAD_ZERO,
    O,
    ONE,
    OPEN_SQUARE_BRACKET,
    P,
    PAGE_DOWN,
    PAGE_UP,
    PAUSE,
    PERIOD,
    PLUS_SIGN,
    PRINT_SCREEN,
    Q,
    QUESTION_MARK,
    R,
    RIGHT_ARROW,
    S,
    SCROLL_LOCK,
    SEMICOLON,
    SEVEN,
    SHIFT,
    SINGLE_QUOTE,
    SIX,
    SLASH,
    SPACE,
    T,
    TAB,
    THREE,
    TILDE,
    TWO,
    U,
    UP_ARROW,
    V,
    VOLUME_DOWN,
    VOLUME_UP,
    W,
    X,
    Y,
    Z,
    ZERO
} from '@angular/cdk/keycodes';

type ModifierKey = 'altKey' | 'shiftKey' | 'ctrlKey' | 'metaKey';

/** @docs-private */
export function hasModifierKey(event: KeyboardEvent | MouseEvent, ...modifiers: ModifierKey[]): boolean {
    // The cast is safe: both event types carry the same modifier properties the check reads.
    return cdkHasModifierKey(event as unknown as KeyboardEvent, ...modifiers);
}

/** @docs-private */
export function isControl(event: KeyboardEvent): boolean {
    const keyCode = event.keyCode;

    switch (keyCode) {
        case SHIFT:
        case CONTROL:
        case ALT:
            return true;
        default:
            return event.metaKey;
    }
}

/** @docs-private */
export function isNumberKey({ keyCode }: KeyboardEvent): boolean {
    return keyCode >= ZERO && keyCode <= NINE;
}

/** @docs-private */
export function isNumpadKey({ keyCode }: KeyboardEvent): boolean {
    return keyCode >= NUMPAD_ZERO && keyCode <= NUMPAD_NINE;
}
/** @docs-private */
export function isLetterKey({ keyCode }: KeyboardEvent): boolean {
    return keyCode >= A && keyCode <= Z;
}

/** @docs-private */
export function isFunctionKey({ keyCode }: KeyboardEvent): boolean {
    return keyCode >= F1 && keyCode <= F12;
}

/** @docs-private */
export function isVerticalMovement({ keyCode }: KeyboardEvent): boolean {
    return [UP_ARROW, DOWN_ARROW, PAGE_DOWN, PAGE_UP, HOME, END].includes(keyCode);
}

/** @docs-private */
export function isHorizontalMovement({ keyCode }: KeyboardEvent): boolean {
    return [LEFT_ARROW, RIGHT_ARROW, BACKSPACE, DELETE].includes(keyCode);
}

/** @docs-private */
export function isSelectAll(event: KeyboardEvent): boolean {
    return (event.ctrlKey || event.metaKey) && event.keyCode === A;
}

/** @docs-private */
export function isCopy(event: KeyboardEvent): boolean {
    return (event.ctrlKey || event.metaKey) && event.keyCode === C;
}

/** @docs-private */
export function isInput(event: Event): boolean {
    const target = _getEventTarget<HTMLElement>(event);

    return !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
}

/** @docs-private */
export function isLeftBracket(event: KeyboardEvent): boolean {
    return event.code === 'BracketLeft';
}

/** @docs-private */
export function isRightBracket(event: KeyboardEvent): boolean {
    return event.code === 'BracketRight';
}

/**
 * @deprecated Use {@link isNumberKey}, which checks the same keys. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export function isDigit({ keyCode }: KeyboardEvent): boolean {
    return [ZERO, ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE].includes(keyCode);
}
