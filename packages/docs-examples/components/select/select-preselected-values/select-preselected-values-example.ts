import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Selected preselected values
 */
@Component({
    selector: 'select-preselected-values-example',
    imports: [KbqFormFieldModule, KbqSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <kbq-select placeholder="Placeholder" multiple [formControl]="control">
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
export class SelectPreselectedValuesExample {
    options = Array.from({ length: 15 }).map((_, i) => `Option #${i}`);
    control = new FormControl([this.options.at(0)!, this.options.at(1)!]);

    constructor() {}
}
