import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link pseudo
 */
@Component({
    selector: 'link-pseudo-example',
    imports: [KbqLinkModule],
    template: `
        <a kbq-link pseudo>
            <span class="kbq-link__text">Scan report</span>
            <span class="example-link-description">task/koobiq.io</span>
        </a>
    `,
    styles: `
        :host {
            display: flex;
            padding: var(--kbq-size-l);
        }

        .example-link-description {
            display: block;
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkPseudoExample {}
