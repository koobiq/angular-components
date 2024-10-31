import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

/**
 * @title Markdown divider
 */
@Component({
    standalone: true,
    imports: [KbqMarkdownModule],
    selector: 'markdown-divider-example',
    templateUrl: './markdown-divider-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownDividerExample {}
