import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Description list vertical breakpoint
 */
@Component({
    selector: 'dl-vertical-breakpoint-example',
    imports: [KbqDl, KbqDt, KbqDd],
    template: `
        <div class="example-container">
            <kbq-dl [verticalBreakpoint]="500">
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
export class DlVerticalBreakpointExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}
