/** Interface for a text control that is used to drive interaction with a kbq-tag-list. */
import { NgControl } from '@angular/forms';


// tslint:disable-next-line: naming-convention
export interface KbqTagTextControl {
    id: string;

    placeholder: string;

    focused: boolean;

    empty: boolean;

    ngControl?: NgControl;

    focus(): void;
}
