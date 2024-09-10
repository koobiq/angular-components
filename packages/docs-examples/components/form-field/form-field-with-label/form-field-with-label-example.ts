import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components-experimental/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/** @title Form field with kbq-label */
@Component({
    standalone: true,
    selector: 'form-field-with-label-example',
    imports: [
        KbqFormFieldModule,
        KbqInputModule
    ],
    template: `
        <kbq-form-field>
            <kbq-label>Form field label</kbq-label>
            <input kbqInput />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithLabelExample {}
