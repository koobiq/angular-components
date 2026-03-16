import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link multi-line
 */
@Component({
    selector: 'link-multi-line-example',
    imports: [KbqLinkModule, KbqIconModule],
    template: `
        <p>
            I fully agree
            <a kbq-link class="kbq-link_external">
                <i kbq-icon="kbq-scroll-o_16"></i>
                <span class="kbq-link__text">with the terms of the license agreement</span>
                <i kbq-icon="kbq-north-east_16"></i>
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
