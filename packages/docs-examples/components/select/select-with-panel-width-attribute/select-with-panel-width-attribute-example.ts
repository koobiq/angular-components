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
        <div>
            <label class="kbq-form__label">Fixed panelWidth</label>
            <kbq-form-field>
                <kbq-select [panelWidth]="400">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                    <kbq-cleaner #kbqSelectCleaner />
                </kbq-select>
            </kbq-form-field>
        </div>

        <div>
            <label class="kbq-form__label">Auto panelWidth</label>
            <kbq-form-field>
                <kbq-select panelWidth="auto">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                    <kbq-cleaner #kbqSelectCleaner />
                </kbq-select>
            </kbq-form-field>
        </div>

        <div>
            <label class="kbq-form__label">Without panelWidth attribute</label>
            <kbq-form-field>
                <kbq-select>
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                    <kbq-cleaner #kbqSelectCleaner />
                </kbq-select>
            </kbq-form-field>
        </div>
    `,
    styles: [
        `
            :host {
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            div {
                width: 300px;
            }

            div:not(:last-child) {
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
