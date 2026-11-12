import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Select with panelWidth auto
 */
@Component({
    selector: 'select-with-panel-width-auto-example',
    imports: [
        KbqSelectModule
    ],
    template: `
        <kbq-form-field>
            <kbq-select [placeholder]="t().placeholder" [panelWidth]="'auto'" [(value)]="value">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        .kbq-form-field {
            width: 280px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-l layout-align-center-center layout-row'
    }
})
export class SelectWithPanelWidthAutoExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly options = [
        'Active Scanning',
        'Business Intelligence Gathering',
        'Closed-Source Intelligence',
        'Open-Source Intelligence',
        'Network Infrastructure Recon',
        'User Reconnaissance',
        'Host Reconnaissance'
    ];

    protected readonly value = model(this.options[0]);

    constructor() {
        super(TRANSLATIONS);
    }
}
