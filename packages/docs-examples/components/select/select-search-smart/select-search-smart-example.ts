import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { createSearchPredicate, KbqHighlightModule, tokenizeSearchQuery } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule, kbqSelectOptionsProvider } from '@koobiq/components/select';
import { map, startWith } from 'rxjs/operators';

/**
 * @title Select smart search
 */
@Component({
    selector: 'select-search-smart-example',
    imports: [
        KbqSelectModule,
        KbqIconModule,
        KbqInputModule,
        AsyncPipe,
        ReactiveFormsModule,
        KbqHighlightModule
    ],
    template: `
        <kbq-form-field>
            <kbq-select multiline placeholder="Placeholder">
                <kbq-form-field noBorders kbqSelectSearch>
                    <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                    <input kbqInput type="text" [formControl]="searchControl" />
                    <kbq-cleaner />
                </kbq-form-field>

                <div kbq-select-search-empty-result>Nothing found</div>

                @for (option of filteredOptions | async; track option) {
                    <kbq-option [value]="option">
                        <span [innerHTML]="option | kbqHighlightBackground: searchTokens : true"></span>
                    </kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .kbq-form-field-type-select {
            width: 320px;
        }
    `,
    providers: [
        kbqSelectOptionsProvider({ searchMinOptionsThreshold: 0 })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectSearchSmartExample {
    readonly options = [
        '10.125.123.0/24 - all',
        '10.125.10.0/24 - admin',
        '10.125.11.0/24 - guest',
        '172.16.0.0/16 - office',
        '192.168.1.0/24 - lab',
        '192.168.1.0/24 - Йота',
        'Café Wi-Fi guest network'
    ];

    readonly searchControl = new FormControl();
    readonly filteredOptions = this.searchControl.valueChanges.pipe(
        startWith(''),
        map((query) => this.search(query))
    );

    protected searchTokens: string[] = [];

    private search(query: string | null): string[] {
        this.searchTokens = tokenizeSearchQuery(query ?? '');

        return this.options.filter(createSearchPredicate(query ?? ''));
    }
}
