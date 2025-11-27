import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link application
 */
@Component({
    selector: 'link-application-example',
    imports: [
        KbqLinkModule,
        KbqIconModule
    ],
    template: `
        <a class="kbq-link_external" href="https://koobiq.io/en/components/link" target="_blank" kbq-link>
            <span class="kbq-link__text">The scan report in Deep Inspector</span>
            <i kbq-icon="kbq-north-east_16"></i>
        </a>

        <a
            class="kbq-link_external example-link-with-svg-icon"
            href="https://koobiq.io/en/components/link"
            target="_blank"
            kbq-link
        >
            <span class="kbq-link__text">The scan report in Deep Inspector</span>
            <img kbq-icon="" src="https://koobiq.io/assets/images/favicons/icon.svg" width="16" alt="icon" />
        </a>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
        }

        .example-link-with-svg-icon {
            display: inline-flex;
            align-items: center;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkApplicationExample {}
