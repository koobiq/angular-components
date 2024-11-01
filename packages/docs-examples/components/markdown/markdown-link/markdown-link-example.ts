import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown link
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-link-example',
    templateUrl: './markdown-link-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownLinkExample {}
