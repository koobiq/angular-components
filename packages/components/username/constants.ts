import { InjectionToken } from '@angular/core';
import { KbqFormatKeyToProfileMapping, KbqFormatKeyToProfileMappingExtended, KbqUsernameFormatKey } from './types';

/** Default name format: Last name full, first and middle as initials. */
export const kbqDefaultFullNameFormatCustom = 'L f. m.';
/** Default name format: Last name full, first and middle as initials. */
export const kbqDefaultFullNameFormat = 'lf.m.';

/**
 * Throws an error when no profile field mapping is provided to the username pipe.
 * @docs-private
 */
export function KbqMappingMissingError() {
    return new Error('KbqUsernamePipe: profile field mapping is required but was not provided.');
}

/**
 * Injection token for providing a global username format-to-profile mapping.
 */
export const KBQ_PROFILE_MAPPING = new InjectionToken<
    KbqFormatKeyToProfileMapping | KbqFormatKeyToProfileMappingExtended
>('KBQ_PROFILE_MAPPING', {
    factory: () =>
        ({
            [KbqUsernameFormatKey.FirstNameShort]: 'firstName',
            [KbqUsernameFormatKey.MiddleNameShort]: 'middleName',
            [KbqUsernameFormatKey.LastNameShort]: 'lastName',
            [KbqUsernameFormatKey.Dot]: undefined
        }) satisfies KbqFormatKeyToProfileMapping<{ firstName: string; middleName: string; lastName: string }>
});
