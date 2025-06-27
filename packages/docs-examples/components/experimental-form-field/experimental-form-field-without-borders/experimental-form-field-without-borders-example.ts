import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components-experimental/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/** @title Form field without borders */
@Component({
    standalone: true,
    selector: 'experimental-form-field-without-borders-example',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field noBorders>
            <input [formControl]="formControl" placeholder="Form field without borders" kbqInput />
            <kbq-error>Should enter a value</kbq-error>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentalFormFieldWithoutBordersExample {
    readonly formControl = new FormControl('', [Validators.required]);
}
