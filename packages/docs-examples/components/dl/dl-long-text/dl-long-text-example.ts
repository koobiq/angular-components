import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTitleModule } from '@koobiq/components/title';

/**
 * @title Description list with long text
 */
@Component({
    selector: 'dl-long-text-example',
    imports: [KbqDlModule, KbqLinkModule, KbqTitleModule],
    template: `
        @let dtMinWidth = 100;
        @let ddMinWidth = 200;

        <kbq-dl resizable [dtMinWidth]="dtMinWidth" [ddMinWidth]="ddMinWidth">
            <kbq-dt class="dl-long-text-example__text" kbq-title>Identifierwithoutseparators</kbq-dt>
            <kbq-dd class="dl-long-text-example__text" kbq-title>
                0198EB25C90370D5A8B57414ED82C4D0198EB25C90370D5A8B5B7414ED82C4D
            </kbq-dd>
            <kbq-dt>Link</kbq-dt>
            <kbq-dd class="dl-long-text-example__text" kbq-title>
                <a kbq-link target="_blank" rel="noopener noreferrer">
                    https://github.com/koobiq/angular-components/blob/main/packages/components/dl/index.ts
                </a>
            </kbq-dd>
        </kbq-dl>
    `,
    styles: `
        .dl-long-text-example__text {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DlLongTextExample {}
