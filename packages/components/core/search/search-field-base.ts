import { type AfterContentInit, Directive, inject } from '@angular/core';
import type { NgControl } from '@angular/forms';
import { type KbqSearchFieldPopup, kbqSyncSearchFieldA11y } from '../a11y';
import { KBQ_FORM_FIELD_REF, type KbqFormFieldRef } from '../form-field';
import { ESCAPE } from '../keycodes';
import { kbqInjectA11yLocaleConfiguration } from '../locales';
import { kbqInjectNativeElement } from '../utils';

/**
 * Search field projected into a popup: a `kbq-form-field` whose `kbqInput` is bound to a form control. The field
 * keeps the caret while the arrow keys move a highlight through the popup, which filters itself by the query.
 *
 * Describes the field to assistive technology, and gives the first ESCAPE to the query: it clears a typed query
 * and only an empty field lets the key close the popup. Which other keys stay in the field is up to the subclass.
 *
 * @docs-private
 */
@Directive({
    host: {
        '(keydown)': 'handleKeydown($event)'
    }
})
export abstract class KbqSearchFieldBase implements AfterContentInit {
    /** Form field that holds the search input. */
    protected formField: KbqFormFieldRef = inject(KBQ_FORM_FIELD_REF);

    /** Attribute that marks the field, named by the errors a misconfigured field throws. */
    protected abstract readonly directiveName: string;

    /** The form control the query is bound to. */
    get ngControl(): NgControl | null {
        return this.formField.control().ngControl;
    }

    constructor() {
        this.formField.inOverlay.set(true);

        const localeConfiguration = kbqInjectA11yLocaleConfiguration();

        kbqSyncSearchFieldA11y(
            kbqInjectNativeElement(),
            () => this.getSearchFieldPopup(),
            () => localeConfiguration().search
        );
    }

    ngAfterContentInit(): void {
        if (this.formField.control().controlType !== 'input') {
            this.throwSetupError('must be applied to a kbq-form-field containing an input[kbqInput]');
        }

        if (!this.ngControl) {
            this.throwSetupError('the input must be bound to a form control');
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
    value(): unknown {
        return this.formField.control().value();
    }

    /** @docs-private */
    protected handleKeydown(event: KeyboardEvent): void {
        // The cleaner of the form field may clear on ESCAPE too, from its own listener on the same element. This
        // one runs first, so the cleaner finds the field already empty.
        if (event.keyCode === ESCAPE && this.value()) {
            this.reset();
            event.stopPropagation();

            return;
        }

        if (this.keepsKey(event)) {
            event.stopPropagation();
        }
    }

    /** Popup the field filters, as the field describes it to assistive technology. */
    protected abstract getSearchFieldPopup(): KbqSearchFieldPopup | null | undefined;

    /** Whether the key edits the query, so the popup must not see it. ESCAPE is handled before this is asked. */
    protected abstract keepsKey(event: KeyboardEvent): boolean;

    private throwSetupError(problem: string): never {
        throw Error(`${this.directiveName}: ${problem}.
    Example:
      <kbq-form-field ${this.directiveName}>
          <input kbqInput [formControl]="control" />
      </kbq-form-field>`);
    }
}
