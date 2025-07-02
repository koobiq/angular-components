import { afterNextRender, ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Form fieldset
 */
@Component({
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

                @if (form.controls.surname.hasError('required')) {
                    <kbq-error>Surname: error message for the first field</kbq-error>
                }
                @if (form.controls.name.hasError('required')) {
                    <kbq-error>Name: error message for the second field</kbq-error>
                }
                @if (form.controls.patronymic.hasError('required')) {
                    <kbq-error>Patronymic: error message for the third field</kbq-error>
                }
            </kbq-fieldset>
        </form>
    `,
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule
    ],
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-row'
    },
    styles: `
        :host {
            margin: var(--kbq-size-m) auto;
            width: 320px;
        }
    `
})
export class FormFieldsetInvalidExample {
    form = new FormGroup({
        surname: new FormControl('', Validators.required),
        name: new FormControl('', Validators.required),
        patronymic: new FormControl('', Validators.required)
    });

    constructor() {
        afterNextRender(() =>
            Object.values(this.form.controls).forEach((control) => {
                control.markAsTouched();
                control.updateValueAndValidity();
            })
        );
    }
}
