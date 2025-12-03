import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select with panelWidth fixed
 */
@Component({
    selector: 'select-with-panel-width-fixed-example',
    imports: [
        KbqFormFieldModule,
        KbqSelectModule
    ],
    template: `
        <kbq-form-field>
            <kbq-select placeholder="Placeholder" [panelWidth]="400" [(value)]="value">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-l layout-align-center-center layout-row'
    }
})
export class SelectWithPanelWidthFixedExample {
    readonly options = [
        'Active Scanning',
        'Business Intelligence Gathering',
        'Closed-Source Intelligence',
        'Open-Source Intelligence',
        'Network Infrastructure Recon',
        'User Reconnaissance',
        'Host Reconnaissance'
    ];

    protected readonly value = model(this.options[1]);
}
