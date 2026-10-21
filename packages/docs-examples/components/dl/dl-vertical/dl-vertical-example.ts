import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Description list vertical
 */
@Component({
    selector: 'dl-vertical-example',
    imports: [KbqDl, KbqDt, KbqDd, KbqToggleModule, FormsModule],
    template: `
        <div class="layout-row layout-align-center-center">
            <kbq-toggle [(ngModel)]="vertical">Vertical</kbq-toggle>
        </div>

        <kbq-dl [vertical]="vertical()">
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
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DlVerticalExample {
    protected readonly vertical = model(true);
}
