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
                <kbq-option [value]="null">---</kbq-option>
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-select panelWidth="auto" placeholder="Auto panelWidth">
                <kbq-option [value]="null">---</kbq-option>
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-select placeholder="Without panelWidth attribute">
                <kbq-option [value]="null">---</kbq-option>
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
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
