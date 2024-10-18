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
            <kbq-label>Label</kbq-label>
            <kbq-select placeholder="Option">
                <kbq-option [value]="null">None</kbq-option>
                <kbq-option value="option1">Option 1</kbq-option>
                <kbq-option value="option2">Option 2</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithLabelExample {}
