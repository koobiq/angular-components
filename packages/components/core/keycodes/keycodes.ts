import { hasModifierKey as cdkHasModifierKey } from '@angular/cdk/keycodes';
import { _getEventTarget } from '@angular/cdk/platform';

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const MAC_ENTER = 3;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const BACKSPACE = 8;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const TAB = 9;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NUM_CENTER = 12;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const ENTER = 13;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const SHIFT = 16;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const CONTROL = 17;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const ALT = 18;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const PAUSE = 19;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const CAPS_LOCK = 20;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const ESCAPE = 27;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const SPACE = 32;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const PAGE_UP = 33;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const PAGE_DOWN = 34;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const END = 35;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const HOME = 36;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const LEFT_ARROW = 37;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const UP_ARROW = 38;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const RIGHT_ARROW = 39;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const DOWN_ARROW = 40;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const PLUS_SIGN = 43;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const PRINT_SCREEN = 44;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const INSERT = 45;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const DELETE = 46;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const ZERO = 48;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const ONE = 49;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const TWO = 50;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const THREE = 51;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const FOUR = 52;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const FIVE = 53;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const SIX = 54;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const SEVEN = 55;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const EIGHT = 56;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NINE = 57;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const FF_SEMICOLON = 59; // Firefox (Gecko) fires this for semicolon instead of 186

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const FF_EQUALS = 61; // Firefox (Gecko) fires this for equals instead of 187

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const QUESTION_MARK = 63;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const AT_SIGN = 64;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const A = 65;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const B = 66;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const C = 67;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const D = 68;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const E = 69;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const F = 70;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const G = 71;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const H = 72;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const I = 73;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const J = 74;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const K = 75;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const L = 76;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const M = 77;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const N = 78;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const O = 79;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const P = 80;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const Q = 81;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const R = 82;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const S = 83;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const T = 84;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const U = 85;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const V = 86;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const W = 87;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const X = 88;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const Y = 89;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const Z = 90;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const META = 91; // WIN_KEY_LEFT

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const MAC_WK_CMD_LEFT = 91;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const MAC_WK_CMD_RIGHT = 93;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const CONTEXT_MENU = 93;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NUMPAD_ZERO = 96;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NUMPAD_ONE = 97;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NUMPAD_TWO = 98;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NUMPAD_THREE = 99;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NUMPAD_FOUR = 100;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NUMPAD_FIVE = 101;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NUMPAD_SIX = 102;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NUMPAD_SEVEN = 103;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NUMPAD_EIGHT = 104;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NUMPAD_NINE = 105;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NUMPAD_MULTIPLY = 106;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NUMPAD_PLUS = 107;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NUMPAD_MINUS = 109;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NUMPAD_PERIOD = 110;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NUMPAD_DIVIDE = 111;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const F1 = 112;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const F2 = 113;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const F3 = 114;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const F4 = 115;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const F5 = 116;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const F6 = 117;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const F7 = 118;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const F8 = 119;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const F9 = 120;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const F10 = 121;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const F11 = 122;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const F12 = 123;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const NUM_LOCK = 144;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const SCROLL_LOCK = 145;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const FIRST_MEDIA = 166;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const FF_MINUS = 173;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const MUTE = 173; // Firefox (Gecko) fires 181 for MUTE

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const VOLUME_DOWN = 174; // Firefox (Gecko) fires 182 for VOLUME_DOWN

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const VOLUME_UP = 175; // Firefox (Gecko) fires 183 for VOLUME_UP

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const FF_MUTE = 181;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const FF_VOLUME_DOWN = 182;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const LAST_MEDIA = 183;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const FF_VOLUME_UP = 183;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const SEMICOLON = 186; // Firefox (Gecko) fires 59 for SEMICOLON

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const EQUALS = 187; // Firefox (Gecko) fires 61 for EQUALS

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const COMMA = 188;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const DASH = 189; // Firefox (Gecko) fires 173 for DASH/MINUS

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const PERIOD = 190;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const SLASH = 191;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const APOSTROPHE = 192;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const TILDE = 192;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const OPEN_SQUARE_BRACKET = 219;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const BACKSLASH = 220;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const CLOSE_SQUARE_BRACKET = 221;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const SINGLE_QUOTE = 222;

/**
 * @deprecated Import from `@angular/cdk/keycodes` instead. Will be removed in 22.0.0.
 *
 * @docs-private
 */
export const MAC_META = 224;

type ModifierKey = 'altKey' | 'shiftKey' | 'ctrlKey' | 'metaKey';

/**
 * Unlike the constants above this wrapper is not deprecated: the wide signature has no CDK equivalent.
 * Internal callers with a `KeyboardEvent` import `hasModifierKey` from `@angular/cdk/keycodes` directly;
 * only `MouseEvent` call sites (clicks) go through this wrapper.
 *
 * @docs-private
 */
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
    return [DOWN_ARROW, END, HOME, PAGE_DOWN, PAGE_UP, UP_ARROW].includes(keyCode);
}

/** @docs-private */
export function isHorizontalMovement({ keyCode }: KeyboardEvent): boolean {
    return [BACKSPACE, DELETE, LEFT_ARROW, RIGHT_ARROW].includes(keyCode);
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
    return [EIGHT, FIVE, FOUR, NINE, ONE, SEVEN, SIX, THREE, TWO, ZERO].includes(keyCode);
}
