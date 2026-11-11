import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectExampleText } from '../l10n';

/**
 * @title select-custom-matcher
 */
@Component({
    selector: 'select-custom-matcher-example',
    imports: [KbqSelectModule, KbqButtonModule],
    template: `
        <kbq-select
            #select="kbqSelect"
            [tabIndex]="-1"
            [class]="{ 'kbq-select': false, 'my-custom-select': true }"
            [(value)]="selected"
        >
            <button kbq-button kbq-select-matcher>
                {{ select.triggerValue }}

                <i class="layout-padding-left-3xs" kbq-icon="kbq-chevron-down-s_16"></i>
            </button>

            @for (option of options(); track option) {
                <kbq-option [value]="option">{{ option }}</kbq-option>
            }
        </kbq-select>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .my-custom-select {
            outline: none;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectCustomMatcherExample {
    protected readonly text = injectExampleText();

    readonly options = computed(() => Array.from({ length: 5 }, (_, i) => this.text().optionN(i)));
    readonly selected = this.options[0];
}
