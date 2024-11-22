import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select width
 */
@Component({
    standalone: true,
    selector: 'select-width-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field style="width: 100%">
            <kbq-select [value]="options[2]">
                @for (option of options; track option) {
                    <kbq-option [value]="option">
                        <span [innerHTML]="option"></span>
                    </kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
        <kbq-form-field style="width: 200px">
            <kbq-select [value]="options[1]">
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
            gap: 16px;
            padding: 16px;
        }
    `
})
export class SelectWidthExample {
    options = [
        'Администратор (admin)',
        'Иван Иванов (iivanov)',
        'Иннокентий Смоктуновский (ke$ha)',
        'Ирина Краева (ikraeva)',
        'Константин Константинопольский (kostya)',
        'Роман Кравченко (nagibator666)',
        'Роман Туров (rturov)',
        'Руслан Боярский (rus777lan)'
    ];
}
