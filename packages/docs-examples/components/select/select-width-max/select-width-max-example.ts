import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select width max
 */
@Component({
    standalone: true,
    selector: 'select-width-max-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field>
            <kbq-select [value]="'value-1'" [panelClass]="'select-width-max-example'">
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
            padding: var(--kbq-size-l);
        }

        kbq-form-field {
            width: 280px;
        }

        ::ng-deep .select-width-max-example.kbq-select__panel {
            max-width: 280px;
        }
    `
})
export class SelectWidthMaxExample {}
