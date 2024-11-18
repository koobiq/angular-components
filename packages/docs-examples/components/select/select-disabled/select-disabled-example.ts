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
    template: `
        <div class="layout-row">
            <div class="kbq-form__label">Для селекта</div>
            <kbq-form-field style="width: 320px">
                <kbq-select
                    [(value)]="selected"
                    [disabled]="true"
                    [placeholder]="'Город'"
                >
                    @for (option of options; track option) {
                        <kbq-option [value]="option">
                            <span [innerHTML]="option"></span>
                        </kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </div>
        <div class="layout-row">
            <div class="kbq-form__label">Для значений</div>
            <kbq-form-field style="width: 320px">
                <kbq-select
                    [(value)]="selected"
                    [placeholder]="'Город'"
                >
                    @for (option of options; track option; let i = $index) {
                        <kbq-option
                            [value]="option"
                            [disabled]="i % 2 !== 0"
                        >
                            <span [innerHTML]="option"></span>
                        </kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </div>
    `,
    styles: `
        .layout-row {
            width: 400px;
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
