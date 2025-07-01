import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';

/** @title Form field with kbq-cleaner */
@Component({
    standalone: true,
    selector: 'form-field-with-cleaner-example',
    imports: [KbqFormFieldModule, KbqInputModule, KbqSelectModule, ReactiveFormsModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field class="layout-margin-bottom-m">
            <input [formControl]="inputFormControl" kbqInput placeholder="Enter some input" />
            <kbq-cleaner />
        </kbq-form-field>

        <kbq-form-field>
            <kbq-select [formControl]="selectFormControl" placeholder="Select an option">
                <kbq-cleaner #kbqSelectCleaner />
                <kbq-option value="1">Option #1</kbq-option>
                <kbq-option value="2">Option #2</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithCleanerExample {
    readonly inputFormControl = new FormControl('This field can be cleaned');
    readonly selectFormControl = new FormControl('1');
}
