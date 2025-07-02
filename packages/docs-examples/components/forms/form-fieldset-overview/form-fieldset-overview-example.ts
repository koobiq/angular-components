import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqOptionModule, PasswordValidators } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Form fieldset
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'form-fieldset-overview-example',
    template: `
        <kbq-fieldset>
            <legend kbqLegend>Тест</legend>

            <kbq-form-field style="width: 96px; min-width: 96px">
                <kbq-select [formControl]="control" panelWidth="auto">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">
                            <span [innerHTML]="option"></span>
                        </kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>

            <kbq-form-field kbqFieldsetItem>
                <input kbqInput placeholder="IP-address" />
            </kbq-form-field>

            <kbq-form-field kbqFieldsetItem>
                <input [formControl]="passwordControl" placeholder="Password" kbqInputPassword />

                <kbq-password-toggle />
            </kbq-form-field>

            <kbq-hint>
                Hint for the first field. A long hint text below the field that wraps to a new line and spans the full
                width of the group
            </kbq-hint>
            <kbq-hint>Hint for the second field</kbq-hint>
        </kbq-fieldset>
    `,
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        KbqButtonModule,
        KbqOptionModule,
        KbqSelectModule,
        ReactiveFormsModule
    ]
})
export class FormFieldsetOverviewExample {
    options = [
        'https://',
        'http://'
    ];

    control = new FormControl(this.options[0], Validators.required);

    readonly passwordControl = new FormControl('', [
        Validators.required,
        PasswordValidators.minLength(8),
        PasswordValidators.minUppercase(2),
        PasswordValidators.minLowercase(2),
        PasswordValidators.minNumber(2),
        PasswordValidators.minSpecial(2)]);
}
