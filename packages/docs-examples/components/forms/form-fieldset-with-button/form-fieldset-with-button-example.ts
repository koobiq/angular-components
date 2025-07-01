import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Form fieldset with button
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'form-fieldset-with-button-example',
    template: `
        <kbq-fieldset>
            <kbq-form-field kbqFieldsetItem>
                <input kbqInput />
            </kbq-form-field>

            <button kbq-button kbqFieldsetItem kbqStyle="outline">
                <i kbq-icon="kbq-floppy-disk_16"></i>
                Save
            </button>
        </kbq-fieldset>
    `,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        KbqButtonModule,
        KbqIconModule
    ]
})
export class FormFieldsetWithButtonExample {}
