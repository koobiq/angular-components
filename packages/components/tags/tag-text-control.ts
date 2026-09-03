import { Signal } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Interface for a text control that is used to drive interaction with a kbq-tag-list.
 *
 * @docs-private
 */
export interface KbqTagTextControl {
    id: string;

    placeholder: string;

    focused: boolean;

    empty: boolean;

    /** Whether the control's value was filled in by the browser. */
    autofilled?: Signal<boolean>;

    /**
     * @deprecated Unused by the library: validation lives on the `<kbq-tag-list>` control.
     * Will be removed in a future major release.
     */
    ngControl?: NgControl | null;

    focus(): void;
}
