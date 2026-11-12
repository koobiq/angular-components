import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Form fieldset
 */
@Component({
    selector: 'form-fieldset-overview-example',
    imports: [
        KbqInputModule,
        KbqButtonModule,
        KbqSelectModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-fieldset>
            <legend kbqLegend>{{ text().fieldGroupTitle }}</legend>

            <kbq-form-field style="width: 96px; min-width: 96px">
                <kbq-select panelWidth="auto" [formControl]="control">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">
                            <span [innerHTML]="option"></span>
                        </kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>

            <kbq-form-field kbqFieldsetItem>
                <input kbqInput [placeholder]="text().ipAddress" />
            </kbq-form-field>

            <kbq-hint>
                {{ text().longHint1 }}
            </kbq-hint>
            <kbq-hint>{{ text().hint2 }}</kbq-hint>
        </kbq-fieldset>
    `,
    styles: `
        :host {
            margin: var(--kbq-size-m) auto;
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-row'
    }
})
export class FormFieldsetOverviewExample extends BaseLocalizedExample<ExampleText> {
    options = [
        'https://',
        'http://'
    ];

    control = new FormControl(this.options[0]);

    constructor() {
        super(TEXT);
    }
}
