import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqDivider } from '@koobiq/components/divider';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';

/**
 * @title Description list shared width
 */
@Component({
    selector: 'dl-width-sync-example',
    imports: [KbqDl, KbqDt, KbqDd, KbqDivider],
    template: `
        <kbq-dl resizable [(dtWidth)]="dtWidth">
            <kbq-dt>Incident type</kbq-dt>
            <kbq-dd>Malware infection</kbq-dd>

            <kbq-dt>Identifier</kbq-dt>
            <kbq-dd>INC-2026-125-78253</kbq-dd>

            <kbq-dt>Assignee</kbq-dt>
            <kbq-dd>John Smith</kbq-dd>
        </kbq-dl>

        <kbq-divider />

        <kbq-dl resizable [(dtWidth)]="dtWidth">
            <kbq-dt>Incident type</kbq-dt>
            <kbq-dd>Brute-force attack</kbq-dd>

            <kbq-dt>Identifier</kbq-dt>
            <kbq-dd>INC-2026-13-44357</kbq-dd>

            <kbq-dt>Assignee</kbq-dt>
            <kbq-dd>Jane Doe</kbq-dd>
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
export class DlWidthSyncExample {
    protected readonly dtWidth = model(160);
}
