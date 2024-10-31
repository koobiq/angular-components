import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown headers
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-headers-example',
    templateUrl: './markdown-headers-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownHeadersExample {}
