import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';

/** @title Form field without borders */
@Component({
    selector: 'form-field-without-borders-example',
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field noBorders>
            <input placeholder="Form field without borders" kbqInput [formControl]="formControl" />
            <kbq-error>Should enter a value</kbq-error>
        </kbq-form-field>
    `,
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithoutBordersExample {
    readonly formControl = new FormControl('', [Validators.required]);
}
