import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqClampedText } from '@koobiq/components/clamped-text';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectExampleText } from '../l10n';

/**
 * @title Clamped-text external state
 */
@Component({
    selector: 'clamped-text-external-state-example',
    imports: [FormsModule, KbqClampedText, KbqToggleModule],
    template: `
        <div class="layout-margin-bottom-l">
            <kbq-clamped-text [(isCollapsed)]="collapsed">
                {{ text().ddosText }}
            </kbq-clamped-text>
        </div>

        <kbq-toggle [(ngModel)]="collapsed">{{ text().collapsed }}</kbq-toggle>
    `,
    styles: `
        :host > div {
            overflow: auto;
            resize: horizontal;
            max-width: 100%;
            min-width: 150px;
            padding: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClampedTextExternalStateExample {
    protected readonly text = injectExampleText();

    protected readonly collapsed = model(false);
}
