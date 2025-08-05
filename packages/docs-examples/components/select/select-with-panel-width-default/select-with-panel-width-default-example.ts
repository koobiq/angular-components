import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select with panelWidth default
 */
@Component({
    standalone: true,
    imports: [
        KbqFormFieldModule,
        KbqSelectModule
    ],
    selector: 'select-with-panel-width-default-example',
    template: `
        <kbq-form-field>
            <kbq-select placeholder="Placeholder">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
                <kbq-cleaner #kbqSelectCleaner />
            </kbq-select>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-select placeholder="Placeholder">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
                <kbq-cleaner #kbqSelectCleaner />
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        .kbq-form-field:first-of-type {
            min-width: 384px;
            max-width: 384px;
        }

        .kbq-form-field:last-of-type {
            min-width: 200px;
            max-width: 200px;
        }
    `,
    host: {
        class: 'layout-margin-l layout-align-center-center layout-row layout-gap-l'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectWithPanelWidthDefaultExample {
    readonly options = [
        'Use of Alternate Authentication Data',
        'Use of Command-Line Interpreters and Scripts',
        'Use of XSL Scripts',
        'System Owner or User Discovery',
        'Permission Group Discovery'
    ];
}
