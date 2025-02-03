import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select height
 */
@Component({
    standalone: true,
    selector: 'select-height-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field>
            <kbq-select [(value)]="selected" [panelClass]="'select-height-example'">
                @for (option of options; track option) {
                    <kbq-option [value]="option">
                        <span [innerHTML]="option"></span>
                    </kbq-option>
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

        kbq-form-field {
            width: 320px;
        }

        ::ng-deep .select-height-example.kbq-select__panel {
            --kbq-select-panel-size-max-height: 392px;
        }
    `
})
export class SelectHeightExample {
    options = inject<Signal<string[]>>('LOCALIZED_SELECT_OPTIONS_EXAMPLE' as any);
}
