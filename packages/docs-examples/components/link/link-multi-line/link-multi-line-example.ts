import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink, KbqLinkPrefix } from '@koobiq/components/link';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Link multi-line
 */
@Component({
    selector: 'link-multi-line-example',
    imports: [KbqLink, KbqLinkPrefix, KbqIconModule],
    template: `
        <p class="example-text">
            {{ text().agree }}
            <a kbqLink external href="https://koobiq.io/en/components/link" target="_blank">
                <i kbqLinkPrefix kbq-icon="kbq-scroll-o_16"></i>
                {{ text().licenseTerms }}
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
            width: 200px;
            margin: 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkMultiLineExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}
