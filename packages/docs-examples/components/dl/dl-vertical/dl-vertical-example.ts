import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

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
            <kbq-dt>{{ text().incidentType }}</kbq-dt>
            <kbq-dd>{{ text().malwareInfection }}</kbq-dd>

            <kbq-dt>{{ text().identifier }}</kbq-dt>
            <kbq-dd>INC-2026-125-78253</kbq-dd>

            <kbq-dt>{{ text().status }}</kbq-dt>
            <kbq-dd>{{ text().new }}</kbq-dd>

            <kbq-dt>{{ text().assignee }}</kbq-dt>
            <kbq-dd>John Smith</kbq-dd>

            <kbq-dt>{{ text().description }}</kbq-dt>
            <kbq-dd>
                {{ text().phishingDescription }}
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
export class DlVerticalExample extends BaseLocalizedExample<ExampleText> {
    protected readonly vertical = model(true);

    constructor() {
        super(TEXT);
    }
}
