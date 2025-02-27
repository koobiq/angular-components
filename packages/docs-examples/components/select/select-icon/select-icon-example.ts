import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select icon
 */
@Component({
    standalone: true,
    selector: 'select-icon-example',
    imports: [KbqFormFieldModule, KbqSelectModule, KbqIconModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field>
            <kbq-select [(value)]="selected">
                <kbq-select-matcher class="kbq-select__matcher">
                    <i color="contrast-fade" kbq-icon="kbq-globe_16"></i>
                    <span>
                        <div class="kbq-select__match-container">
                            <span class="kbq-select__matcher-text">
                                {{ selected }}
                            </span>
                        </div>
                    </span>
                    <div class="kbq-select__arrow-wrapper">
                        <i class="kbq-select__arrow" color="contrast-fade" kbq-icon="kbq-chevron-down-s_16"></i>
                    </div>
                </kbq-select-matcher>
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

            ::ng-deep .kbq-icon {
                margin-right: var(--kbq-size-s);
            }
        }

        .kbq-form-field {
            width: 320px;
        }
    `
})
export class SelectIconExample {
    readonly options = Array.from({ length: 5 }).map((_, i) => `Option #${i}`);
    readonly selected = this.options[0];
}
