/** Interface for a text control that is used to drive interaction with a kbq-tag-list. */
import { Signal } from '@angular/core';
import { NgControl } from '@angular/forms';

export interface KbqTagTextControl {
    id: string;

    placeholder: string;

    focused: boolean;

    empty: boolean;

    /** Whether the control's value was filled in by the browser. */
    autofilled?: Signal<boolean>;

    ngControl?: NgControl;

    focus(): void;
}
