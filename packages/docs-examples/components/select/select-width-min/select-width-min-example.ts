import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components-experimental/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select width min
 */
@Component({
    standalone: true,
    selector: 'select-width-min-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field>
            <kbq-select [value]="'hair-1'" [panelClass]="'select-width-min-example'">
                <kbq-option [value]="'hair-1'">Блондин</kbq-option>
                <kbq-option [value]="'hair-2'">Русый</kbq-option>
                <kbq-option [value]="'hair-3'">Шатен</kbq-option>
                <kbq-option [value]="'hair-4'">Брюнет</kbq-option>
                <kbq-option [value]="'hair-5'">Рыжий</kbq-option>
                <kbq-option [value]="'hair-6'">Седой</kbq-option>
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
            width: 104px;
        }

        ::ng-deep .select-width-min-example.kbq-select__panel {
            min-width: 200px;
        }
    `
})
export class SelectWidthMinExample {}
