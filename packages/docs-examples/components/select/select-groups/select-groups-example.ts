import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select groups
 */
@Component({
    selector: 'select-groups-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select [value]="selected">
                @for (group of groups; track group) {
                    <kbq-optgroup [label]="group">
                        @for (option of options; track option) {
                            <kbq-option [value]="option">{{ option }}</kbq-option>
                        }
                    </kbq-optgroup>
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
export class SelectGroupsExample {
    readonly groups = Array.from({ length: 3 }).map((_, i) => `Group #${i}`);
    readonly options = Array.from({ length: 5 }).map((_, i) => `Option #${i}`);
    readonly selected = this.options[0];
}
