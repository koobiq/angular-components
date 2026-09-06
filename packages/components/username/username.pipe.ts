import { inject, isDevMode, Pipe, PipeTransform } from '@angular/core';
import {
    KBQ_PROFILE_MAPPING,
    kbqDefaultFullNameFormat,
    kbqDefaultFullNameFormatCustom,
    kbqDefaultProfileMapping
} from './constants';
import {
    KbqFormatKeyToProfileMapping,
    KbqFormatKeyToProfileMappingExtended,
    KbqUserInfo,
    KbqUsernameFormatKey
} from './types';

/** Format keys that name a profile field. `Dot` is a mark rather than a field and is deliberately absent. */
const fieldFormatKeys = new Set<string>([
    KbqUsernameFormatKey.FirstNameShort,
    KbqUsernameFormatKey.FirstNameFull,
    KbqUsernameFormatKey.MiddleNameShort,
    KbqUsernameFormatKey.MiddleNameFull,
    KbqUsernameFormatKey.LastNameShort,
    KbqUsernameFormatKey.LastNameFull
]);

/** Keys already reported by `warnAboutUnmappedKey`; a pure pipe runs on every check. */
const reportedUnmappedKeys = new Set<string>();

/**
 * A format key with no mapped field is emitted verbatim, which is indistinguishable from a separator
 * and is how a wrong mapping ends up rendering a capital `L` where the surname should be.
 */
const warnAboutUnmappedKey = (letter: string): void => {
    if (!isDevMode() || !fieldFormatKeys.has(letter) || reportedUnmappedKeys.has(letter)) return;

    reportedUnmappedKeys.add(letter);

    // eslint-disable-next-line no-console
    console.warn(
        `KbqUsernameCustomPipe: format key "${letter}" is not mapped to a profile field, so it is rendered ` +
            'as literal text. Provide it through KBQ_PROFILE_MAPPING (see kbqDefaultProfileMapping).'
    );
};

/** First character of a value, counted in code points so a surrogate pair survives as a single initial. */
const firstCharacter = (value: unknown): string => [...String(value)][0] ?? '';

/** FIRST STRONG ISOLATE: opens a run whose base direction is taken from its own first strong character. */
const firstStrongIsolate = '\u2068';

/** POP DIRECTIONAL ISOLATE: closes the run opened by {@link firstStrongIsolate}. */
const popDirectionalIsolate = '\u2069';

/**
 * Formats a profile the way `KbqUsernamePipe` and `kbq-username` do: a key followed by
 * {@link KbqUsernameFormatKey.Dot} renders an initial, any other key renders the full value, and the
 * parts are joined with single spaces — a character that is neither a mapped key nor `.` is dropped.
 *
 * Fields the profile does not carry are skipped one by one, so a partial profile still renders whatever
 * it has.
 *
 * @param profile Profile to format. Anything that is not a record — null, a primitive, an array —
 * formats as an empty string.
 * @param format Format string, e.g. {@link kbqDefaultFullNameFormat}.
 * @param mapping Format key to profile field mapping, e.g. {@link kbqDefaultProfileMapping}. Resolve it
 * from your own injection context — `inject(KBQ_PROFILE_MAPPING)` — to honour a scoped override.
 */
export function kbqFormatUsername<T = unknown>(
    profile: T,
    format: string,
    mapping: KbqFormatKeyToProfileMapping | KbqFormatKeyToProfileMappingExtended
): string {
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return '';

    const letters = format.split('');

    return letters
        .reduce<string[]>((parts, letter, index) => {
            if (letter === KbqUsernameFormatKey.Dot) return parts;

            const field = mapping[letter];
            const value = field === undefined ? undefined : profile[field];

            if (!value) return parts;

            const isShort = letters[index + 1] === KbqUsernameFormatKey.Dot;

            parts.push(isShort ? `${firstCharacter(value)}${KbqUsernameFormatKey.Dot}` : `${value}`);

            return parts;
        }, [])
        .join(' ');
}

/**
 * Formats a profile the way `KbqUsernameCustomPipe` does: a lowercase key renders an initial, an
 * uppercase one the full value, and every character with no mapped field — the separators — is emitted
 * verbatim, which is what lets the format carry its own punctuation.
 *
 * @param profile Profile to format. Anything that is not a record — null, a primitive, an array —
 * formats as an empty string.
 * @param format Format string, e.g. {@link kbqDefaultFullNameFormatCustom}.
 * @param mapping Format key to profile field mapping, e.g. {@link kbqDefaultProfileMapping}. Resolve it
 * from your own injection context — `inject(KBQ_PROFILE_MAPPING)` — to honour a scoped override.
 */
