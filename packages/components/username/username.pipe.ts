import { inject, Injectable, Pipe, PipeTransform } from '@angular/core';
import {
    KBQ_PROFILE_MAPPING,
    kbqDefaultFullNameFormat,
    kbqDefaultFullNameFormatCustom,
    KbqMappingMissingError
} from './constants';
import { KbqFormatKeyToProfileMapping, KbqUsernameFormatKey } from './types';

@Injectable({ providedIn: 'root' })
@Pipe({
    name: 'kbqUsername',
    pure: true,
    standalone: true
})
export class KbqUsernamePipe<T extends object> implements PipeTransform {
    private readonly mapping = inject(KBQ_PROFILE_MAPPING, { optional: true });

    /** Builds a formatted name string from the user profile using the provided format and mapping. */
    transform(profile: T, format = kbqDefaultFullNameFormat, argMapping?: KbqFormatKeyToProfileMapping): string {
        const resolvedMapping = argMapping || this.mapping;

        if (!resolvedMapping) {
            throw KbqMappingMissingError();
        }

        if (!profile || typeof profile !== 'object') return '';

        let result = '';

        const formatUnits = format.split('') as KbqUsernameFormatKey[];

        formatUnits.forEach((letter: KbqUsernameFormatKey, index: number, array) => {
            if (letter !== KbqUsernameFormatKey.Dot) {
                const field = resolvedMapping[letter] as keyof T;
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
    pure: true,
    standalone: true
})
export class KbqUsernameCustomPipe<T extends object> implements PipeTransform {
    private readonly mapping = inject(KBQ_PROFILE_MAPPING, { optional: true });

    /** Builds a formatted name string from the user profile using the provided format and mapping. */
    transform(profile: T, format = kbqDefaultFullNameFormatCustom, argMapping?: KbqFormatKeyToProfileMapping): string {
        const resolvedMapping = argMapping || this.mapping;

        if (!resolvedMapping) {
            throw KbqMappingMissingError();
        }

        if (!profile || typeof profile !== 'object') return '';

        let result = '';

        const formatUnits = format.split('') as KbqUsernameFormatKey[];

        formatUnits.forEach((letter: KbqUsernameFormatKey) => {
            const field = resolvedMapping[letter];

            if (!field) {
                result += letter;

                return;
            }

            const isShort = letter === letter.toLowerCase();
            const fieldValue: string = profile[field] || '';

            result += fieldValue && isShort ? fieldValue[0] : fieldValue;
        });

        return result.trim();
    }
}
