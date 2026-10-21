import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqDd, KbqDl, KbqDlAlign, KbqDt } from '@koobiq/components/dl';

/**
 * @title Description list alignment
 */
@Component({
    selector: 'dl-alignment-example',
    imports: [KbqDl, KbqDt, KbqDd, KbqButtonToggleModule, FormsModule],
    template: `
        <div class="layout-row layout-wrap layout-gap-l layout-align-center-center">
            <kbq-button-toggle-group aria-label="Vertical alignment" [(ngModel)]="verticalAlign">
                <kbq-button-toggle value="start">Top</kbq-button-toggle>
                <kbq-button-toggle value="center">Center</kbq-button-toggle>
                <kbq-button-toggle value="end">Bottom</kbq-button-toggle>
            </kbq-button-toggle-group>

            <kbq-button-toggle-group aria-label="Horizontal alignment" [(ngModel)]="horizontalAlign">
                <kbq-button-toggle value="start">Start</kbq-button-toggle>
                <kbq-button-toggle value="center">Center</kbq-button-toggle>
                <kbq-button-toggle value="end">End</kbq-button-toggle>
            </kbq-button-toggle-group>
        </div>

        <kbq-dl [verticalAlign]="verticalAlign()" [horizontalAlign]="horizontalAlign()">
            <kbq-dt>Identifier</kbq-dt>
            <kbq-dd>INC-2026-125-78253</kbq-dd>

            <kbq-dt>Status</kbq-dt>
            <kbq-dd>New</kbq-dd>

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
export class DlAlignmentExample {
    protected readonly verticalAlign = model<KbqDlAlign>('center');
    protected readonly horizontalAlign = model<KbqDlAlign>('start');
}
