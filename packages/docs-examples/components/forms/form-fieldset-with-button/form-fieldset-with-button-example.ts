import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Form fieldset with button
 */
@Component({
    selector: 'form-fieldset-with-button-example',
    imports: [
        KbqInputModule,
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <kbq-fieldset>
            <legend kbqLegend>
                {{ text().longLegend }}
            </legend>

            <kbq-form-field kbqFieldsetItem>
                <input kbqInput />
            </kbq-form-field>

            <button kbq-button kbqFieldsetItem kbqStyle="outline">
                <i kbq-icon="kbq-floppy-disk_16"></i>
                {{ text().save }}
            </button>

            <kbq-hint>
                {{ text().longHintButton }}
            </kbq-hint>
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
export class FormFieldsetWithButtonExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}
