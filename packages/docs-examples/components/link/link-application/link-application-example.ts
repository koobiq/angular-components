import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink, KbqLinkSuffix } from '@koobiq/components/link';

/**
 * @title Link application
 */
@Component({
    selector: 'link-application-example',
    imports: [
        KbqLink,
        KbqLinkSuffix,
        KbqIconModule
    ],
    template: `
        <a href="https://koobiq.io/en/components/link" target="_blank" kbqLink external>
            The scan report in Deep Inspector
        </a>

        <a class="example-link-with-svg-icon" href="https://koobiq.io/en/components/link" target="_blank" kbqLink>
            The scan report in Deep Inspector
            <img
                kbqLinkSuffix
                kbq-icon=""
                src="https://koobiq.io/assets/images/favicons/icon.svg"
                width="16"
                alt="icon"
            />
        </a>
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
        }

        .example-link-with-svg-icon img {
            vertical-align: text-bottom;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkApplicationExample {}
