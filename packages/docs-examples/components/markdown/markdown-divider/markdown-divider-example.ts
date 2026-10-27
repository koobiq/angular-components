import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';

/**
 * @title Markdown divider
 */
@Component({
    selector: 'markdown-divider-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-divider-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownDividerExample {}
