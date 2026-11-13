import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Markdown image
 */
@Component({
    selector: 'markdown-image-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-image-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownImageExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
