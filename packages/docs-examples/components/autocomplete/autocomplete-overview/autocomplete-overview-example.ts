import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqFormsModule, KbqHighlightBackgroundPipe } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TRANSLATIONS } from './l10n';

/**
 * @title Autocomplete
 */
@Component({
    selector: 'autocomplete-overview-example',
    imports: [
        KbqAutocompleteModule,
        KbqInputModule,
        ReactiveFormsModule,
        AsyncPipe,
        KbqFormsModule,
        KbqHighlightBackgroundPipe
    ],
    template: `
        <div class="kbq-form kbq-form-vertical">
            <div class="kbq-form__row">
                <label class="kbq-form__label">{{ t().enterCountries }}</label>
                <kbq-form-field>
                    <input kbqInput type="text" [formControl]="control" [kbqAutocomplete]="auto" />

                    <kbq-autocomplete #auto="kbqAutocomplete">
                        @for (option of filteredOptions | async; track option) {
                            <kbq-option [value]="option">
                                <span [innerHTML]="option | kbqHighlightBackground: control.value"></span>
                            </kbq-option>
                        }
                    </kbq-autocomplete>

                    <kbq-cleaner />
                </kbq-form-field>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteOverviewExample implements OnInit {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly options = computed(() => this.t().countries);

    control = new FormControl('');
    filteredOptions: Observable<string[]>;

    ngOnInit(): void {
        this.filteredOptions = this.control.valueChanges.pipe(
            startWith(''),
            map((value) => this.filter(value as string))
        );
    }

    private filter(value: string): string[] {
        const filterValue = value ? value.toLowerCase() : '';

        return this.options().filter((option) => option.toLowerCase().includes(filterValue));
    }
}
