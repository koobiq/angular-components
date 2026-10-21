import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';

/**
 * @title Description list vertical breakpoint
 */
@Component({
    selector: 'dl-vertical-breakpoint-example',
    imports: [KbqDl, KbqDt, KbqDd],
    template: `
        <div class="example-container">
            <kbq-dl [verticalBreakpoint]="500">
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
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-l);
        }

        .example-container {
            box-sizing: border-box;
            width: 640px;
            min-width: 240px;
            max-width: 100%;
            padding: var(--kbq-size-l);
            border-radius: var(--kbq-size-border-radius);
            background-color: var(--kbq-background-bg-secondary);
            overflow: auto;
            resize: horizontal;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DlVerticalBreakpointExample {}
