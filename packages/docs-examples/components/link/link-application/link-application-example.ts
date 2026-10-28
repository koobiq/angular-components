import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink, KbqLinkSuffix } from '@koobiq/components/link';

/**
 * @title Link application
 */
@Component({
    selector: 'link-application-example',
    imports: [KbqLink, KbqLinkSuffix, NgOptimizedImage],
    template: `
        <a kbqLink href="https://koobiq.io/en/components/link" target="_blank">
            Scan report in AI Desktop
            <img
                kbqLinkSuffix
                class="example-app-icon"
                ngSrc="https://koobiq.io/assets/images/favicons/icon.svg"
                width="16"
                height="16"
                alt=""
            />
        </a>

        <a kbqLink external href="https://koobiq.io/en/components/link" target="_blank">Scan report in AI Desktop</a>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--kbq-size-xxl);
            min-height: 160px;
        }

        .example-app-icon {
            vertical-align: text-bottom;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkApplicationExample {}
