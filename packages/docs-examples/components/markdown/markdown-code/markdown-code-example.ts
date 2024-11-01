import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown code
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-code-example',
    templateUrl: './markdown-code-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownCodeExample {}
