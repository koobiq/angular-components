import { ElementRef, InjectionToken, ModelSignal, Signal } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Observable } from 'rxjs';

/**
 * The part of `KbqFormFieldControl` that code outside `@koobiq/components/form-field` relies on.
 *
 * It is declared here, and not imported, because importing the form-field package from `core` would close a
 * dependency cycle — the same reason `KBQ_FORM_FIELD_REF` exists. `KbqFormFieldControl` structurally satisfies
 * it, so narrow casts are only needed for the members of a specific control (e.g. `numberInput`).
 *
 * @docs-private
 */
export interface KbqFormFieldControlRef<T = unknown> {
    /** The value of the control. */
    value: T | null;
    /** Stream that emits whenever the state of the control changes. */
    readonly stateChanges: Observable<void>;
    /** The element ID for this control. */
    readonly id: string;
    /** The placeholder for this control. */
    placeholder: string;
    /** Gets the NgControl for this control. */
    readonly ngControl: NgControl | null;
    /** Whether the control is focused. */
    readonly focused: boolean;
    /** Whether the control is empty. */
    readonly empty: boolean;
    /** Whether the control is required. */
    readonly required: boolean;
    /** Whether the control is disabled. */
    readonly disabled: boolean;
    /** Whether the control is in an error state. */
    readonly errorState: boolean;
    /** Name of the control type, used to build the `kbq-form-field-type-{{controlType}}` class. */
    readonly controlType?: string;
}

/**
 * Internal contract for `KbqFormField` used by code that cannot import the form-field
 * class directly because of a circular dependency (e.g. `core/select/common.ts`).
 *
 * @deprecated Use KbqFormField from `@koobiq/components/form-field`.
 *
 * @docs-private
 */
export interface KbqFormFieldRef {
    /** @see KbqFormField.control */
    readonly control: Signal<KbqFormFieldControlRef>;
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
 * @deprecated Use `KBQ_FORM_FIELD` from `@koobiq/components/form-field`.
 *
 * @docs-private
 */
export const KBQ_FORM_FIELD_REF = new InjectionToken<KbqFormFieldRef>('KbqFormFieldRef');

/**
 * Contract for an ancestor that wants to override where overlays opened by a nested
 * `KbqFormField`'s control (e.g. a select's dropdown, a datepicker's calendar) are
 * anchored, instead of the form-field's own container.
 */
export interface KbqConnectedOverlayOriginProvider {
    /**
     * Element the overlay should be positioned and sized against, or `undefined` to fall
     * back to the form-field's own container.
     */
    getConnectedOverlayOrigin(): ElementRef | undefined;
}

/**
 * Injection token for `KbqConnectedOverlayOriginProvider`. Provide it on an ancestor
 * component to redirect where a nested `KbqFormField`'s control positions its overlay.
 */
export const KBQ_CONNECTED_OVERLAY_ORIGIN = new InjectionToken<KbqConnectedOverlayOriginProvider>(
    'KbqConnectedOverlayOrigin'
);
