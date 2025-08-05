import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select with panelWidth min-width
 */
@Component({
    standalone: true,
    imports: [
        KbqFormFieldModule,
        KbqSelectModule
    ],
    selector: 'select-with-panel-min-width-example',
    template: `
        <kbq-form-field>
            <kbq-select [(value)]="value">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        .kbq-form-field {
            min-width: 104px;
            max-width: 104px;
        }
    `,
    host: {
        class: 'layout-margin-l layout-align-center-center layout-row'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectWithPanelMinWidthExample {
    readonly options = [
        'HUMINT',
        'HostIntel',
        'Intel',
        'OSINT',
        'Recon',
        'Scanning',
        'UserIntel'
    ];

    protected readonly value = model(this.options[0]);
}
