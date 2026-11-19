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
        <span class="kbq-text-normal">{{ t().valid }}</span>
        <kbq-form-field style="width: 320px">
            <input kbqInput [placeholder]="t().name" [formControl]="validControl" />
        </kbq-form-field>

        <span class="kbq-text-normal">{{ t().invalid }}</span>
        <kbq-form-field style="width: 320px">
            <input kbqInput [placeholder]="t().name" [formControl]="invalidControl" />
            <kbq-error>{{ t().required }}</kbq-error>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-gap-s'
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
