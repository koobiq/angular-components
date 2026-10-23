import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink, KbqLinkPrefix } from '@koobiq/components/link';

/**
 * @title Link multi-line
 */
@Component({
    selector: 'link-multi-line-example',
    imports: [KbqLink, KbqLinkPrefix, KbqIconModule],
    template: `
        <p>
            I fully agree
            <a kbqLink external href="https://koobiq.io/en/components/link" target="_blank">
                <i kbqLinkPrefix kbq-icon="kbq-scroll-o_16"></i>
                with the terms of the license agreement
            </a>
        </p>
    `,
    styles: `
        :host {
            display: flex;
            padding: var(--kbq-size-l);
            width: 200px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkMultiLineExample {}
