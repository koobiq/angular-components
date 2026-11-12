import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink, KbqLinkSuffix } from '@koobiq/components/link';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Link in text
 */
@Component({
    selector: 'link-in-text-example',
    imports: [KbqLink, KbqLinkSuffix],
    template: `
        <p class="example-text">
            {{ text().learnMore }}
            <a kbqLink href="https://koobiq.io/en/components/link" target="_blank">
                {{ text().aboutScanReports }}
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
export class LinkInTextExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}
