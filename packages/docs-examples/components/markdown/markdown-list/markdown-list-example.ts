import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown list
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-list-example',
    templateUrl: './markdown-list-example.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownListExample {}
