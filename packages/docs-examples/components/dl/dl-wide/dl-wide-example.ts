import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Description list wide
 */
@Component({
    selector: 'dl-wide-example',
    imports: [KbqDl, KbqDt, KbqDd],
    template: `
        <kbq-dl wide>
            <kbq-dt>{{ t().incidentType }}</kbq-dt>
            <kbq-dd>{{ t().malwareInfection }}</kbq-dd>

            <kbq-dt>{{ t().identifier }}</kbq-dt>
            <kbq-dd>INC-2026-125-78253</kbq-dd>

            <kbq-dt>{{ t().status }}</kbq-dt>
            <kbq-dd>{{ t().new }}</kbq-dd>

            <kbq-dt>{{ t().assignee }}</kbq-dt>
            <kbq-dd>John Smith</kbq-dd>

            <kbq-dt>{{ t().description }}</kbq-dt>
            <kbq-dd>
                {{ t().phishingDescription }}
            </kbq-dd>
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
export class DlWideExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
