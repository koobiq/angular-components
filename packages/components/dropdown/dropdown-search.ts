import { Directive, inject } from '@angular/core';
import { KbqSearchFieldBase, type KbqSearchFieldPopup, LEFT_ARROW, RIGHT_ARROW } from '@koobiq/components/core';
import { KBQ_FORM_FIELD_DEFAULT_OPTIONS } from '@koobiq/components/form-field';
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
        '(click)': 'handleClick($event)'
    },
    exportAs: 'kbqDropdownSearch'
})
export class KbqDropdownSearch extends KbqSearchFieldBase {
    protected readonly directiveName = 'kbqDropdownSearch';

    /**
     * Panel this field searches. A nested panel declared inside its parent's content shares the view with
     * it, so the parent has to be able to tell which of the projected fields is its own.
     *
     * @docs-private
     */
    readonly panel = inject(KBQ_DROPDOWN_PANEL, { optional: true });

    /** The current text of the dropdown's search input. */
    override value(): string {
        return super.value() as string;
    }

    /** @docs-private */
    protected handleClick(event: MouseEvent): void {
        event.stopPropagation();
    }

    protected getSearchFieldPopup(): KbqSearchFieldPopup | undefined {
        return this.panel?.searchFieldPopup;
    }

    /**
     * A nested panel closes on the horizontal arrow that points back at its trigger, so the key is only kept while
     * the caret still has somewhere to go — the top-level panel ignores it anyway.
     */
    protected keepsKey(event: KeyboardEvent): boolean {
        const { keyCode, target } = event;

        if (keyCode !== LEFT_ARROW && keyCode !== RIGHT_ARROW) return false;

        // The keydown starts on the input and bubbles to this host, so the target is the field itself.
        const { selectionStart, selectionEnd, value } = target as HTMLInputElement;

        if (selectionStart === null || selectionEnd === null) return true;

        const edge = keyCode === LEFT_ARROW ? 0 : value.length;

        return selectionStart !== edge || selectionEnd !== edge;
    }
}
