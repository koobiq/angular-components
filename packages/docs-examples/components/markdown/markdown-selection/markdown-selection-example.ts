import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown selection
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-selection-example',
    templateUrl: 'markdown-selection-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownSelectionExample {}
