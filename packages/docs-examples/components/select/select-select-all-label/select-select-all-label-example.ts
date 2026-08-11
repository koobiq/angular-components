import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select all label
 */
@Component({
    selector: 'select-select-all-label-example',
    imports: [KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select #select="kbqSelect" multiple selectAll placeholder="Placeholder" [value]="selected">
                <!-- Projected only while everything is selected, so the rest of the time the select falls
                     back to its default trigger and lists the selected options as usual. -->
                @if (select.allOptionsSelected) {
                    <kbq-select-trigger>All options</kbq-select-trigger>
                }

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

        .kbq-form-field-type-select {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectSelectAllLabelExample {
    readonly options = Array.from({ length: 6 }).map((_, i) => `Option ${i + 1}`);
    readonly selected = [...this.options];
}
