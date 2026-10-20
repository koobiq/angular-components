import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink, KbqLinkSuffix } from '@koobiq/components/link';

/**
 * @title Link with caption
 */
@Component({
    selector: 'link-with-caption-example',
    imports: [KbqLink, KbqLinkSuffix],
    template: `
        <a kbqLink external href="https://koobiq.io/en/components/link" target="_blank">
            Scan report
            <span class="example-link-caption" kbqLinkSuffix>task/koobiq.io</span>
        </a>
    `,
    styles: `
        :host {
            display: inline-block;
            padding: var(--kbq-size-l);
        }

        .example-link-caption {
            display: flex;
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkWithCaptionExample {}
