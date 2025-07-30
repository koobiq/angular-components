import { InjectionToken } from '@angular/core';
import { KbqFormatKeyToProfileMapping } from './types';

/** Default name format: Last name full, first and middle as initials. */
export const kbqDefaultFullNameFormat = 'L f. m.';

/**
 * Throws an error when no profile field mapping is provided to the username pipe.
 * @docs-private
 */
export function throwKbqMappingMissingError() {
    throw new Error('KbqUsernamePipe: profile field mapping is required but was not provided.');
}

/**
 * Injection token for providing a global username format-to-profile mapping.
 */
export const KBQ_PROFILE_MAPPING = new InjectionToken<KbqFormatKeyToProfileMapping>('KBQ_PROFILE_MAPPING');
