import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown } from '@koobiq/components/markdown';

/**
 * @title Markdown selection
 */
@Component({
    selector: 'markdown-selection-example',
    imports: [KbqMarkdown],
    templateUrl: 'markdown-selection-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownSelectionExample {}
