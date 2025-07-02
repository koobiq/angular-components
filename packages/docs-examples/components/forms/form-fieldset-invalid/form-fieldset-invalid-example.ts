import { afterNextRender, ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Form fieldset
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'form-fieldset-invalid-example',
    template: `
        <form [formGroup]="form">
            <kbq-fieldset>
                <kbq-form-field kbqFieldsetItem>
                    <input [formControl]="form.controls.surname" kbqInput placeholder="Surname" />
                </kbq-form-field>

                <kbq-form-field kbqFieldsetItem>
                    <input [formControl]="form.controls.name" kbqInput placeholder="Name" />
                </kbq-form-field>

                <kbq-form-field kbqFieldsetItem>
                    <input [formControl]="form.controls.patronymic" kbqInput placeholder="Patronymic" />
                </kbq-form-field>

                <kbq-error>Surname: error message for the first field</kbq-error>
                <kbq-error>Name: error message for the second field</kbq-error>
                <kbq-error>Patronymic: error message for the third field</kbq-error>
            </kbq-fieldset>
        </form>
    `,
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqSelectModule
    ],
    providers: [
        {
            provide: ErrorStateMatcher,
            useValue: { isErrorState: () => true } satisfies ErrorStateMatcher
        }
    ]
})
export class FormFieldsetInvalidExample {
    options = [
        'https://',
        'http://'
    ];

    form = new FormGroup({
        surname: new FormControl(null, Validators.required),
        name: new FormControl(null, Validators.required),
        patronymic: new FormControl(null, Validators.required)
    });

    constructor() {
        afterNextRender(() => this.form.updateValueAndValidity());
    }
}
