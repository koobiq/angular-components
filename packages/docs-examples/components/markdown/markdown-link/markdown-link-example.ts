import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown link
 */
@Component({
    selector: 'markdown-link-example',
    imports: [KbqMarkdownModule],
    templateUrl: './markdown-link-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownLinkExample {}
