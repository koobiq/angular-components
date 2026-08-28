import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import {
    createSearchPredicate,
    KbqFormsModule,
    KbqHighlightBackgroundPipe,
    tokenizeSearchQuery
} from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

/**
 * @title Autocomplete smart search
 */
@Component({
    selector: 'autocomplete-search-smart-example',
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
                <label class="kbq-form__label">
                    Try
                    <strong>republic african</strong>
                    or
                    <strong>korea south</strong>
                </label>
                <kbq-form-field>
                    <input kbqInput type="text" [formControl]="control" [kbqAutocomplete]="auto" />

                    <kbq-autocomplete #auto="kbqAutocomplete">
                        @for (option of filteredOptions | async; track option) {
                            <kbq-option [value]="option">
                                <span [innerHTML]="option | kbqHighlightBackground: searchTokens"></span>
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
export class AutocompleteSearchSmartExample implements OnInit {
    options = [
        'United Kingdom',
        'United Arab Emirates',
        'United States',
        'South Africa',
        'South Korea',
        'North Korea',
        'Central African Republic',
        'Dominican Republic',
        "Cote d'Ivoire",
        'Costa Rica'
    ];

    control = new FormControl('');
    filteredOptions: Observable<string[]>;
    protected searchTokens: string[] = [];

    ngOnInit(): void {
        this.filteredOptions = this.control.valueChanges.pipe(
            startWith(''),
            map((value) => this.filter(value as string))
        );
    }

    private filter(value: string): string[] {
        this.searchTokens = tokenizeSearchQuery(value ?? '');

        return this.options.filter(createSearchPredicate(value ?? ''));
    }
}
