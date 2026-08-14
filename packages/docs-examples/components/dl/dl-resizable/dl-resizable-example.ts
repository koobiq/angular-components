import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqDlModule } from '@koobiq/components/dl';

/**
 * @title Description list resizable example
 */
@Component({
    selector: 'dl-resizable-example',
    imports: [KbqDlModule, KbqBadgeModule],
    template: `
        <kbq-dl columnResizable>
            <kbq-dt>Incident type</kbq-dt>
            <kbq-dd>
                <kbq-badge badgeColor="fade-error">DDoS</kbq-badge>
            </kbq-dd>
            <kbq-dt>Identifier</kbq-dt>
            <kbq-dd>INC-2026-125-78253</kbq-dd>
            <kbq-dt>Description</kbq-dt>
            <kbq-dd>
                In a distributed denial-of-service attack (DDoS attack), the incoming traffic flooding the victim
                originates from many different sources. More sophisticated strategies are required to mitigate this type
                of attack; simply attempting to block a single source is insufficient as there are multiple sources.
            </kbq-dd>
        </kbq-dl>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DlResizableExample {}
