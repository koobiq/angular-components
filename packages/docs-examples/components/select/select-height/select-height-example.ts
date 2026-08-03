import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select height
 */
@Component({
    selector: 'select-height-example',
    imports: [KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-label>panelMaxHeight</kbq-label>
            <kbq-select [panelMaxHeight]="500" [(value)]="value">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>--kbq-select-panel-size-max-height</kbq-label>
            <kbq-select [panelClass]="'example-select-panel-height'" [(value)]="themedValue">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        /* The same height set through the design token on a class passed via panelClass. */
        ::ng-deep .example-select-panel-height.kbq-select__panel {
            --kbq-select-panel-size-max-height: 500px;
        }

        :host {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectHeightExample {
    readonly options = Array.from({ length: 10 }).map((_, i) => `Option #${i + 1}`);
    protected readonly value = model(this.options[0]);
    protected readonly themedValue = model(this.options[0]);
}
