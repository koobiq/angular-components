import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select
 */
@Component({
    selector: 'select-overview-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select [value]="selected">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
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

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectOverviewExample {
    readonly options = Array.from({ length: 5 }).map((_, i) => `Option #${i}`);
    readonly selected = this.options[0];
}
