import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select groups
 */
@Component({
    selector: 'select-groups-example',
    imports: [KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select [value]="selected">
                @for (group of groups(); track group) {
                    <kbq-optgroup [label]="group">
                        @for (option of options(); track option) {
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
    readonly groups = computed(() => Array.from({ length: 3 }, (_, i) => 'Group #' + i));
    readonly options = computed(() => Array.from({ length: 5 }, (_, i) => 'Option #' + i));
    readonly selected = this.options[0];
}
