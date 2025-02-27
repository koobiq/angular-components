import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select validation
 */
@Component({
    standalone: true,
    selector: 'select-validation-example',
    imports: [KbqFormFieldModule, KbqSelectModule, KbqFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="kbq-form-vertical layout-column">
            <div class="kbq-form__label">Valid</div>
            <kbq-form-field>
                <kbq-select [value]="selected">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </div>

        <div class="kbq-form-vertical layout-column">
            <div class="kbq-form__label">Invalid</div>
            <kbq-form-field class="kbq-form-field_invalid">
                <kbq-select [value]="selected">
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

        .kbq-form__label {
            color: var(--kbq-foreground-contrast-secondary);
        }
    `
})
export class SelectValidationExample {
    readonly options = Array.from({ length: 10 }).map((_, i) => `Option #${i}`);
    readonly selected = this.options[0];
}
