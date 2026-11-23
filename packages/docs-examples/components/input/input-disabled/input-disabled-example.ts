import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Disabled input */
@Component({
    selector: 'input-disabled-example',
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field style="width: 320px">
            <kbq-label>{{ t().empty }}</kbq-label>
            <input kbqInput [placeholder]="t().name" [formControl]="emptyControl" />
        </kbq-form-field>

        <kbq-form-field style="width: 320px">
            <kbq-label>{{ t().filled }}</kbq-label>
            <input kbqInput [formControl]="filledControl" />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-column layout-gap-s layout-align-center-center'
    }
})
export class InputDisabledExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly emptyControl = new FormControl({ value: '', disabled: true });
    protected readonly filledControl = new FormControl({ value: this.t().filledName, disabled: true });
}
