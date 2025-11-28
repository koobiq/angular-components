import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown selection
 */
@Component({
    selector: 'markdown-selection-example',
    imports: [KbqMarkdownModule],
    templateUrl: 'markdown-selection-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownSelectionExample {}
