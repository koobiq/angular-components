import { Provider } from '@angular/core';

/**
 * @docs-private
 */
export const validationTooltipShowDelay = 10;

/**
 * @docs-private
 */
export const validationTooltipHideDelay = 3000;

/**
 * No-op provider kept for backwards compatibility.
 *
 * Legacy validation directive (`KbqValidateDirective`) was removed in v20.0.0; the new
 * `ErrorStateMatcher` based validation is enabled by default. This function can still be
 * placed in component `providers` arrays but no longer adds any tokens — it just returns
 * an empty provider list.
 *
 * @deprecated No longer needed. Will be removed in a future release.
 */
export const kbqDisableLegacyValidationDirectiveProvider = (): Provider[] => [];
