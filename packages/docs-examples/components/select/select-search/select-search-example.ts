import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { KbqHighlightModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

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
            <kbq-select [(value)]="selected" [placeholder]="'Город'">
                <kbq-form-field kbqFormFieldWithoutBorders kbqSelectSearch>
                    <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                    <input [formControl]="searchControl" kbqInput type="text" />
                    <kbq-cleaner />
                </kbq-form-field>

                <div kbq-select-search-empty-result>Ничего не найдено</div>

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
    options = inject<Signal<string[]>>('LOCALIZED_SELECT_OPTIONS_EXAMPLE' as any);

    init(): void {
        this.filteredOptions = merge(
            of(this.options),
            this.searchControl.valueChanges.pipe(map((value) => this.getFilteredOptions(value)))
        );
    }

    private getFilteredOptions(value: any): string[] {
        const searchFilter = value && value.new ? value.value : value;

        return searchFilter
            ? this.options.filter((option) => option.toLowerCase().includes(searchFilter.toLowerCase()))
            : this.options;
    }
}
