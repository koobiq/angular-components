import { AfterContentInit, Directive, inject } from '@angular/core';
import { ESCAPE, LEFT_ARROW, RIGHT_ARROW } from '@koobiq/components/core';
import { KBQ_FORM_FIELD, KBQ_FORM_FIELD_DEFAULT_OPTIONS } from '@koobiq/components/form-field';
import {
    throwKbqDropdownSearchMissingInputError,
    throwKbqDropdownSearchMissingNgControlError
} from './dropdown-errors';
import { KBQ_DROPDOWN_PANEL } from './dropdown.types';

/**
 * Marks a `kbq-form-field` projected into a `kbq-dropdown` as the panel's search field.
 *
 * The panel keeps DOM focus in the field, so arrow keys move the highlighted item while the query
 * stays editable.
 */
@Directive({
    selector: '[kbqDropdownSearch]',
    providers: [
        {
            // Merged, not replaced: the field still inherits whatever defaults the app configures.
            provide: KBQ_FORM_FIELD_DEFAULT_OPTIONS,
            useFactory: () => ({
                ...inject(KBQ_FORM_FIELD_DEFAULT_OPTIONS, { optional: true, skipSelf: true }),
                noBorders: true,
                inOverlay: true
            })
        }
    ],
    host: {
        '(click)': 'handleClick($event)',
        '(keydown)': 'handleKeydown($event)'
    },
    exportAs: 'kbqDropdownSearch'
})
export class KbqDropdownSearch implements AfterContentInit {
    private readonly formField = inject(KBQ_FORM_FIELD);

    /**
     * Panel this field searches. A nested panel declared inside its parent's content shares the view with
     * it, so the parent has to be able to tell which of the projected fields is its own.
     * @docs-private
     */
    readonly panel = inject(KBQ_DROPDOWN_PANEL, { optional: true });

    /** The form control the query is bound to. */
    get ngControl() {
        return this.formField.control().ngControl;
    }

    ngAfterContentInit(): void {
        if (this.formField.control().controlType !== 'input') {
            throwKbqDropdownSearchMissingInputError();
        }

        if (!this.ngControl) {
            throwKbqDropdownSearchMissingNgControlError();
        }
    }

    /** Focuses the search field. */
    focus(): void {
        this.formField.focus();
    }

    /** Clears the search query. */
    reset(): void {
        this.ngControl?.reset();
    }

    /** The current search query. */
    value(): string {
        return this.formField.control().value;
    }

    /** @docs-private */
    protected handleClick(event: MouseEvent): void {
        event.stopPropagation();
    }

    /** @docs-private */
    protected handleKeydown(event: KeyboardEvent): void {
        // The panel owns ESCAPE: the first press clears the query, the second closes the dropdown. This
        // handler runs before the cleaner's own listener on the same element, so the field is already
        // empty by the time the cleaner looks at the key.
        if (event.keyCode === ESCAPE && this.value()) {
            this.reset();
            event.stopPropagation();

            return;
        }

        // A nested panel closes on the horizontal arrow that points back at its trigger, so the key is
        // only kept while the caret still has somewhere to go — the top-level panel ignores it anyway.
        if (this.movesCaret(event)) {
            event.stopPropagation();
        }
    }

    /** Whether the key still has caret to travel inside the field, rather than acting on the panel. */
    private movesCaret(event: KeyboardEvent): boolean {
        const { keyCode, target } = event;

        if (keyCode !== LEFT_ARROW && keyCode !== RIGHT_ARROW) return false;

        // The keydown starts on the input and bubbles to this host, so the target is the field itself.
        const { selectionStart, selectionEnd, value } = target as HTMLInputElement;

        if (selectionStart === null || selectionEnd === null) return true;

        const edge = keyCode === LEFT_ARROW ? 0 : value.length;

        return selectionStart !== edge || selectionEnd !== edge;
    }
}
