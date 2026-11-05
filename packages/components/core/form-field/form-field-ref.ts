import { ElementRef, InjectionToken, ModelSignal, Signal } from '@angular/core';
import { NgControl } from '@angular/forms';

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
    readonly value: Signal<T | null>;
    /** The element ID for this control. */
    readonly id: Signal<string>;
    /** The placeholder for this control. */
    readonly placeholder: Signal<string | null | undefined>;
    /** Gets the NgControl for this control. */
    readonly ngControl: NgControl | null;
    /** Whether the control is focused. */
    readonly focused: Signal<boolean>;
    /** Whether the control is empty. */
    readonly empty: Signal<boolean>;
    /** Whether the control is required. */
    readonly required: Signal<boolean>;
    /** Whether the control is disabled. */
    readonly disabled: Signal<boolean>;
    /** Whether the control is in an error state. */
    readonly errorState: Signal<boolean>;
    /** Name of the control type, used to build the `kbq-form-field-type-{{controlType}}` class. */
    readonly controlType?: string;
}

/**
 * Internal contract between `core` and `KbqFormField`, for code that cannot import the form field because of a
 * circular dependency (e.g. `core/select/common.ts`). Application code injects `KBQ_FORM_FIELD` from
 * `@koobiq/components/form-field` instead.
 *
 * @docs-private
 */
export interface KbqFormFieldRef {
    /** The form field control, as `KbqFormField.control` reads it. */
    readonly control: Signal<KbqFormFieldControlRef>;
    /** Use when KbqFormField is in an overlay container. */
    inOverlay: ModelSignal<boolean>;
    focus(): void;
}

/**
 * Injects the `KbqFormField` as a `KbqFormFieldRef` where `@koobiq/components/form-field` cannot be imported: an
 * internal contract between `core` and the form field. Application code injects `KBQ_FORM_FIELD` from
 * `@koobiq/components/form-field` instead.
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
