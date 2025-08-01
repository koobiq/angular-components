/**
 * Keys for formatting username parts in short (initial) or full form.
 */
export enum KbqUsernameFormatKey {
    /**
     * Short form of the first name (e.g., "John" → "J")
     */
    FirstNameShort = 'f',

    /**
     * Full form of the first name (e.g., "John")
     */
    FirstNameFull = 'F',

    /**
     * Short form of the middle name (e.g., "Henry" → "H")
     */
    MiddleNameShort = 'm',

    /**
     * Full form of the middle name (e.g., "Henry")
     */
    MiddleNameFull = 'M',

    /**
     * Short form of the last name (e.g., "Doe" → "D")
     */
    LastNameShort = 'l',

    /**
     * Full form of the last name (e.g., "Doe")
     */
    LastNameFull = 'L',
    Dot = '.'
}

/**
 * Maps each format key to a property name in the user profile object.
 * Allows flexible formatting regardless of profile field names.
 */
export type KbqFormatKeyToProfileMapping<T = any> = {
    [key in KbqUsernameFormatKey]: keyof T | undefined;
};

/**
 * Layout mode for displaying a username and applying text-ellipsis.
 *
 * - `stacked`: Elements shown vertically.
 * - `inline`: Elements shown in one line. Text ellipsis is applied to both parts.
 * - `text`: Plain text, no layout styling. No text-ellipsis.
 */
export type KbqUsernameMode = 'stacked' | 'inline' | 'text';

/**
 * Visual style of the username.
 *
 * - `default`: standard styling with primary and secondary colors.
 * - `error`: error colors (e.g., red).
 * - `accented`: no color theming; emphasizes via typography only.
 * - `inherit`: inherits parent styles, no theming. For example, useful when using inside links.
 */
export type KbqUsernameStyle = 'default' | 'error' | 'accented' | 'inherit';
