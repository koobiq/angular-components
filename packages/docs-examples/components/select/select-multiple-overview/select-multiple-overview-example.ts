import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';

// @ts-ignore
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
    selector: 'select-multiple-overview-example',
    templateUrl: 'select-multiple-overview-example.html',
    styleUrls: ['select-multiple-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class SelectMultipleOverviewExample {
    selected = [];

    options: string[] = [];

    constructor(@Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService) {
        this.localeService.changes
            .subscribe(this.update)
    }

    update = (locale: string) => {
        this.options = localeDataSet[locale].items;
        this.selected = [];
    }
}
