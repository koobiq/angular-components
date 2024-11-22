import { Component, Inject, OnInit } from '@angular/core';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';
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
 * @title Selected prioritized selected
 */
@Component({
    standalone: true,
    selector: 'select-prioritized-selected-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select [(value)]="selected" [multiple]="true" (openedChange)="openedChange($event)">
                @for (option of options; track option) {
                    <kbq-option [value]="option">
                        <span [innerHTML]="option"></span>
                    </kbq-option>
                }

                <kbq-cleaner #kbqSelectCleaner />
            </kbq-select>
        </kbq-form-field>
    `
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
