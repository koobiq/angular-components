import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';

/**
 * @title Description list resizable
 */
@Component({
    selector: 'dl-resizable-example',
    imports: [KbqDl, KbqDt, KbqDd],
    template: `
        <kbq-dl resizable>
            <kbq-dt>Incident type</kbq-dt>
            <kbq-dd>Malware infection</kbq-dd>

            <kbq-dt>Identifier</kbq-dt>
            <kbq-dd>INC-2026-125-78253</kbq-dd>

            <kbq-dt>Status</kbq-dt>
            <kbq-dd>New</kbq-dd>

            <kbq-dt>Assignee</kbq-dt>
            <kbq-dd>John Smith</kbq-dd>

            <kbq-dt>Description</kbq-dt>
            <kbq-dd>
                An employee opened an attachment in a phishing email, and the file ran malicious code on the
                workstation.
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
export class DlResizableExample {}
