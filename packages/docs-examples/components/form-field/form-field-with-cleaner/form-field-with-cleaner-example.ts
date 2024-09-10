import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components-experimental/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/** @title Form field with kbq-cleaner */
@Component({
    standalone: true,
    selector: 'form-field-with-cleaner-example',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-label>Form field with cleaner</kbq-label>
            <input
                [formControl]="formControl"
                kbqInput
                placeholder="Enter some input"
            />
            <kbq-cleaner />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithCleanerExample {
    readonly formControl = new FormControl('This field can be cleaned');
}
