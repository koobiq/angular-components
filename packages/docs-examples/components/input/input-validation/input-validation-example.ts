import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Input validation */
@Component({
    selector: 'input-validation-example',
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field style="width: 320px">
            <kbq-label>{{ t().valid }}</kbq-label>
            <input kbqInput [placeholder]="t().name" [formControl]="validControl" />
        </kbq-form-field>

        <kbq-form-field style="width: 320px">
            <kbq-label>{{ t().invalid }}</kbq-label>
            <input kbqInput [placeholder]="t().name" [formControl]="invalidControl" />
            <kbq-error>{{ t().required }}</kbq-error>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-column layout-gap-s layout-align-center-center'
    }
})
export class InputValidationExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly validControl = new FormControl('');
    protected readonly invalidControl = new FormControl('', Validators.required);

    constructor() {
        this.invalidControl.markAsTouched();
    }
}
