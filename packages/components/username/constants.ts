import { InjectionToken, Provider, Signal } from '@angular/core';
import {
    KbqDeepPartial,
    kbqInjectLocaleConfiguration,
    kbqLocaleConfigurationOverrideProvider,
    KbqUsernameLocaleConfiguration,
    ruRULocaleData
} from '@koobiq/components/core';
import {
    KbqFormatKeyToProfileMapping,
    KbqFormatKeyToProfileMappingExtended,
    KbqUserInfo,
    KbqUsernameFormatKey
} from './types';

/**
 * Default format of `KbqUsernameCustomPipe`: full last name, first and middle names as initials.
 *
 * Written in that pipe's own syntax — uppercase keys render the full value, lowercase ones an initial,
 * and every other character is copied verbatim, which is where the spaces and the dots come from.
 */
export const kbqDefaultFullNameFormatCustom = 'L f. m.';

/**
 * Default format of `KbqUsernamePipe` and of the `kbq-username` component: full last name, first and
 * middle names as initials.
 *
 * Written in that pipe's own syntax — a key followed by `.` renders an initial, any other key renders
 * the full value, and the separating spaces are inserted by the pipe rather than by the format.
 */
export const kbqDefaultFullNameFormat = 'lf.m.';

/**
 * Mapping of every format key onto a field of {@link KbqUserInfo}. Backs {@link KBQ_PROFILE_MAPPING}
 * and is the fallback of both pipes, so a profile shaped like `KbqUserInfo` needs no mapping at all.
 *
 * Covers the uppercase keys as well, which is what makes `kbqDefaultFullNameFormatCustom` work out of
 * the box; spread it to map extra fields without losing the defaults.
 */
export const kbqDefaultProfileMapping = {
    [KbqUsernameFormatKey.FirstNameShort]: 'firstName',
    [KbqUsernameFormatKey.FirstNameFull]: 'firstName',
    [KbqUsernameFormatKey.MiddleNameShort]: 'middleName',
    [KbqUsernameFormatKey.MiddleNameFull]: 'middleName',
    [KbqUsernameFormatKey.LastNameShort]: 'lastName',
    [KbqUsernameFormatKey.LastNameFull]: 'lastName',
    [KbqUsernameFormatKey.Dot]: undefined
} satisfies KbqFormatKeyToProfileMappingExtended<KbqUserInfo>;

/**
 * Injection token for providing a global username format-to-profile mapping.
 *
 * Resolved where the `kbq-username` component or the pipe lives, so a component-level or route-level
 * provider applies to that subtree. Outside a template, resolve it from your own injection context —
 * `kbqInjectUsernameFormatter()` does exactly that.
 */
export const KBQ_PROFILE_MAPPING = new InjectionToken<
    KbqFormatKeyToProfileMapping | KbqFormatKeyToProfileMappingExtended
>('KBQ_PROFILE_MAPPING', { factory: () => kbqDefaultProfileMapping });

/** Default localized strings of `kbq-username`. */
export const KBQ_USERNAME_DEFAULT_LOCALE_CONFIGURATION: KbqUsernameLocaleConfiguration = ruRULocaleData.username;

/** Localization configuration provider for `kbq-username`. */
export const KBQ_USERNAME_LOCALE_CONFIGURATION = new InjectionToken<KbqUsernameLocaleConfiguration>(
    'KbqUsernameLocaleConfiguration',
    { factory: () => KBQ_USERNAME_DEFAULT_LOCALE_CONFIGURATION }
);

/**
 * Utility provider. Only the strings you pass are overridden; the rest keep following the active locale.
 *
 * @see KBQ_USERNAME_LOCALE_CONFIGURATION
 */
export const kbqUsernameLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqUsernameLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('username', configuration);

/**
 * Injection function that creates a reactive locale configuration signal for `kbq-username`.
 *
 * @docs-private
 */
export function kbqInjectUsernameLocaleConfiguration(): Signal<KbqUsernameLocaleConfiguration> {
    return kbqInjectLocaleConfiguration('username', KBQ_USERNAME_LOCALE_CONFIGURATION);
}
