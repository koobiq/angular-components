import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink, KbqLinkPrefix, KbqLinkSuffix } from '@koobiq/components/link';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Link icons
 */
@Component({
    selector: 'link-icons-example',
    imports: [KbqLink, KbqLinkPrefix, KbqLinkSuffix, KbqIconModule],
    template: `
        <a kbqLink href="https://koobiq.io/en/components/link" target="_blank">
            <i kbqLinkPrefix kbq-icon="kbq-clock_16"></i>
            {{ text().scanHistory }}
        </a>

        <a kbqLink href="https://koobiq.io/en/components/link" target="_blank">
            {{ text().scanReport }}
            <i kbqLinkSuffix kbq-icon="kbq-file-text-o_16"></i>
        </a>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--kbq-size-xxl);
            min-height: 160px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkIconsExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}
