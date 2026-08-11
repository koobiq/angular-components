import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select all with disabled options
 */
@Component({
    selector: 'select-select-all-disabled-example',
    imports: [KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select multiple selectAll placeholder="Placeholder">
                @for (option of options; track option) {
                    <kbq-option [disabled]="$odd" [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .kbq-form-field-type-select {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectSelectAllDisabledExample {
    readonly options = Array.from({ length: 6 }).map((_, i) => `Option #${i}`);
}
