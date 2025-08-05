import { ChangeDetectionStrategy, Component, model } from '@angular/core';
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
            <kbq-select [panelClass]="'example-select-panel-height'" [(value)]="value">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        ::ng-deep .example-select-panel-height.kbq-select__panel {
            --kbq-select-panel-size-max-height: 500px;
        }

        :host {
            display: flex;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 320px;
        }
    `
})
export class SelectHeightExample {
    readonly options = Array.from({ length: 10 }).map((_, i) => `Option #${i + 1}`);
    protected readonly value = model(this.options[0]);
}
