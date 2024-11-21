import { Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select width max
 */
@Component({
    standalone: true,
    selector: 'select-width-max-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    template: `
        <kbq-form-field style="width: 280px">
            <kbq-select
                [value]="'value-1'"
                [panelClass]="'select-width-max-example'"
            >
                <kbq-option [value]="'value-1'">Активное сканирование</kbq-option>
                <kbq-option [value]="'value-2'">Сбор бизнес-информации об организации</kbq-option>
                <kbq-option [value]="'value-3'">Сбор информации из закрытых источников</kbq-option>
                <kbq-option [value]="'value-4'">Сбор информации из общедоступных источников</kbq-option>
                <kbq-option [value]="'value-5'">Сбор информации о сетевой инфраструктуре</kbq-option>
                <kbq-option [value]="'value-6'">Сбор информации об атакуемых пользователях</kbq-option>
                <kbq-option [value]="'value-6'">Сбор информации об атакуемых узлах</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: 16px;
        }

        ::ng-deep .select-width-max-example .kbq-select__content {
            max-width: 280px;
        }
    `
})
export class SelectWidthMaxExample {}
