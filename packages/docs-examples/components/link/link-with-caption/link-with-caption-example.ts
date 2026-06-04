import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link with caption
 */
@Component({
    selector: 'link-with-caption-example',
    imports: [KbqLinkModule, KbqIconModule],
    template: `
        <span class="kbq-link_external" kbq-link pseudo>
            <span class="kbq-link__text">Scan report</span>
            <i kbq-icon="kbq-north-east_16"></i>
            <span class="example-link-caption">task/koobiq.io</span>
        </span>
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
