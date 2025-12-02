import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select with panelWidth default
 */
@Component({
    selector: 'select-with-panel-width-default-example',
    imports: [
        KbqFormFieldModule,
        KbqSelectModule
    ],
    template: `
        <kbq-form-field>
            <kbq-select placeholder="Placeholder" [(value)]="valueFirst">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-select placeholder="Placeholder" [(value)]="valueSecond">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        .kbq-form-field:first-of-type {
            min-width: 68%;
            max-width: 68%;
        }

        .kbq-form-field:last-of-type {
            min-width: 32%;
            max-width: 32%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-l layout-align-center-center layout-row layout-gap-l'
    }
})
export class SelectWithPanelWidthDefaultExample {
    readonly options = [
        'Use of Alternate Authentication Data',
        'Use of Command-Line Interpreters and Scripts',
        'Use of XSL Scripts',
        'System Owner or User Discovery',
        'Permission Group Discovery'
    ];

    protected readonly valueFirst = model(this.options[0]);
    protected readonly valueSecond = model(this.options[1]);
}
