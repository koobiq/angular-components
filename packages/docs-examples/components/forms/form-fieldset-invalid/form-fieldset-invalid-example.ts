import { afterNextRender, ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Form fieldset
 */
@Component({
    selector: 'form-fieldset-invalid-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule
    ],
    template: `
        <form [formGroup]="form">
            <kbq-fieldset>
                <kbq-form-field kbqFieldsetItem>
                    <input kbqInput placeholder="Surname" [formControl]="form.controls.surname" />
                </kbq-form-field>

                <kbq-form-field kbqFieldsetItem>
                    <input kbqInput placeholder="Name" [formControl]="form.controls.name" />
                </kbq-form-field>

                <kbq-form-field kbqFieldsetItem>
                    <input kbqInput placeholder="Patronymic" [formControl]="form.controls.patronymic" />
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
    styles: `
        :host {
            margin: var(--kbq-size-m) auto;
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ],
    host: {
        class: 'layout-row'
    }
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
