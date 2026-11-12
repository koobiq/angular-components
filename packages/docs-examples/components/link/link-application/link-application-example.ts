import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink, KbqLinkSuffix } from '@koobiq/components/link';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Link application
 */
@Component({
    selector: 'link-application-example',
    imports: [KbqLink, KbqLinkSuffix, NgOptimizedImage],
    template: `
        <a kbqLink href="https://koobiq.io/en/components/link" target="_blank">
            {{ t().scanReportInApp }}
            <img
                kbqLinkSuffix
                class="example-app-icon"
                ngSrc="https://koobiq.io/assets/images/favicons/icon.svg"
                width="16"
                height="16"
                alt=""
            />
        </a>

        <a kbqLink external href="https://koobiq.io/en/components/link" target="_blank">{{ t().scanReportInApp }}</a>
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
export class LinkApplicationExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}
