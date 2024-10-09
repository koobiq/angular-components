import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components-experimental/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/** @title Form field with kbq-label */
@Component({
    standalone: true,
    selector: 'form-field-with-label-example',
    imports: [
        KbqFormFieldModule,
        KbqSelectModule
    ],
    template: `
        <kbq-form-field>
            <kbq-label>Select an option</kbq-label>
            <kbq-select placeholder="Select an option">
                <kbq-option value="option">Option</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithLabelExample {}
