import { afterNextRender, ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqSelectModule } from '@koobiq/components/select';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Select validation
 */
@Component({
    selector: 'select-validation-example',
    imports: [KbqSelectModule, ReactiveFormsModule],
    template: `
        <div class="kbq-form-vertical layout-column">
            <div class="kbq-form__label">Valid</div>
            <kbq-form-field>
                <kbq-select [placeholder]="t().placeholder">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </div>

        <div class="kbq-form-vertical layout-column">
            <div class="kbq-form__label">{{ t().invalid }}</div>
            <kbq-form-field>
                <kbq-select [placeholder]="t().placeholder" [formControl]="invalidControl">
                    <kbq-option [value]="null">{{ t().none }}</kbq-option>
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            gap: var(--kbq-size-l);
        }

        .kbq-form-vertical {
            width: 50%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectValidationExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly options = Array.from({ length: 10 }, (_, i) => 'Option #' + i);
    readonly invalidControl = new FormControl(null, Validators.required);

    constructor() {
        super(TRANSLATIONS);
        afterNextRender(() => {
            this.invalidControl.markAsTouched();
            this.invalidControl.updateValueAndValidity();
        });
    }
}
