import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown code
 */
@Component({
    selector: 'markdown-code-example',
    imports: [KbqMarkdownModule],
    templateUrl: './markdown-code-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownCodeExample {}
