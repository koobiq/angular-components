import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
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
    selector: 'select-overview-example',
    templateUrl: 'select-overview-example.html',
    styleUrls: ['select-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class SelectOverviewExample {
    selected = '';

    options: string[] = [];

    constructor(@Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService) {
        this.localeService.changes.subscribe((e) => this.update(e));
    }

    update = (locale: string) => {
        this.options = localeDataSet[locale].items;
        this.selected = '';
    };
}
