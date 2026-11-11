import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadge } from '@koobiq/components/badge';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { injectExampleText } from '../l10n';

/**
 * @title Description list alignment
 */
@Component({
    selector: 'dl-alignment-example',
    imports: [KbqDl, KbqDt, KbqDd, KbqBadge],
    template: `
        <kbq-dl verticalAlign="center">
            <kbq-dt>{{ text().severity }}</kbq-dt>
            <kbq-dd>
                <kbq-badge badgeColor="fade-error">{{ text().critical }}</kbq-badge>
            </kbq-dd>

            <kbq-dt>{{ text().status }}</kbq-dt>
            <kbq-dd>
                <kbq-badge compact badgeColor="fade-theme">{{ text().new }}</kbq-badge>
            </kbq-dd>

            <kbq-dt>{{ text().tags }}</kbq-dt>
            <kbq-dd>
                <div class="layout-row layout-wrap layout-gap-xxs">
                    <kbq-badge>{{ text().tagPhishing }}</kbq-badge>
                    <kbq-badge>{{ text().tagMalware }}</kbq-badge>
                    <kbq-badge>{{ text().tagWorkstation }}</kbq-badge>
                </div>
            </kbq-dd>

            <kbq-dt>{{ text().identifier }}</kbq-dt>
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
export class DlAlignmentExample {
    protected readonly text = injectExampleText();
}
