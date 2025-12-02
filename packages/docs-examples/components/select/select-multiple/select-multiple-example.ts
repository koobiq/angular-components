import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select multiple
 */
@Component({
    selector: 'select-multiple-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select multiple placeholder="Placeholder" [value]="selected">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }

                <kbq-cleaner #kbqSelectCleaner />
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectMultipleExample {
    readonly options = Array.from({ length: 10 }).map((_, i) => `Option #${i}`);
    readonly selected = this.options.slice(0, 3);
}
