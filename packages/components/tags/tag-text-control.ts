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
     * @deprecated Unused. The form control belongs to `<kbq-tag-list>`, not to the text control.
     * Will be removed in a future major release.
     */
    ngControl?: NgControl;

    focus(): void;
}
