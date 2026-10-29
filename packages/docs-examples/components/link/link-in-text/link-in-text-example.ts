import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink, KbqLinkSuffix } from '@koobiq/components/link';

/**
 * @title Link in text
 */
@Component({
    selector: 'link-in-text-example',
    imports: [KbqLink, KbqLinkSuffix],
    template: `
        <p class="example-text">
            Learn more
            <a kbqLink href="https://koobiq.io/en/components/link" target="_blank">
                about scan reports
                <span kbqLinkSuffix>.</span>
            </a>
        </p>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 160px;
        }

        .example-text {
            margin: 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkInTextExample {}
