import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadge } from '@koobiq/components/badge';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Description list alignment
 */
@Component({
    selector: 'dl-alignment-example',
    imports: [KbqDl, KbqDt, KbqDd, KbqBadge],
    template: `
        <kbq-dl verticalAlign="center">
            <kbq-dt>{{ t().severity }}</kbq-dt>
            <kbq-dd>
                <kbq-badge badgeColor="fade-error">{{ t().critical }}</kbq-badge>
            </kbq-dd>

            <kbq-dt>{{ t().status }}</kbq-dt>
            <kbq-dd>
                <kbq-badge compact badgeColor="fade-theme">{{ t().new }}</kbq-badge>
            </kbq-dd>

            <kbq-dt>{{ t().tags }}</kbq-dt>
            <kbq-dd>
                <div class="layout-row layout-wrap layout-gap-xxs">
                    <kbq-badge>{{ t().tagPhishing }}</kbq-badge>
                    <kbq-badge>{{ t().tagMalware }}</kbq-badge>
                    <kbq-badge>{{ t().tagWorkstation }}</kbq-badge>
                </div>
            </kbq-dd>

            <kbq-dt>{{ t().identifier }}</kbq-dt>
            <kbq-dd>INC-2026-125-78253</kbq-dd>
        </kbq-dl>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DlAlignmentExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}
