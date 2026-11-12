import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLink, KbqLinkSuffix } from '@koobiq/components/link';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Link with caption
 */
@Component({
    selector: 'link-with-caption-example',
    imports: [KbqLink, KbqLinkSuffix],
    template: `
        <a kbqLink external href="https://koobiq.io/en/components/link" target="_blank">
            {{ text().scanReport }}
            <span class="example-link-caption" kbqLinkSuffix>task/koobiq.io</span>
        </a>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 160px;
        }

        .example-link-caption {
            display: flex;
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkWithCaptionExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}
