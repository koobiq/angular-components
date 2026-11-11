import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectExampleText } from '../l10n';

/**
 * @title select-custom-trigger
 */
@Component({
    selector: 'select-custom-trigger-example',
    imports: [KbqSelectModule],
    template: `
        <kbq-select #select="kbqSelect" [(value)]="selected">
            <ng-container kbq-select-trigger>custom trigger {{ select.triggerValue }}</ng-container>

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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectCustomTriggerExample {
    protected readonly text = injectExampleText();

    readonly options = computed(() => Array.from({ length: 5 }, (_, i) => 'Option #' + i));
    readonly selected = this.options[0];
}
