import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { merge, Observable, of } from 'rxjs';
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
 * @title Basic Select
 */
@Component({
    selector: 'select-search-overview-example',
    templateUrl: 'select-search-overview-example.html',
    styleUrls: ['select-search-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class SelectSearchOverviewExample {
    options: string[] = [];
    selected = [];

    searchControl: FormControl = new FormControl();
    filteredOptions: Observable<string[]>;


    constructor(@Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService) {
        this.localeService.changes
            .subscribe(this.update)
    }

    update = (locale: string) => {
        this.options = localeDataSet[locale].items;
        this.selected = [];

        this.init();
    }

    init(): void {
        this.filteredOptions = merge(
            of(this.options),
            this.searchControl.valueChanges
                .pipe(map((value) => this.getFilteredOptions(value)))
        );
    }

    private getFilteredOptions(value: any): string[] {
        const searchFilter = (value && value.new) ? value.value : value;

        return searchFilter
            ? this.options.filter((option) =>
                option.toLowerCase().includes((searchFilter.toLowerCase())))
            : this.options;
    }
}
