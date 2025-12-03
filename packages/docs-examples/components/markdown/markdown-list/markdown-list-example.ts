import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown list
 */
@Component({
    selector: 'markdown-list-example',
    imports: [KbqMarkdownModule],
    templateUrl: './markdown-list-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownListExample {}
