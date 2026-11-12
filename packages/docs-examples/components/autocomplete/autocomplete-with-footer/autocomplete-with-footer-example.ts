import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqHighlightBackgroundPipe } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLink } from '@koobiq/components/link';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Autocomplete with footer
 */
@Component({
    selector: 'autocomplete-with-footer-example',
    imports: [
        KbqAutocompleteModule,
        KbqInputModule,
        ReactiveFormsModule,
        KbqLink,
        KbqHighlightBackgroundPipe
    ],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().label }}</kbq-label>
            <kbq-hint>{{ t().withFooterHint }}</kbq-hint>
            <input
                #trigger="kbqAutocompleteTrigger"
                kbqInput
                [formControl]="control"
                [kbqAutocomplete]="autocomplete"
            />
            <kbq-autocomplete #autocomplete="kbqAutocomplete">
                @for (option of filteredOptions(); track option) {
                    <kbq-option [value]="option">
                        <span [innerHTML]="option | kbqHighlightBackground: control.value"></span>
                    </kbq-option>
                }
                <kbq-autocomplete-footer>
                    <a kbqLink external (click)="trigger.closePanel()">{{ t().link }}</a>
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
export class AutocompleteWithFooterExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly options = computed(() => Array.from({ length: 100 }, (_, i) => 'Option #' + (i + 1)));
    readonly control = new FormControl('');
    readonly filteredOptions = toSignal(
        this.control.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            map((value) =>
                this.options().filter((option) => option.toLowerCase().includes((value ?? '').toLowerCase()))
            )
        ),
        { initialValue: this.options() }
    );

    constructor() {
        super(TRANSLATIONS);
    }
}
