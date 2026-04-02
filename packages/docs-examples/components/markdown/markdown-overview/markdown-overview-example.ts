import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown headers
 */
@Component({
    selector: 'markdown-overview-example',
    imports: [KbqMarkdownModule],
    templateUrl: './markdown-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownOverviewExample {}
