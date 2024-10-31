import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown code block
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-code-block-example',
    templateUrl: './markdown-code-block-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownCodeBlockExample {}
