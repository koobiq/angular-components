import { _getEventTarget } from '@angular/cdk/platform';

/** @docs-private */
export const MAC_ENTER = 3;
/** @docs-private */
export const BACKSPACE = 8;
/** @docs-private */
export const TAB = 9;
/** @docs-private */
export const NUM_CENTER = 12;
/** @docs-private */
export const ENTER = 13;
/** @docs-private */
export const SHIFT = 16;
/** @docs-private */
export const CONTROL = 17;
/** @docs-private */
export const ALT = 18;
/** @docs-private */
export const PAUSE = 19;
/** @docs-private */
export const CAPS_LOCK = 20;
/** @docs-private */
export const ESCAPE = 27;
/** @docs-private */
export const SPACE = 32;
/** @docs-private */
export const PAGE_UP = 33;
/** @docs-private */
export const PAGE_DOWN = 34;
/** @docs-private */
export const END = 35;
/** @docs-private */
export const HOME = 36;
/** @docs-private */
export const LEFT_ARROW = 37;
/** @docs-private */
export const UP_ARROW = 38;
/** @docs-private */
export const RIGHT_ARROW = 39;
/** @docs-private */
export const DOWN_ARROW = 40;
/** @docs-private */
export const PLUS_SIGN = 43;
/** @docs-private */
export const PRINT_SCREEN = 44;
/** @docs-private */
export const INSERT = 45;
/** @docs-private */
export const DELETE = 46;
/** @docs-private */
export const ZERO = 48;
/** @docs-private */
export const ONE = 49;
/** @docs-private */
export const TWO = 50;
/** @docs-private */
export const THREE = 51;
/** @docs-private */
export const FOUR = 52;
/** @docs-private */
export const FIVE = 53;
/** @docs-private */
export const SIX = 54;
/** @docs-private */
export const SEVEN = 55;
/** @docs-private */
export const EIGHT = 56;
/** @docs-private */
export const NINE = 57;
/** @docs-private */
export const FF_SEMICOLON = 59; // Firefox (Gecko) fires this for semicolon instead of 186
/** @docs-private */
export const FF_EQUALS = 61; // Firefox (Gecko) fires this for equals instead of 187
/** @docs-private */
export const QUESTION_MARK = 63;
/** @docs-private */
export const AT_SIGN = 64;
/** @docs-private */
export const A = 65;
/** @docs-private */
export const B = 66;
/** @docs-private */
export const C = 67;
/** @docs-private */
export const D = 68;
/** @docs-private */
export const E = 69;
/** @docs-private */
export const F = 70;
/** @docs-private */
export const G = 71;
/** @docs-private */
export const H = 72;
/** @docs-private */
export const I = 73;
/** @docs-private */
export const J = 74;
/** @docs-private */
export const K = 75;
/** @docs-private */
export const L = 76;
/** @docs-private */
export const M = 77;
/** @docs-private */
export const N = 78;
/** @docs-private */
export const O = 79;
/** @docs-private */
export const P = 80;
/** @docs-private */
export const Q = 81;
/** @docs-private */
export const R = 82;
/** @docs-private */
export const S = 83;
/** @docs-private */
export const T = 84;
/** @docs-private */
export const U = 85;
/** @docs-private */
export const V = 86;
/** @docs-private */
export const W = 87;
/** @docs-private */
export const X = 88;
/** @docs-private */
export const Y = 89;
/** @docs-private */
export const Z = 90;
/** @docs-private */
export const META = 91; // WIN_KEY_LEFT
/** @docs-private */
export const MAC_WK_CMD_LEFT = 91;
/** @docs-private */
export const MAC_WK_CMD_RIGHT = 93;
/** @docs-private */
export const CONTEXT_MENU = 93;
/** @docs-private */
export const NUMPAD_ZERO = 96;
/** @docs-private */
export const NUMPAD_ONE = 97;
/** @docs-private */
export const NUMPAD_TWO = 98;
/** @docs-private */
export const NUMPAD_THREE = 99;
/** @docs-private */
export const NUMPAD_FOUR = 100;
/** @docs-private */
export const NUMPAD_FIVE = 101;
/** @docs-private */
export const NUMPAD_SIX = 102;
/** @docs-private */
export const NUMPAD_SEVEN = 103;
/** @docs-private */
export const NUMPAD_EIGHT = 104;
/** @docs-private */
export const NUMPAD_NINE = 105;
/** @docs-private */
export const NUMPAD_MULTIPLY = 106;
/** @docs-private */
export const NUMPAD_PLUS = 107;
/** @docs-private */
export const NUMPAD_MINUS = 109;
/** @docs-private */
export const NUMPAD_PERIOD = 110;
/** @docs-private */
export const NUMPAD_DIVIDE = 111;
/** @docs-private */
export const F1 = 112;
/** @docs-private */
export const F2 = 113;
/** @docs-private */
export const F3 = 114;
/** @docs-private */
export const F4 = 115;
/** @docs-private */
export const F5 = 116;
/** @docs-private */
export const F6 = 117;
/** @docs-private */
export const F7 = 118;
/** @docs-private */
export const F8 = 119;
/** @docs-private */
export const F9 = 120;
/** @docs-private */
export const F10 = 121;
/** @docs-private */
export const F11 = 122;
/** @docs-private */
export const F12 = 123;
/** @docs-private */
export const NUM_LOCK = 144;
/** @docs-private */
export const SCROLL_LOCK = 145;
/** @docs-private */
export const FIRST_MEDIA = 166;
/** @docs-private */
export const FF_MINUS = 173;
/** @docs-private */
export const MUTE = 173; // Firefox (Gecko) fires 181 for MUTE
/** @docs-private */
export const VOLUME_DOWN = 174; // Firefox (Gecko) fires 182 for VOLUME_DOWN
/** @docs-private */
export const VOLUME_UP = 175; // Firefox (Gecko) fires 183 for VOLUME_UP
/** @docs-private */
export const FF_MUTE = 181;
/** @docs-private */
export const FF_VOLUME_DOWN = 182;
/** @docs-private */
export const LAST_MEDIA = 183;
/** @docs-private */
export const FF_VOLUME_UP = 183;
/** @docs-private */
export const SEMICOLON = 186; // Firefox (Gecko) fires 59 for SEMICOLON
/** @docs-private */
export const EQUALS = 187; // Firefox (Gecko) fires 61 for EQUALS
/** @docs-private */
export const COMMA = 188;
/** @docs-private */
export const DASH = 189; // Firefox (Gecko) fires 173 for DASH/MINUS
/** @docs-private */
export const PERIOD = 190;
/** @docs-private */
export const SLASH = 191;
/** @docs-private */
export const APOSTROPHE = 192;
/** @docs-private */
export const TILDE = 192;
/** @docs-private */
export const OPEN_SQUARE_BRACKET = 219;
/** @docs-private */
export const BACKSLASH = 220;
/** @docs-private */
export const CLOSE_SQUARE_BRACKET = 221;
/** @docs-private */
export const SINGLE_QUOTE = 222;
/** @docs-private */
export const MAC_META = 224;

type ModifierKey = 'altKey' | 'shiftKey' | 'ctrlKey' | 'metaKey';

/** @docs-private */
export function hasModifierKey(event: KeyboardEvent | MouseEvent, ...modifiers: ModifierKey[]): boolean {
    if (modifiers.length) {
        return modifiers.some((modifier) => event[modifier]);
    }

    return event.altKey || event.shiftKey || event.ctrlKey || event.metaKey;
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
