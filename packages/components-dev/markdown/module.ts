import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { MarkdownExamplesModule } from 'packages/docs-examples/components/markdown';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [MarkdownExamplesModule],
    selector: 'dev-examples',
    template: `
        <markdown-article-example />
        <hr />
        <markdown-code-block-example />
        <hr />
        <markdown-code-example />
        <hr />
        <markdown-divider-example />
        <hr />
        <markdown-headers-combinations-example />
        <hr />
        <markdown-headers-example />
        <hr />
        <markdown-image-example />
        <hr />
        <markdown-line-break-example />
        <hr />
        <markdown-line-break-with-markdown-text-input-example />
        <hr />
        <markdown-link-example />
        <hr />
        <markdown-list-example />
        <hr />
        <markdown-paragraph-example />
        <hr />
        <markdown-quote-example />
        <hr />
        <markdown-selection-example />
        <hr />
        <markdown-table-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [DevExamples, DevThemeToggle],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
