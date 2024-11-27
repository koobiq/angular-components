import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
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
 * @title Select height
 */
@Component({
    standalone: true,
    selector: 'select-height-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field>
            <kbq-select [(value)]="selected" [panelClass]="'select-height-example'">
                @for (option of options; track option) {
                    <kbq-option [value]="option">
                        <span [innerHTML]="option"></span>
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

        kbq-form-field {
            width: 320px;
        }

        ::ng-deep .select-height-example .kbq-select__content {
            max-height: 392px;
            box-sizing: border-box;
        }
    `
})
export class SelectHeightExample {
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
