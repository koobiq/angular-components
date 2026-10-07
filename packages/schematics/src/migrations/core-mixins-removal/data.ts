/**
 * Data for the `core-mixins-removal` migration.
 *
 * `mixinDisabled` and `mixinTabIndex` were deprecated, unused inside the library, and logged a dev-mode warning
 * on every instance. They are removed from `@koobiq/components/core` with their types. Warn-only: a class built on
 * them declares the members itself.
 */

export interface WarnPattern {
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        pattern: '\\b(?:mixinDisabled|CanDisableCtor|CanDisable)\\b',
        message:
            'mixinDisabled, CanDisable and CanDisableCtor were removed from @koobiq/components/core. Declare ' +
            '`readonly disabled = input(false, { transform: booleanAttribute })` on the class instead.'
    },
    {
        pattern: '\\b(?:mixinTabIndex|HasTabIndexCtor|HasTabIndex)\\b',
        message:
            'mixinTabIndex, HasTabIndex and HasTabIndexCtor were removed from @koobiq/components/core. Declare a ' +
            '`tabIndex` input on the class, and render -1 while it is disabled.'
    }
];

export const SUMMARY = [
    'The deprecated mixins of @koobiq/components/core are removed: declare their members on the class.'
];
