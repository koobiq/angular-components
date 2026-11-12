import { afterNextRender, ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Form fieldset
 */
@Component({
    selector: 'form-fieldset-invalid-example',
    imports: [
        ReactiveFormsModule,
        KbqInputModule
    ],
    template: `
        <form [formGroup]="form">
            <kbq-fieldset>
                <kbq-form-field kbqFieldsetItem>
                    <input kbqInput [placeholder]="t().surname" [formControl]="form.controls.surname" />
                </kbq-form-field>

                <kbq-form-field kbqFieldsetItem>
                    <input kbqInput [placeholder]="t().name" [formControl]="form.controls.name" />
                </kbq-form-field>

                <kbq-form-field kbqFieldsetItem>
                    <input kbqInput [placeholder]="t().patronymic" [formControl]="form.controls.patronymic" />
                </kbq-form-field>

                @if (form.controls.surname.hasError('required')) {
                    <kbq-error>{{ t().errorMessage(t().surname, t().first) }}</kbq-error>
                }
                @if (form.controls.name.hasError('required')) {
                    <kbq-error>{{ t().errorMessage(t().name, t().second) }}</kbq-error>
                }
                @if (form.controls.patronymic.hasError('required')) {
                    <kbq-error>{{ t().errorMessage(t().patronymic, t().third) }}</kbq-error>
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
    host: {
        class: 'layout-row'
    }
})
export class FormFieldsetInvalidExample extends BaseLocalizedExample<ExampleTranslation> {
    form = new FormGroup({
        surname: new FormControl('', Validators.required),
        name: new FormControl('', Validators.required),
        patronymic: new FormControl('', Validators.required)
    });

    constructor() {
        super(TRANSLATIONS);
        afterNextRender(() =>
            Object.values(this.form.controls).forEach((control) => {
                control.markAsTouched();
                control.updateValueAndValidity();
            })
        );
    }
}
