import { InjectionToken } from '@angular/core';

export interface KbqFormFieldRef {
    control: any;
    /** @TODO move into KbqCleaner */
    canCleanerClearByEsc: boolean;
    /**
     * @TODO should be removed, is private method
     * @deprecated
     */
    shouldForward(str: string): boolean;
    focusViaKeyboard(): void;
}

/**
 * @TODO move into form-field.ts
 * @TODO add correct type for `InjectionToken<KbqFormField>`
 */

/**
 * Injection token that can be used to inject an instances of `KbqFormField`. It serves
 * as alternative token to the actual `KbqFormField` class which would cause unnecessary
 * retention of the `KbqFormField` class and its component metadata.
 */
export const KBQ_FORM_FIELD_REF = new InjectionToken<KbqFormFieldRef>('KbqFormFieldRef');
