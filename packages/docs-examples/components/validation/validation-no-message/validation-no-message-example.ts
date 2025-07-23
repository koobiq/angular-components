import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Validation no message
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'validation-no-message-example',
    template: `
        <form class="kbq-form-vertical" [formGroup]="form" novalidate style="width: 320px">
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>Address</kbq-label>
                        <input formControlName="first" kbqInput />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <kbq-form-field>
                        <kbq-label>Comment</kbq-label>
                        <input formControlName="last" kbqInput />
                    </kbq-form-field>
                </div>

                <div class="kbq-form__row">
                    <button class="flex-25" color="contrast" kbq-button type="submit">Send</button>
                </div>
            </div>
        </form>
    `,
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqButtonModule,
        KbqFormsModule
    ],
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ValidationNoMessageExample {
    protected readonly form = new FormGroup({
        first: new FormControl('', [Validators.required]),
        last: new FormControl('')
    });
}
