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

        <kbq-form-field style="width: 70%;">
            <kbq-select placeholder="Placeholder">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
                <kbq-cleaner #kbqSelectCleaner />
            </kbq-select>
        </kbq-form-field>
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
