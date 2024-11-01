import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown list
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-list-example',
    templateUrl: './markdown-list-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownListExample {}
