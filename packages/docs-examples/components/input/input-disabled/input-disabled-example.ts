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
        <span class="kbq-text-normal">{{ t().empty }}</span>
        <kbq-form-field style="width: 320px">
            <input kbqInput [placeholder]="t().name" [formControl]="emptyControl" />
        </kbq-form-field>

        <span class="kbq-text-normal">{{ t().filled }}</span>
        <kbq-form-field style="width: 320px">
            <input kbqInput [formControl]="filledControl" />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-gap-s'
    }
})
export class InputDisabledExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly emptyControl = new FormControl({ value: '', disabled: true });
    protected readonly filledControl = new FormControl({ value: this.t().filledName, disabled: true });
}