export function kbqFormatUsernameCustom<T = unknown>(
    profile: T,
    format: string,
    mapping: KbqFormatKeyToProfileMapping | KbqFormatKeyToProfileMappingExtended
): string {
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return '';

    return format
        .split('')
        .map((letter) => {
            const field = mapping[letter];

            if (!field) {
                warnAboutUnmappedKey(letter);

                return letter;
            }

            const value = profile[field];

            if (!value) return '';

            return letter === letter.toLowerCase() ? firstCharacter(value) : `${value}`;
        })
        .join('')
        .trim();
}

/**
 * Formats a user profile into a name string.
 *
 * A key followed by `.` renders an initial and any other key renders the full value; the separating
 * spaces are inserted by the pipe, so a character that is neither a mapped key nor `.` is dropped.
 *
 * @see KbqUsernameCustomPipe for the rule that derives the form from the key's case and keeps the
 * format's own punctuation.
 */
@Pipe({
    name: 'kbqUsername',
    pure: true
})
export class KbqUsernamePipe<T = unknown> implements PipeTransform {
    private readonly mapping = inject(KBQ_PROFILE_MAPPING, { optional: true }) ?? kbqDefaultProfileMapping;

    /** Builds a formatted name string from the user profile using the provided format and mapping. */
    transform(profile: T, format = kbqDefaultFullNameFormat, customMapping?: KbqFormatKeyToProfileMapping): string {
        return kbqFormatUsername(profile, format, customMapping || this.mapping);
    }
}

/**
 * Formats a user profile into a name string.
 *
 * A lowercase key renders an initial and an uppercase one the full value; every character with no
 * mapped field is emitted verbatim, so the format carries its own separators.
 *
 * @see KbqUsernamePipe for the rule that derives the form from a following `.`.
 */
@Pipe({
    name: 'kbqUsernameCustom',
    pure: true
})
export class KbqUsernameCustomPipe<T = unknown> implements PipeTransform {
    private readonly mapping = inject(KBQ_PROFILE_MAPPING, { optional: true }) ?? kbqDefaultProfileMapping;

    /** Builds a formatted name string from the user profile using the provided format and mapping. */
    transform(
        profile: T,
        format = kbqDefaultFullNameFormatCustom,
        customMapping?: KbqFormatKeyToProfileMappingExtended<T>
    ): string {
        return kbqFormatUsernameCustom(profile, format, customMapping || this.mapping);
    }
}

/**
 * Returns the formatter `kbq-username` renders with, bound to the `KBQ_PROFILE_MAPPING` visible at the
 * call site. Use it wherever the displayed string is needed outside a template — a search filter, an
 * option label — so that a scoped mapping applies to both paths.
 *
 * Must run in an injection context.
 */
export function kbqInjectUsernameFormatter(): <T>(profile: T, format?: string) => string {
    const mapping = inject(KBQ_PROFILE_MAPPING, { optional: true }) ?? kbqDefaultProfileMapping;

    return (profile, format = kbqDefaultFullNameFormat) => kbqFormatUsername(profile, format, mapping);
}

export interface KbqUsernameTextOptions {
    /** Formats the login segment. Defaults to identity. */
    formatLogin?: (login: string) => string;
    /**
     * Formats the site segment.
     * Defaults to wrapping in parentheses, matching kbq-username display.
     */
    formatSite?: (site: string) => string;
    /**
     * Wraps every segment in `U+2068`/`U+2069` so that a right-to-left name keeps its order next to a
     * left-to-right login, and the parentheses around the site stay attached to it.
     *
     * Off by default: the isolates are invisible but real characters, and this string is commonly fed to
     * an `includes()` filter that would stop matching.
     */
    bidiIsolate?: boolean;
}

/**
 * Builds a full username string from a pre-formatted name plus optional login and site,
 * mirroring the text rendered by `kbq-username`.
 *
 * Provide custom `formatLogin` / `formatSite` to tailor the output.
 */
export function kbqBuildUsernameText(
    data: { name: string } & Partial<Pick<KbqUserInfo, 'login' | 'site'>>,
    options?: KbqUsernameTextOptions
): string {
    const formatLogin = options?.formatLogin ?? ((login: string) => login);
    const formatSite = options?.formatSite ?? ((site: string) => `(${site})`);
    const isolate = (segment: string): string =>
        options?.bidiIsolate ? `${firstStrongIsolate}${segment}${popDirectionalIsolate}` : segment;

    return [data.name, data.login && formatLogin(data.login), data.site && formatSite(data.site)]
        .filter((segment): segment is string => !!segment)
        .map(isolate)
        .join(' ');
}
