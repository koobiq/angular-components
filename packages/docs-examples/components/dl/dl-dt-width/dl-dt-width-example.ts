import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Description list term width
 */
@Component({
    selector: 'dl-dt-width-example',
    imports: [KbqDl, KbqDt, KbqDd],
    template: `
        <kbq-dl [dtWidth]="120">
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
export class DlDtWidthExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}
