import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title select two line option
 */
@Component({
    selector: 'select-two-line-option-example',
    imports: [KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select multiple [value]="selected">
                @for (option of options; track option) {
                    <kbq-option [value]="option" [viewValue]="option">
                        <div>{{ option }}</div>
                        <div class="kbq-option-caption">caption</div>
                    </kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectTwoLineOptionExample {
    readonly options = Array.from({ length: 5 }).map((_, i) => `Option #${i}`);
    readonly selected = [this.options[0]];
}
