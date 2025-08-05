import { ChangeDetectionStrategy, Component } from '@angular/core';
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
            <kbq-select>
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
                <kbq-cleaner #kbqSelectCleaner />
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        .kbq-form-field {
            min-width: 104px;
            max-width: 104px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectWithPanelMinWidthExample {
    readonly options = [
        'Scanning',
        'Intel',
        'OSINT',
        'HUMINT',
        'Recon',
        'UserIntel',
        'HostIntel'
    ];
}
