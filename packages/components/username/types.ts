/**
 * Keys naming the profile field a format character stands for.
 *
 * The key identifies the *field* only. Whether it renders in full or as an initial is decided by the
 * pipe that reads the format: `KbqUsernamePipe` abbreviates a key that is followed by {@link Dot},
 * `KbqUsernameCustomPipe` abbreviates the lowercase keys. The two upper/lower pairs therefore exist so
 * that a single mapping serves both rules.
 */
export enum KbqUsernameFormatKey {
    /** First name, abbreviated by `KbqUsernameCustomPipe`. */
    FirstNameShort = 'f',

    /** First name, rendered in full by `KbqUsernameCustomPipe`. */
    FirstNameFull = 'F',

    /** Middle name, abbreviated by `KbqUsernameCustomPipe`. */
    MiddleNameShort = 'm',

    /** Middle name, rendered in full by `KbqUsernameCustomPipe`. */
    MiddleNameFull = 'M',

    /** Last name, abbreviated by `KbqUsernameCustomPipe`. */
    LastNameShort = 'l',

    /** Last name, rendered in full by `KbqUsernameCustomPipe`. */
    LastNameFull = 'L',

    /** Abbreviation mark. `KbqUsernamePipe` abbreviates the key it follows; never maps to a field. */
    Dot = '.'
}

/**
 * Maps each format key to a property name in the user profile object.
 * Allows flexible formatting regardless of profile field names.
 *
 * Excludes the uppercase keys: `KbqUsernamePipe` decides shortness from the following {@link
 * KbqUsernameFormatKey.Dot}, so a case pair would carry no meaning for it.
 * @see KbqFormatKeyToProfileMappingExtended
 */
export type KbqFormatKeyToProfileMapping<T = any> = {
    [
        key in Exclude<
            KbqUsernameFormatKey,
            KbqUsernameFormatKey.FirstNameFull | KbqUsernameFormatKey.MiddleNameFull | KbqUsernameFormatKey.LastNameFull
        >
    ]: keyof T | undefined;
};

/**
 * Maps each format key to a property name in the user profile object.
 * Allows flexible formatting regardless of profile field names.
 * @see KbqUsernameCustomPipe
 */
export type KbqFormatKeyToProfileMappingExtended<T = any> = {
    [key in KbqUsernameFormatKey]: keyof T | undefined;
};

/** Basic user info rendered by `kbq-username`. */
export type KbqUserInfo = {
    /** Given name. */
    firstName?: string;
    /** Family name. */
    lastName?: string;
    /** Middle name or patronymic. */
    middleName?: string;
    /** Account name, rendered as the secondary part. */
    login?: string;
    /** Site the account belongs to, rendered in parentheses after the login. */
    site?: string;
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
