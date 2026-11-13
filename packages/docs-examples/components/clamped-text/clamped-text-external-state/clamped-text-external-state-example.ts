import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqClampedText } from '@koobiq/components/clamped-text';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Clamped-text external state
 */
@Component({
    selector: 'clamped-text-external-state-example',
    imports: [FormsModule, KbqClampedText, KbqToggleModule],
    template: `
        <div class="layout-margin-bottom-l">
            <kbq-clamped-text [(isCollapsed)]="collapsed">
                {{ t().ddosText }}
            </kbq-clamped-text>
        </div>

        <kbq-toggle [(ngModel)]="collapsed">{{ t().collapsed }}</kbq-toggle>
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
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly collapsed = model(false);
}
