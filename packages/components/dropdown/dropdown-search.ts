import { AfterContentInit, Directive, inject } from '@angular/core';
import { END, ESCAPE, HOME, LEFT_ARROW, RIGHT_ARROW, SPACE } from '@koobiq/components/core';
import {
    KBQ_FORM_FIELD,
    KBQ_FORM_FIELD_DEFAULT_OPTIONS,
    kbqCleanerFactoryProvider
} from '@koobiq/components/form-field';
import {
    throwKbqDropdownSearchMissingInputError,
    throwKbqDropdownSearchMissingNgControlError
} from './dropdown-errors';

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
        },
        // The panel owns ESCAPE: the first press clears the query, the second closes the dropdown.
        kbqCleanerFactoryProvider(() => {
            const formField = inject(KBQ_FORM_FIELD);

            return {
                get control() {
                    return formField.control();
                },
                get keydownTarget() {
                    return formField.elementRef.nativeElement;
                },
                clearByEscape: false
            };
        })
    ],
    host: {
        '(click)': 'handleClick($event)',
        '(keydown)': 'handleKeydown($event)'
    },
    exportAs: 'kbqDropdownSearch'
})
export class KbqDropdownSearch implements AfterContentInit {
    private readonly formField = inject(KBQ_FORM_FIELD);

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
    value() {
        return this.formField.control().value;
    }

    /** @docs-private */
    protected handleClick(event: MouseEvent): void {
        event.stopPropagation();
    }

    /** @docs-private */
    protected handleKeydown(event: KeyboardEvent): void {
        if (event.keyCode === ESCAPE && this.value()) {
            this.reset();
            event.stopPropagation();

            return;
        }

        // Keys the panel would otherwise act on while the caret is in the field. Vertical arrows,
        // ENTER and TAB are deliberately left to the panel.
        if ([SPACE, HOME, END, LEFT_ARROW, RIGHT_ARROW].includes(event.keyCode)) {
            event.stopPropagation();
        }
    }
}
