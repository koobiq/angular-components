import { _getEventTarget } from '@angular/cdk/platform';

export const MAC_ENTER = 3;
export const BACKSPACE = 8;
export const TAB = 9;
export const NUM_CENTER = 12;
export const ENTER = 13;
export const SHIFT = 16;
export const CONTROL = 17;
export const ALT = 18;
export const PAUSE = 19;
export const CAPS_LOCK = 20;
export const ESCAPE = 27;
export const SPACE = 32;
export const PAGE_UP = 33;
export const PAGE_DOWN = 34;
export const END = 35;
export const HOME = 36;
export const LEFT_ARROW = 37;
export const UP_ARROW = 38;
export const RIGHT_ARROW = 39;
export const DOWN_ARROW = 40;
export const PLUS_SIGN = 43;
export const PRINT_SCREEN = 44;
export const INSERT = 45;
export const DELETE = 46;
export const ZERO = 48;
export const ONE = 49;
export const TWO = 50;
export const THREE = 51;
export const FOUR = 52;
export const FIVE = 53;
export const SIX = 54;
export const SEVEN = 55;
export const EIGHT = 56;
export const NINE = 57;
export const FF_SEMICOLON = 59; // Firefox (Gecko) fires this for semicolon instead of 186
export const FF_EQUALS = 61; // Firefox (Gecko) fires this for equals instead of 187
export const QUESTION_MARK = 63;
export const AT_SIGN = 64;
export const A = 65;
export const B = 66;
export const C = 67;
export const D = 68;
export const E = 69;
export const F = 70;
export const G = 71;
export const H = 72;
export const I = 73;
export const J = 74;
export const K = 75;
export const L = 76;
export const M = 77;
export const N = 78;
export const O = 79;
export const P = 80;
export const Q = 81;
export const R = 82;
export const S = 83;
export const T = 84;
export const U = 85;
export const V = 86;
export const W = 87;
export const X = 88;
export const Y = 89;
export const Z = 90;
export const META = 91; // WIN_KEY_LEFT
export const MAC_WK_CMD_LEFT = 91;
export const MAC_WK_CMD_RIGHT = 93;
export const CONTEXT_MENU = 93;
export const NUMPAD_ZERO = 96;
export const NUMPAD_ONE = 97;
export const NUMPAD_TWO = 98;
export const NUMPAD_THREE = 99;
export const NUMPAD_FOUR = 100;
export const NUMPAD_FIVE = 101;
export const NUMPAD_SIX = 102;
export const NUMPAD_SEVEN = 103;
export const NUMPAD_EIGHT = 104;
export const NUMPAD_NINE = 105;
export const NUMPAD_MULTIPLY = 106;
export const NUMPAD_PLUS = 107;
export const NUMPAD_MINUS = 109;
export const NUMPAD_PERIOD = 110;
export const NUMPAD_DIVIDE = 111;
export const F1 = 112;
export const F2 = 113;
export const F3 = 114;
export const F4 = 115;
export const F5 = 116;
export const F6 = 117;
export const F7 = 118;
export const F8 = 119;
export const F9 = 120;
export const F10 = 121;
export const F11 = 122;
export const F12 = 123;
export const NUM_LOCK = 144;
export const SCROLL_LOCK = 145;
export const FIRST_MEDIA = 166;
export const FF_MINUS = 173;
export const MUTE = 173; // Firefox (Gecko) fires 181 for MUTE
export const VOLUME_DOWN = 174; // Firefox (Gecko) fires 182 for VOLUME_DOWN
export const VOLUME_UP = 175; // Firefox (Gecko) fires 183 for VOLUME_UP
export const FF_MUTE = 181;
export const FF_VOLUME_DOWN = 182;
export const LAST_MEDIA = 183;
export const FF_VOLUME_UP = 183;
export const SEMICOLON = 186; // Firefox (Gecko) fires 59 for SEMICOLON
export const EQUALS = 187; // Firefox (Gecko) fires 61 for EQUALS
export const COMMA = 188;
export const DASH = 189; // Firefox (Gecko) fires 173 for DASH/MINUS
export const PERIOD = 190;
export const SLASH = 191;
export const APOSTROPHE = 192;
export const TILDE = 192;
export const OPEN_SQUARE_BRACKET = 219;
export const BACKSLASH = 220;
export const CLOSE_SQUARE_BRACKET = 221;
export const SINGLE_QUOTE = 222;
export const MAC_META = 224;

type ModifierKey = 'altKey' | 'shiftKey' | 'ctrlKey' | 'metaKey';

export function hasModifierKey(event: KeyboardEvent | MouseEvent, ...modifiers: ModifierKey[]): boolean {
    if (modifiers.length) {
        return modifiers.some((modifier) => event[modifier]);
    }

    return event.altKey || event.shiftKey || event.ctrlKey || event.metaKey;
}

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

export function isNumberKey({ keyCode }: KeyboardEvent): boolean {
    return keyCode >= ZERO && keyCode <= NINE;
}

export function isNumpadKey({ keyCode }: KeyboardEvent): boolean {
    return keyCode >= NUMPAD_ZERO && keyCode <= NUMPAD_NINE;
}
export function isLetterKey({ keyCode }: KeyboardEvent): boolean {
    return keyCode >= A && keyCode <= Z;
}

export function isFunctionKey({ keyCode }: KeyboardEvent): boolean {
    return keyCode >= F1 && keyCode <= F12;
}

export function isVerticalMovement({ keyCode }: KeyboardEvent): boolean {
    return [UP_ARROW, DOWN_ARROW, PAGE_DOWN, PAGE_UP, HOME, END].includes(keyCode);
}

export function isHorizontalMovement({ keyCode }: KeyboardEvent): boolean {
    return [LEFT_ARROW, RIGHT_ARROW, BACKSPACE, DELETE].includes(keyCode);
}

export function isSelectAll(event: KeyboardEvent): boolean {
    return (event.ctrlKey || event.metaKey) && event.keyCode === A;
}

export function isCopy(event: KeyboardEvent): boolean {
    return (event.ctrlKey || event.metaKey) && event.keyCode === C;
}

export function isInput(event: Event): boolean {
    const target = _getEventTarget<HTMLElement>(event);

    return !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
}

export function isLeftBracket(event: KeyboardEvent): boolean {
    return event.code === 'BracketLeft';
}

export function isRightBracket(event: KeyboardEvent): boolean {
    return event.code === 'BracketRight';
}

export function isDigit({ keyCode }: KeyboardEvent): boolean {
    return [ZERO, ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE].includes(keyCode);
}
