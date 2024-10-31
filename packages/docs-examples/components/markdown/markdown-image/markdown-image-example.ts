import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown image
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-image-example',
    templateUrl: './markdown-image-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownImageExample {}
