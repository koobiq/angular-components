import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown table
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-table-example',
    templateUrl: './markdown-table-example.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownTableExample {}
