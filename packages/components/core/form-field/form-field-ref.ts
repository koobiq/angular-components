import { InjectionToken, ModelSignal } from '@angular/core';

/**
 * Internal contract for `KbqFormField` used by code that cannot import the form-field
 * class directly because of a circular dependency (e.g. `core/select/common.ts`).
 *
 * @docs-private
 */
export interface KbqFormFieldRef {
    control: any;
    canCleanerClearByEsc: boolean;
    /** Use when KbqFormField is in an overlay container. */
    inOverlay: ModelSignal<boolean>;
    focus(): void;
}

/**
 * Injection token that can be used to inject an instances of `KbqFormField`. It serves
 * as alternative token to the actual `KbqFormField` class which would cause unnecessary
 * retention of the `KbqFormField` class and its component metadata.
 *
 * @TODO move into form-field.ts, add correct type for `InjectionToken<KbqFormField>` (#DS-2915)
 */
export const KBQ_FORM_FIELD_REF = new InjectionToken<KbqFormFieldRef>('KbqFormFieldRef');
