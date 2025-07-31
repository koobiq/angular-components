import { InjectionToken } from '@angular/core';
import { KbqFormatKeyToProfileMapping, KbqUsernameFormatKey } from './types';

/** Default name format: Last name full, first and middle as initials. */
export const kbqDefaultFullNameFormatCustom = 'L f. m.';
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
export const KBQ_PROFILE_MAPPING = new InjectionToken<KbqFormatKeyToProfileMapping>('KBQ_PROFILE_MAPPING', {
    factory: () =>
        ({
            [KbqUsernameFormatKey.FirstNameShort]: 'firstName',
            [KbqUsernameFormatKey.FirstNameFull]: undefined,

            [KbqUsernameFormatKey.MiddleNameShort]: 'middleName',
            [KbqUsernameFormatKey.MiddleNameFull]: undefined,

            [KbqUsernameFormatKey.LastNameShort]: 'lastName',
            [KbqUsernameFormatKey.LastNameFull]: undefined,

            [KbqUsernameFormatKey.Dot]: undefined
        }) satisfies KbqFormatKeyToProfileMapping<{ firstName: string; middleName: string; lastName: string }>
});
