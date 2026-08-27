import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Description list with long text
 */
@Component({
    selector: 'dl-long-text-example',
    imports: [KbqDlModule, KbqLinkModule],
    template: `
        <kbq-dl [vertical]="false">
            <kbq-dt>Identifier-without-separators</kbq-dt>
            <kbq-dd>0198-EB25-C903-70D5-A8B5-7414-ED82-C4D0-198E-B25C-9037-0D5A8B5B7414ED82C4D</kbq-dd>
            <kbq-dt>Link</kbq-dt>
            <kbq-dd>
                <a kbq-link target="_blank" rel="noopener noreferrer">
                    https://github.com/koobiq/angular-components/blob/main/packages/components/dl/index.ts
                </a>
            </kbq-dd>
        </kbq-dl>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DlLongTextExample {}
