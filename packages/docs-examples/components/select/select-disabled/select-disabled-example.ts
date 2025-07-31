import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select disabled
 */
@Component({
    standalone: true,
    selector: 'select-disabled-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    template: `
        <div class="example-row">
            <div class="kbq-form__label">For select</div>
            <kbq-form-field>
                <kbq-select placeholder="Placeholder" disabled [value]="selected">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </div>

        <div class="example-row">
            <div class="kbq-form__label">For options</div>
            <kbq-form-field>
                <kbq-select placeholder="Placeholder" [value]="selected">
                    @for (option of options; track option; let odd = $odd) {
                        <kbq-option [disabled]="odd" [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </div>

        <div class="example-row">
            <div class="kbq-form__label">For optgroup</div>
            <kbq-form-field>
                <kbq-select placeholder="Placeholder" [value]="selected">
                    @for (group of groups; track group; let odd = $odd) {
                        <kbq-optgroup [label]="group" [disabled]="odd">
                            @for (option of options; track option) {
                                <kbq-option [value]="option">{{ option }}</kbq-option>
                            }
                        </kbq-optgroup>
                    }
                </kbq-select>
            </kbq-form-field>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: `
        .example-row {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            width: 440px;
            margin: 0 auto;
            padding: var(--kbq-size-l);
            gap: var(--kbq-size-xxl);
        }

        .kbq-form-field {
            width: 320px;
        }
    `
})
export class SelectDisabledExample {
    readonly options = Array.from({ length: 5 }).map((_, i) => `Option #${i}`);
    readonly groups = Array.from({ length: 3 }).map((_, i) => `Group #${i}`);
    readonly selected = this.options[0];
}
