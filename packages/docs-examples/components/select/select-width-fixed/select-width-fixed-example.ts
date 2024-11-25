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
 * @title Select width fixed
 */
@Component({
    standalone: true,
    selector: 'select-width-fixed-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field>
            <kbq-select [value]="'value-1'" [panelClass]="'select-width-fixed-example'">
                <kbq-option [value]="'value-1'">Использование альтернативных данных для аутентификации</kbq-option>
                <kbq-option [value]="'value-2'">Использование альтернативных данных для аутентификации</kbq-option>
                <kbq-option [value]="'value-3'">Использование альтернативных данных для аутентификации</kbq-option>
                <kbq-option [value]="'value-4'">Использование интерпретаторов командной строки и сценариев</kbq-option>
                <kbq-option [value]="'value-5'">Использование сценариев XSL</kbq-option>
                <kbq-option [value]="'value-6'">Исследование владельца или пользователей системы</kbq-option>
                <kbq-option [value]="'value-6'">Исследование групп разрешений</kbq-option>
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
            width: 280px;
        }

        ::ng-deep .select-width-fixed-example.kbq-select__panel {
            width: 420px;
        }
    `
})
export class SelectWidthFixedExample {
    selected = '';

    options: string[] = [];

    constructor(@Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService) {
        this.localeService.changes.subscribe(this.update);
    }

    update = (locale: string) => {
        this.options = localeDataSet[locale].items;
        this.selected = '';
    };
}
