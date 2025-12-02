import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown image
 */
@Component({
    selector: 'markdown-image-example',
    imports: [KbqMarkdownModule],
    templateUrl: './markdown-image-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownImageExample {}
