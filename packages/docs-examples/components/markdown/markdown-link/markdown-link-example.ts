import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown link
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-link-example',
    templateUrl: './markdown-link-example.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownLinkExample {}
