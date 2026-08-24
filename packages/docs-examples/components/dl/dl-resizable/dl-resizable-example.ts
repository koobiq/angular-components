import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqDivider } from '@koobiq/components/divider';
import { KbqDlModule } from '@koobiq/components/dl';

/**
 * @title Description list resizable example
 */
@Component({
    selector: 'dl-resizable-example',
    imports: [KbqDlModule, KbqBadgeModule, KbqDivider],
    template: `
        @let dtMinWidth = 100;
        @let ddMinWidth = 200;

        <kbq-dl resizable [dtMinWidth]="dtMinWidth" [ddMinWidth]="ddMinWidth" [(dtWidth)]="dtWidth">
            <kbq-dt>Incident type</kbq-dt>
            <kbq-dd>
                <kbq-badge badgeColor="fade-error">DDoS</kbq-badge>
            </kbq-dd>
            <kbq-dt>Identifier</kbq-dt>
            <kbq-dd>INC-2026-125-78253</kbq-dd>
            <kbq-dt>Description</kbq-dt>
            <kbq-dd>
                In a distributed denial-of-service attack (DDoS attack), the incoming traffic flooding the victim
                originates from many different sources.
            </kbq-dd>
        </kbq-dl>

        <kbq-divider />

        <kbq-dl resizable [dtMinWidth]="dtMinWidth" [ddMinWidth]="ddMinWidth" [(dtWidth)]="dtWidth">
            <kbq-dt>Incident type</kbq-dt>
            <kbq-dd>
                <kbq-badge badgeColor="fade-warning">Brute-force</kbq-badge>
            </kbq-dd>
            <kbq-dt>Identifier</kbq-dt>
            <kbq-dd>INC-2026-13-44357</kbq-dd>
            <kbq-dt>Description</kbq-dt>
            <kbq-dd>
                In cryptography, a brute-force attack consists of an attacker submitting many passwords or passphrases
                with the hope of eventually guessing correctly.
            </kbq-dd>
        </kbq-dl>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DlResizableExample {
    readonly dtWidth = model(150);
}
