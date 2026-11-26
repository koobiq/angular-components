import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import type { ErrorStateMatcher } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSlider } from '@koobiq/components/slider';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Invalid slider value */
@Component({
    selector: 'slider-invalid-example',
    imports: [KbqFormFieldModule, KbqSlider, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().label }}</kbq-label>
            <kbq-slider showTooltip [max]="60" [formControl]="timeout" [errorStateMatcher]="showError" />
            <kbq-error>{{ t().error(limit) }}</kbq-error>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: block;
            width: min(100%, 320px);
            margin: auto;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderInvalidExample {
    protected readonly limit = 45;
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly timeout = new FormControl(50, { nonNullable: true, validators: Validators.max(this.limit) });
    protected readonly showError: ErrorStateMatcher = { isErrorState: (control) => !!control?.invalid };
}
