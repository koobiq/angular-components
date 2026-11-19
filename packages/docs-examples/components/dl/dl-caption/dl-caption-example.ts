import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDd, KbqDl, KbqDt, KbqDtCaption } from '@koobiq/components/dl';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Description list caption
 */
@Component({
    selector: 'dl-caption-example',
    imports: [KbqDl, KbqDt, KbqDtCaption, KbqDd],
    template: `
        <kbq-dl>
            <kbq-dt>
                {{ t().incidentType }}
                <span kbqDtCaption>incident.type</span>
            </kbq-dt>
            <kbq-dd>{{ t().malwareInfection }}</kbq-dd>

            <kbq-dt>
                {{ t().identifier }}
                <span kbqDtCaption>incident.id</span>
            </kbq-dt>
            <kbq-dd>INC-2026-125-78253</kbq-dd>

            <kbq-dt>
                {{ t().description }}
                <span kbqDtCaption>incident.desc</span>
            </kbq-dt>
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
export class DlCaptionExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
