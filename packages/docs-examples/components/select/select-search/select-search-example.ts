import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KBQ_LOCALE_SERVICE, KbqHighlightModule, KbqLocaleService } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { Observable, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { enUSLocaleDataSet } from '../en-US';
import { esLALocaleDataSet } from '../es-LA';
import { faIRLocaleDataSet } from '../fa-IR';
import { ptBRLocaleDataSet } from '../pt-BR';
import { ruRULocaleDataSet } from '../ru-RU';
import { zhCNLocaleDataSet } from '../zh-CN';

const localeDataSet = {
    'en-US': enUSLocaleDataSet,
    'zh-CN': zhCNLocaleDataSet,
    'es-LA': esLALocaleDataSet,
    'pt-BR': ptBRLocaleDataSet,
    'ru-RU': ruRULocaleDataSet,
    'fa-IR': faIRLocaleDataSet
};

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
    options: string[] = [];
    selected = '';

    searchControl: FormControl = new FormControl();
    filteredOptions: Observable<string[]>;

    constructor(@Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService) {
        this.localeService.changes.subscribe(this.update);
    }

    update = (locale: string) => {
        this.options = localeDataSet[locale].items;
        this.selected = localeDataSet[locale].items[0];

        this.init();
    };

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
