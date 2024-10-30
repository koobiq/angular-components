import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown selection
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-selection-example',
    templateUrl: 'markdown-selection-example.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownSelectionExample {}
