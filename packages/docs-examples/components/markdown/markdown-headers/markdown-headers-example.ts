import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown headers
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-headers-example',
    templateUrl: './markdown-headers-example.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownHeadersExample {}
