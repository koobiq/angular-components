import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

/**
 * @title Autocomplete with footer
 */
@Component({
    selector: 'autocomplete-with-footer-example',
    imports: [KbqFormFieldModule, KbqAutocompleteModule, KbqInputModule, ReactiveFormsModule, KbqLinkModule],
    template: `
        <kbq-form-field>
            <kbq-label>Label</kbq-label>
            <kbq-hint>Autocomplete with footer</kbq-hint>
            <input
                #trigger="kbqAutocompleteTrigger"
                kbqInput
                [formControl]="control"
                [kbqAutocomplete]="autocomplete"
            />
            <kbq-autocomplete #autocomplete="kbqAutocomplete">
                @for (option of filteredOptions(); track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
                <kbq-autocomplete-footer>
                    <a class="kbq-link_external" kbq-link (click)="trigger.closePanel()">
                        <span class="kbq-link__text">Link</span>
                        <i kbq-icon="kbq-north-east_16"></i>
                    </a>
                </kbq-autocomplete-footer>
            </kbq-autocomplete>
            <kbq-cleaner />
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteWithFooterExample {
    readonly options = Array.from({ length: 100 }, (_, i) => `Option ${i + 1}`);
    readonly control = new FormControl('');
    readonly filteredOptions = toSignal(
        this.control.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            map((value) => this.options.filter((option) => option.toLowerCase().includes((value ?? '').toLowerCase())))
        ),
        { initialValue: this.options }
    );
}
