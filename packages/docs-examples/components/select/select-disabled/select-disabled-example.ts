import { Component, Inject } from '@angular/core';
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
 * @title Select disabled
 */
@Component({
    standalone: true,
    selector: 'select-disabled-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    templateUrl: 'select-disabled-example.html',
    styles: `
        .layout-row {
            width: 440px;
            margin: 0 auto;
            padding: 16px;
            align-items: center;
            gap: 24px;
            justify-content: flex-end;
        }

        .kbq-form__label {
            white-space: nowrap;
            color: var(--kbq-foreground-contrast-secondary);
        }
    `
})
export class SelectDisabledExample {
    selected = '';

    options: string[] = [];

    constructor(@Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService) {
        this.localeService.changes.subscribe(this.update);
    }

    update = (locale: string) => {
        this.options = localeDataSet[locale].items;
        this.selected = localeDataSet[locale].items[0];
    };
}