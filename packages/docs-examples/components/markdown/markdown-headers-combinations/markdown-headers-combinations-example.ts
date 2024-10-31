import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown headers combinations
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-headers-combinations-example',
    templateUrl: './markdown-headers-combinations-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownHeadersCombinationsExample {}
