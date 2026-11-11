import { afterNextRender, ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectExampleText } from './l10n';

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
                <kbq-select [placeholder]="text().placeholder">
                    @for (option of options(); track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </div>

        <div class="kbq-form-vertical layout-column">
            <div class="kbq-form__label">{{ text().invalid }}</div>
            <kbq-form-field>
                <kbq-select [placeholder]="text().placeholder" [formControl]="invalidControl">
                    <kbq-option [value]="null">{{ text().none }}</kbq-option>
                    @for (option of options(); track option) {
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
export class SelectValidationExample {
    protected readonly text = injectExampleText();

    readonly options = computed(() => Array.from({ length: 10 }, (_, i) => 'Option #' + i));
    readonly invalidControl = new FormControl(null, Validators.required);

    constructor() {
        afterNextRender(() => {
            this.invalidControl.markAsTouched();
            this.invalidControl.updateValueAndValidity();
        });
    }
}
