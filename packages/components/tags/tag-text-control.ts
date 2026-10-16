import { Signal } from '@angular/core';

/**
 * Interface for a text control that is used to drive interaction with a kbq-tag-list.
 *
 * @docs-private
 */
export interface KbqTagTextControl {
    readonly id: Signal<string>;

    readonly placeholder: Signal<string>;

    readonly focused: Signal<boolean>;

    readonly empty: Signal<boolean>;

    /** Whether the control's value was filled in by the browser. */
    autofilled?: Signal<boolean>;

    focus(): void;

    /**
     * Keeps an attached autocomplete from opening the next time this control is focused. Implemented by
     * controls that carry one, so a tag list can restore focus after clearing without opening the panel.
     */
    suppressAutocompleteOnNextFocus?(): void;
}
