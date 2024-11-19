import { Component, Inject } from '@angular/core';
import { KBQ_LOCALE_SERVICE, KbqFormsModule, KbqLocaleService } from '@koobiq/components/core';
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
 * @title Select validation
 */
@Component({
    standalone: true,
    selector: 'select-validation-example',
    imports: [KbqFormFieldModule, KbqSelectModule, KbqFormsModule],
    template: `
        <div class="kbq-form-vertical layout-column">
            <div class="kbq-form__label">Valid</div>
            <kbq-form-field>
                <kbq-select
                    [(value)]="selected"
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
        <div class="kbq-form-vertical layout-column">
            <div class="kbq-form__label">Invalid</div>
            <kbq-form-field class="kbq-form-field_invalid">
                <kbq-select
                    [(value)]="selected"
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
    `,
    styles: `
        :host {
            display: flex;
            gap: 16px;
        }

        .layout-column {
            width: 50%;
        }

        .kbq-form__label {
            color: var(--kbq-foreground-contrast-secondary);
        }
    `
})
export class SelectValidationExample {
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
