import { afterNextRender, ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select validation
 */
@Component({
    standalone: true,
    selector: 'select-validation-example',
    imports: [KbqFormFieldModule, KbqSelectModule, ReactiveFormsModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="kbq-form-vertical layout-column">
            <div class="kbq-form__label">Valid</div>
            <kbq-form-field>
                <kbq-select placeholder="Placeholder">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </div>

        <div class="kbq-form-vertical layout-column">
            <div class="kbq-form__label">Invalid</div>
            <kbq-form-field>
                <kbq-select placeholder="Placeholder" [formControl]="invalidControl">
                    <kbq-option [value]="null">None</kbq-option>
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
    `
})
export class SelectValidationExample {
    readonly options = Array.from({ length: 10 }).map((_, i) => `Option #${i}`);
    readonly invalidControl = new FormControl(null, Validators.required);

    constructor() {
        afterNextRender(() => {
            this.invalidControl.markAsTouched();
            this.invalidControl.updateValueAndValidity();
        });
    }
}
