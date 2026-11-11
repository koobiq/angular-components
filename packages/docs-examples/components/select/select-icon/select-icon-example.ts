import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectExampleText } from '../l10n';

/**
 * @title Select icon
 */
@Component({
    selector: 'select-icon-example',
    imports: [KbqSelectModule, KbqIconModule],
    template: `
        <kbq-form-field>
            <i kbqPrefix color="contrast-fade" kbq-icon="kbq-globe_16"></i>
            <kbq-select [(value)]="selected">
                <kbq-select-matcher class="kbq-select__matcher">
                    <div class="kbq-select__match-container">
                        <span class="kbq-select__matcher-text">
                            {{ selected }}
                        </span>
                    </div>
                    <div class="kbq-select__arrow-wrapper">
                        <i class="kbq-select__arrow" color="contrast-fade" kbq-icon="kbq-chevron-down-s_16"></i>
                    </div>
                </kbq-select-matcher>
                @for (option of options(); track option) {
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

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectIconExample {
    protected readonly text = injectExampleText();

    readonly options = computed(() => Array.from({ length: 5 }, (_, i) => this.text().optionN(i)));
    selected = this.options[0];
}
