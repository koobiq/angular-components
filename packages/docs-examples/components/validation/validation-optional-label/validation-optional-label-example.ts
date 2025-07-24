import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Validation optional label
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'validation-optional-label-example',
    template: `
        <div class="layout-margin" style="width: 320px">
            <form class="kbq-form-vertical" [formGroup]="form" novalidate>
                <div class="kbq-form__fieldset">
                    <div class="kbq-form__row">
                        <div class="kbq-form__label">Name</div>
                        <kbq-form-field class="kbq-form__control">
                            <input formControlName="firstName" kbqInput />
                        </kbq-form-field>
                    </div>

                    <div class="kbq-form__row">
                        <div class="kbq-form__label">Last name</div>
                        <kbq-form-field class="kbq-form__control">
                            <input formControlName="lastName" kbqInput />
                        </kbq-form-field>
                    </div>

                    <div class="kbq-form__row">
                        <div class="kbq-form__label">Patronymic</div>
                        <kbq-form-field class="kbq-form__control">
                            <input formControlName="patronymic" kbqInput placeholder="Optional" />
                        </kbq-form-field>
                    </div>

                    <div class="kbq-form__row">
                        <button class="flex-25" color="contrast" kbq-button type="submit">Send</button>
                    </div>
                </div>
            </form>
        </div>
    `,
    imports: [KbqFormFieldModule, ReactiveFormsModule, KbqInputModule, KbqButtonModule, KbqFormsModule],
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ValidationOptionalLabelExample {
    protected readonly form = new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        patronymic: new FormControl('')
    });
}
