import { Signal } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Observable } from 'rxjs';

/** An interface which allows a control to work inside of a `KbqFormField`. */
export abstract class KbqFormFieldControl<T> {
    /** The value of the control. */
    value: T | null;

    /**
     * Stream that emits whenever the state of the control changes such that the parent `KbqFormField`
     * needs to run change detection.
     */
    readonly stateChanges: Observable<void>;

    /** The element ID for this control. */
    readonly id: string;

    /** The placeholder for this control. */
    readonly placeholder: string;

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

    /**
     * Whether the control's value was filled in by the browser.
     *
     * Implement it only where autofill is reachable: on a control that is itself a text input or a
     * textarea, or — like `KbqTagList` — on a wrapper that forwards the state of the input it hosts.
     * Leave it out on controls the browser never fills.
     *
     * A signal rather than a plain property because the form field reads it from a host binding and
     * runs `OnPush`: a signal read there marks the form field dirty on its own.
     */
    readonly autofilled?: Signal<boolean>;

    /**
     * An optional name for the control type that can be used to distinguish `kbq-form-field` elements
     * based on their control type. The form field will add a class,
     * `kbq-form-field-type-{{controlType}}` to its root element.
     */
    readonly controlType?: string;

    /** Handles a click on the control's container. */
    abstract onContainerClick(event: MouseEvent): void;

    /** Focuses the control. */
    abstract focus(options?: FocusOptions): void;

    /** Opens control's overlay. */
    abstract open?(): void;
}
