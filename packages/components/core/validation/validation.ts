import { InjectionToken } from '@angular/core';

export const validationTooltipShowDelay = 10;
export const validationTooltipHideDelay = 3000;

export interface KbqValidationOptions {
    useValidation: boolean;
}

export const KBQ_VALIDATION = new InjectionToken<KbqValidationOptions>('KbqUseValidation', {
    factory: () => ({ useValidation: true })
});
