import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown headers combinations
 */
@Component({
    selector: 'markdown-headers-combinations-example',
    imports: [KbqMarkdownModule],
    templateUrl: './markdown-headers-combinations-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownHeadersCombinationsExample {}
