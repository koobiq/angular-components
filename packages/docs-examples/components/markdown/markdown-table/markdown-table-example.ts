import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';

/**
 * @title Markdown table
 */
@Component({
    selector: 'markdown-table-example',
    imports: [KbqMarkdown],
    templateUrl: './markdown-table-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownTableExample {}
