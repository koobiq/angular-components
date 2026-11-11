import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { injectExampleText } from './l10n';

/**
 * @title Description list term width
 */
@Component({
    selector: 'dl-dt-width-example',
    imports: [KbqDl, KbqDt, KbqDd],
    template: `
        <kbq-dl [dtWidth]="120">
            <kbq-dt>{{ text().incidentType }}</kbq-dt>
            <kbq-dd>{{ text().malwareInfection }}</kbq-dd>

            <kbq-dt>{{ text().identifier }}</kbq-dt>
            <kbq-dd>INC-2026-125-78253</kbq-dd>

            <kbq-dt>{{ text().status }}</kbq-dt>
            <kbq-dd>{{ text().new }}</kbq-dd>

            <kbq-dt>{{ text().assignee }}</kbq-dt>
            <kbq-dd>John Smith</kbq-dd>

            <kbq-dt>{{ text().description }}</kbq-dt>
            <kbq-dd>
                {{ text().phishingDescription }}
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
export class DlDtWidthExample {
    protected readonly text = injectExampleText();
}
