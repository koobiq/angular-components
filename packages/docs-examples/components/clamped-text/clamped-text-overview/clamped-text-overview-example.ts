import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqClampedText } from '@koobiq/components/clamped-text';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Clamped-text overview
 */
@Component({
    selector: 'clamped-text-overview-example',
    imports: [KbqClampedText],
    template: `
        <div class="layout-margin-bottom-l">
            <kbq-clamped-text>
                {{ t().ddosText }}
            </kbq-clamped-text>
        </div>
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
export class ClampedTextOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
