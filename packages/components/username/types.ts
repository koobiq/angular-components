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
    LastNameFull = 'L'
}

/**
 * Maps each format key to a property name in the user profile object.
 * Allows flexible formatting regardless of profile field names.
 */
export type KbqFormatKeyToProfileMapping<T = any> = {
    [key in KbqUsernameFormatKey]: keyof T;
};

export type KbqUsernameMode = 'stacked' | 'inline' | 'text';
