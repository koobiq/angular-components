import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/** @title Form field without borders */
@Component({
    standalone: true,
    selector: 'form-field-without-borders-example',
    imports: [KbqFormFieldModule, KbqInputModule, ReactiveFormsModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field noBorders>
            <input [formControl]="formControl" placeholder="Form field without borders" kbqInput />
            <kbq-error>Should enter a value</kbq-error>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithoutBordersExample {
    readonly formControl = new FormControl('', [Validators.required]);
}
