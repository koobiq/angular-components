import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components-experimental/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/** @title Form field with kbq-hint */
@Component({
    standalone: true,
    selector: 'form-field-with-hint-example',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-label>Form field with hint</kbq-label>
            <input
                [formControl]="formControl"
                [maxlength]="maxLength"
                kbqInput
                placeholder="Enter {{ maxLength }} characters"
            />
            @if (count < 5) {
                <kbq-hint>Entered: {{ count }} of {{ maxLength }}</kbq-hint>
            } @else {
                <kbq-hint color="success">Success</kbq-hint>
            }
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithHintExample {
    readonly formControl = new FormControl();
    readonly maxLength = 6;

    get count(): number {
        return this.formControl.value?.length || 0;
    }
}
