import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
            <kbq-dt>{{ t().incidentType }}</kbq-dt>
            <kbq-dd>{{ t().malwareInfection }}</kbq-dd>

            <kbq-dt>{{ t().identifier }}</kbq-dt>
            <kbq-dd>INC-2026-125-78253</kbq-dd>

            <kbq-dt>{{ t().status }}</kbq-dt>
            <kbq-dd>{{ t().new }}</kbq-dd>

            <kbq-dt>{{ t().assignee }}</kbq-dt>
            <kbq-dd>John Smith</kbq-dd>

            <kbq-dt>{{ t().description }}</kbq-dt>
            <kbq-dd>
                {{ t().phishingDescription }}
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
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly vertical = model(true);
}
