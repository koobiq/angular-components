import { InjectionToken } from '@angular/core';

export interface KbqFormFieldRef {
    control: any;
    canCleanerClearByEsc: boolean;
    shouldForward(str: string): boolean;
    focusViaKeyboard(): void;
}

/**
 * Injection token that can be used to inject an instances of `KbqFormField`. It serves
 * as alternative token to the actual `KbqFormField` class which would cause unnecessary
 * retention of the `KbqFormField` class and its component metadata.
 */
export const KBQ_FORM_FIELD_REF = new InjectionToken<KbqFormFieldRef>('KbqFormFieldRef');
