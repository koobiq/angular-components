import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadge } from '@koobiq/components/badge';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';

/**
 * @title Description list alignment
 */
@Component({
    selector: 'dl-alignment-example',
    imports: [KbqDl, KbqDt, KbqDd, KbqBadge],
    template: `
        <kbq-dl verticalAlign="center">
            <kbq-dt>Severity</kbq-dt>
            <kbq-dd>
                <kbq-badge badgeColor="fade-error">Critical</kbq-badge>
            </kbq-dd>

            <kbq-dt>Status</kbq-dt>
            <kbq-dd>
                <kbq-badge compact badgeColor="fade-theme">New</kbq-badge>
            </kbq-dd>

            <kbq-dt>Tags</kbq-dt>
            <kbq-dd>
                <div class="layout-row layout-wrap layout-gap-xxs">
                    <kbq-badge>Phishing</kbq-badge>
                    <kbq-badge>Malware</kbq-badge>
                    <kbq-badge>Workstation</kbq-badge>
                </div>
            </kbq-dd>

            <kbq-dt>Identifier</kbq-dt>
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
export class DlAlignmentExample {}
