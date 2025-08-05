import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select with panelWidth auto
 */
@Component({
    standalone: true,
    imports: [
        KbqFormFieldModule,
        KbqSelectModule
    ],
    selector: 'select-with-panel-width-auto-example',
    template: `
        <kbq-form-field>
            <kbq-select placeholder="Placeholder" [panelWidth]="'auto'">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
                <kbq-cleaner #kbqSelectCleaner />
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        .kbq-form-field {
            width: 280px;
        }
    `,
    host: {
        class: 'layout-margin-l layout-align-center-center layout-row'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectWithPanelWidthAutoExample {
    readonly options = [
        'Active Scanning',
        'Business Intelligence Gathering',
        'Closed-Source Intelligence',
        'Open-Source Intelligence',
        'Network Infrastructure Recon',
        'User Reconnaissance',
        'Host Reconnaissance'
    ];
}
