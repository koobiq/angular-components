import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqHighlightModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { map, startWith } from 'rxjs/operators';

/**
 * @title Select search
 */
@Component({
    standalone: true,
    selector: 'select-search-example',
    imports: [
        KbqFormFieldModule,
        KbqSelectModule,
        KbqIconModule,
        KbqInputModule,
        AsyncPipe,
        ReactiveFormsModule,
        KbqHighlightModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field>
            <kbq-select placeholder="Placeholder">
                <kbq-form-field kbqFormFieldWithoutBorders kbqSelectSearch>
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
            padding: var(--kbq-size-l);
        }

        .kbq-form-field-type-select {
            width: 320px;
        }
    `
})
export class SelectSearchExample {
    readonly options = Array.from({ length: 10 }).map((_, i) => `Option #${i}`);
    readonly searchControl = new FormControl();
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
