import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown divider
 */
@Component({
    selector: 'markdown-divider-example',
    imports: [KbqMarkdownModule],
    templateUrl: './markdown-divider-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownDividerExample {}
