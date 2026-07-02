import { inject, Injectable, Pipe, PipeTransform } from '@angular/core';
import {
    KBQ_PROFILE_MAPPING,
    kbqDefaultFullNameFormat,
    kbqDefaultFullNameFormatCustom,
    KbqMappingMissingError
} from './constants';
import { KbqFormatKeyToProfileMapping, KbqFormatKeyToProfileMappingExtended, KbqUsernameFormatKey } from './types';
import { KbqUserInfo } from './username';

@Injectable({ providedIn: 'root' })
@Pipe({
    name: 'kbqUsername',
    pure: true
})
export class KbqUsernamePipe<T = unknown> implements PipeTransform {
    private readonly mapping = inject(KBQ_PROFILE_MAPPING, { optional: true });

    /** Builds a formatted name string from the user profile using the provided format and mapping. */
    transform(profile: T, format = kbqDefaultFullNameFormat, customMapping?: KbqFormatKeyToProfileMapping): string {
        const resolvedMapping = customMapping || this.mapping;

        if (!resolvedMapping) {
            throw KbqMappingMissingError();
        }

        if (!profile || typeof profile !== 'object') return '';

        let result = '';

        const formatUnits = format.split('');

        formatUnits.forEach((letter: KbqUsernameFormatKey | string, index: number, array) => {
            if (letter !== KbqUsernameFormatKey.Dot) {
                const field: keyof T = resolvedMapping[letter];
                const fieldValue = profile[field];

                if (fieldValue) {
                    const isShort = array[index + 1] === KbqUsernameFormatKey.Dot;
                    const resolvedFieldValue = isShort ? `${fieldValue[0]}${KbqUsernameFormatKey.Dot}` : fieldValue;

                    result += ` ${resolvedFieldValue}`;
                }
            }
        });

        return result.trim();
    }
}

/**
 * Pipe to format a user profile into a name string using a format pattern and field mapping.
 * Lowercase keys output initials; uppercase keys show full values.
 */
@Injectable({ providedIn: 'root' })
@Pipe({
    name: 'kbqUsernameCustom',
    pure: true
})
export class KbqUsernameCustomPipe<T = unknown> implements PipeTransform {
    private readonly mapping = inject(KBQ_PROFILE_MAPPING, { optional: true });

    /** Builds a formatted name string from the user profile using the provided format and mapping. */
    transform(
        profile: T,
        format = kbqDefaultFullNameFormatCustom,
        customMapping?: KbqFormatKeyToProfileMappingExtended<T>
    ): string {
        const resolvedMapping = customMapping || this.mapping;

        if (!resolvedMapping) {
            throw KbqMappingMissingError();
        }

        if (!profile || typeof profile !== 'object') return '';

        let result = '';

        const formatUnits = format.split('');

        formatUnits.forEach((letter: KbqUsernameFormatKey | string) => {
            const field: keyof T | undefined = resolvedMapping[letter];

            if (!field) {
                result += letter;

                return;
            }

            const isShort = letter === letter.toLowerCase();
            const fieldValue = profile[field] || '';

            result += fieldValue && isShort ? fieldValue[0] : fieldValue;
        });

        return result.trim();
    }
}

export interface KbqUsernameTextOptions {
    /** Formats the login segment. Defaults to identity. */
    formatLogin?: (login: string) => string;
    /**
     * Formats the site segment.
     * Defaults to wrapping in parentheses, matching kbq-username display.
     */
    formatSite?: (site: string) => string;
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
    const formatLogin = options?.formatLogin ?? ((login) => login);
    const formatSite = options?.formatSite ?? ((site) => `(${site})`);

    return [data.name, data.login && formatLogin(data.login), data.site && formatSite(data.site)]
        .filter(Boolean)
        .join(' ');
}
