import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select with panelWidth attribute
 */
@Component({
    standalone: true,
    imports: [
        KbqFormFieldModule,
        KbqSelectModule
    ],
    selector: 'select-with-panel-width-attribute-example',
    template: `
        <kbq-form-field>
            <kbq-select [panelWidth]="400" placeholder="Fixed panelWidth">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
                <kbq-cleaner #kbqSelectCleaner />
            </kbq-select>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-select panelWidth="auto" placeholder="Auto panelWidth">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
                <kbq-cleaner #kbqSelectCleaner />
            </kbq-select>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-select placeholder="Without panelWidth attribute">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
                <kbq-cleaner #kbqSelectCleaner />
            </kbq-select>
        </kbq-form-field>
    `,
    styles: [
        `
            :host {
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .kbq-form-field {
                width: 300px;
            }

            .kbq-form-field:not(:last-child) {
                margin-bottom: var(--kbq-size-xl);
            }
        `

    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectWithPanelWidthAttributeExample {
    readonly options = [
        'Option 1',
        'Option with very very very very very very very very very very very very very very very very very very very very very long text',
        'Option 3'
    ];
}
