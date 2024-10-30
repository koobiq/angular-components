import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown line break
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-line-break-example',
    templateUrl: './markdown-line-break-example.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownLineBreakExample {}
