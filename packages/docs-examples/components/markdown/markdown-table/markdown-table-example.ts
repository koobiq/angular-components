import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown table
 */
@Component({
    selector: 'markdown-table-example',
    imports: [KbqMarkdownModule],
    templateUrl: './markdown-table-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownTableExample {}
