import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqHighlightPipe } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { map, startWith } from 'rxjs/operators';

/**
 * @title Highlight in select
 */
@Component({
    selector: 'highlight-select-example',
    imports: [
        KbqSelectModule,
        KbqIconModule,
        KbqInputModule,
        AsyncPipe,
        ReactiveFormsModule,
        KbqHighlightPipe
    ],
    template: `
        <kbq-form-field>
            <kbq-select placeholder="Choose a club">
                <kbq-form-field noBorders kbqSelectSearch>
                    <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                    <input kbqInput type="text" [formControl]="searchControl" />
                    <kbq-cleaner />
                </kbq-form-field>

                <div kbq-select-search-empty-result>Nothing found</div>

                @for (option of filteredOptions | async; track option) {
                    <kbq-option [value]="option">
                        <span [innerHTML]="option | mcHighlight: searchControl.value"></span>
                    </kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
        }

        .kbq-form-field-type-select {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HighlightSelectExample {
    readonly options = [
        'Manchester United',
        'Manchester 62 FC',
        'FC United of Manchester',
        'Manchester United Reserves',
        'Manchester United U23',
        'Manchester United U19',
        'Manchester United Academy',
        'Manchester United Women (W)'
    ];
    readonly searchControl = new FormControl('');
    readonly filteredOptions = this.searchControl.valueChanges.pipe(
        startWith(''),
        map((query) => this.search(query))
    );

    private search(query: string | null): string[] {
        return query
            ? this.options.filter((option) => option.toLowerCase().includes(query.toLowerCase()))
            : this.options;
    }
}
