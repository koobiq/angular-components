import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Form fieldset with button
 */
@Component({
    standalone: true,
    selector: 'form-fieldset-with-button-example',
    template: `
        <kbq-fieldset>
            <legend kbqLegend>
                A long field name that wraps to a new line and is positioned even above the button.
            </legend>

            <kbq-form-field kbqFieldsetItem>
                <input kbqInput />
            </kbq-form-field>

            <button kbq-button kbqFieldsetItem kbqStyle="outline">
                <i kbq-icon="kbq-floppy-disk_16"></i>
                Save
            </button>

            <kbq-hint>
                A long hint text under the field that wraps to a new line and even extends beneath the button.
            </kbq-hint>
        </kbq-fieldset>
    `,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        KbqButtonModule,
        KbqIconModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-row'
    },
    styles: `
        :host {
            margin: var(--kbq-size-m) auto;
            width: 320px;
        }
    `
})
export class FormFieldsetWithButtonExample {}
