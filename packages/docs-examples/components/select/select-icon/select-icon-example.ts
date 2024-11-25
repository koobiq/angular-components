import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
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
 * @title Select icon
 */
@Component({
    standalone: true,
    selector: 'select-icon-example',
    imports: [KbqFormFieldModule, KbqSelectModule, KbqIconModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field>
            <kbq-select [(value)]="selected" [placeholder]="'Город'">
                <kbq-select-matcher class="kbq-select__matcher">
                    <i [color]="'contrast-fade'" kbq-icon="kbq-globe_16"></i>
                    <span>
                        <div class="kbq-select__match-container">
                            <span class="kbq-select__matcher-text">
                                {{ selected }}
                            </span>
                        </div>
                    </span>
                    <div class="kbq-select__arrow-wrapper">
                        <i class="kbq-select__arrow" [color]="'contrast-fade'" kbq-icon="kbq-chevron-down-s_16"></i>
                    </div>
                </kbq-select-matcher>
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

            ::ng-deep .kbq-icon {
                margin-right: var(--kbq-size-s);
            }
        }

        kbq-form-field {
            width: 320px;
        }
    `
})
export class SelectIconExample {
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
