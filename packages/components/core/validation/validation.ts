import { InjectionToken, Provider } from '@angular/core';

/**
 * @docs-private
 */
export const validationTooltipShowDelay = 10;

/**
 * @docs-private
 */
export const validationTooltipHideDelay = 3000;

/**
 * @deprecated Will be removed in next major release.
 *
 * @docs-private
 */
export interface KbqValidationOptions {
    useValidation: boolean;
}

/**
 * @deprecated Will be removed in next major release.
 *
 * @docs-private
 */
export const KBQ_VALIDATION = new InjectionToken<KbqValidationOptions>('KbqUseValidation', {
    factory: () => ({ useValidation: true })
});

/**
 * Utility provider which disables legacy validation directive.
 *
 * @deprecated Will be removed in next major release.
 */
export const kbqDisableLegacyValidationDirectiveProvider = (): Provider => ({
    provide: KBQ_VALIDATION,
    useValue: { useValidation: false } satisfies KbqValidationOptions
});
