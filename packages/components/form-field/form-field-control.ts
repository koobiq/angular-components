import { Signal } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * An interface which allows a control to work inside of a `KbqFormField`.
 *
 * Every state member is a signal: the form field derives its own state from them and runs `OnPush`, so a
 * change of the control reaches it without any notification of the control's own.
 */
export abstract class KbqFormFieldControl<T> {
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

    /**
     * Whether the control's value was filled in by the browser.
     *
     * Implement it only where autofill is reachable: on a control that is itself a text input or a
     * textarea, or — like `KbqTagList` — on a wrapper that forwards the state of the input it hosts.
     * Leave it out on controls the browser never fills.
     */
    readonly autofilled?: Signal<boolean>;

    /**
     * An optional name for the control type that can be used to distinguish `kbq-form-field` elements
     * based on their control type. The form field will add a class,
     * `kbq-form-field-type-{{controlType}}` to its root element.
     */
    readonly controlType?: string;

    /**
     * Whether the control is a native labelable element, so that the `<label for>` a wrapping
     * `kbq-form-field` renders associates with it.
     *
     * Defaults to `true`. A control rendered as a custom element (`kbq-select`, for one) sets it to
     * `false`: a `<label>` with neither a `for` matching a labelable element nor a nested one is
     * invalid, so the form field renders the caption as a `<span>` instead and the control is named
     * through `aria-labelledby`.
     */
    readonly isNativeLabelSupported?: boolean;

    /**
     * Sets the ids of the elements (hints, errors) that describe the control.
     *
     * Implement it only when `aria-describedby` has to be placed on an element other than the one
     * the control is declared on: `KbqFormField` writes the attribute on the control's host element
     * by default.
     */
    setDescribedByIds?: (ids: string[]) => void;

    /** Handles a click on the control's container. */
    abstract onContainerClick(event: MouseEvent): void;

    /** Focuses the control. */
    abstract focus(options?: FocusOptions): void;

    /** Opens control's overlay. */
    open?: () => void;
}

/** Ids written by `kbqSetDescribedByIds` for a given element, so consumer-provided ids survive updates. */
const ownDescribedByIds = new WeakMap<HTMLElement, string[]>();

/**
 * Writes `aria-describedby` on the control's element, preserving the ids the consumer set themselves.
 *
 * @internal
 */
export function kbqSetDescribedByIds(element: HTMLElement, ids: string[]): void {
    const previouslyOwned = ownDescribedByIds.get(element) || [];
    const current = (element.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    const next = [...current.filter((id) => !previouslyOwned.includes(id)), ...ids];

    ownDescribedByIds.set(element, ids);

    if (next.length) {
        element.setAttribute('aria-describedby', next.join(' '));
    } else {
        element.removeAttribute('aria-describedby');
    }
}
