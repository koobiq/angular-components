import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown headers
 */
@Component({
    selector: 'markdown-headers-example',
    imports: [KbqMarkdownModule],
    templateUrl: './markdown-headers-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownHeadersExample {}
