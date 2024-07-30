import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
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
 * @title Prioritized Selected Example
 */
@Component({
    selector: 'select-prioritized-selected-example',
    templateUrl: 'select-prioritized-selected-example.html',
    styleUrls: ['select-prioritized-selected-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class SelectPrioritizedSelectedExample implements OnInit {
    selected: string[];

    defaultOptions: string[];
    options: string[] = [];

    constructor(@Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService) {
        this.localeService.changes.subscribe(this.update);
    }

    update = (locale: string) => {
        this.defaultOptions = localeDataSet[locale].items;
        this.selected = [this.defaultOptions[10], this.defaultOptions[15], this.defaultOptions[20]];
        this.popSelectedOptionsUp();
    };

    ngOnInit() {
        this.popSelectedOptionsUp();
    }

    openedChange(isOpen: boolean) {
        if (!isOpen) {
            this.popSelectedOptionsUp();
        }
    }

    popSelectedOptionsUp(): void {
        const unselected = this.defaultOptions
            .filter((option) => !this.selected.includes(option))
            .sort((a, b) => this.defaultOptions.indexOf(a) - this.defaultOptions.indexOf(b));

        this.options = this.selected.concat(unselected);
    }
}
