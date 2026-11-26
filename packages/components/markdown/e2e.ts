import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqMarkdown, kbqMarkdownMarkedOptionsProvider } from './markdown.component';

@Component({
    selector: 'e2e-markdown-line-break-with-markdown-text-input',
    imports: [KbqMarkdown],
    // prettier-ignore
    template: `
        <kbq-markdown markdownText="First line\nSecond line" />
    `,
    providers: [kbqMarkdownMarkedOptionsProvider({ breaks: true })],
    changeDetection: ChangeDetectionStrategy.OnPush
})
class MarkdownLineBreakWithMarkdownTextInput {}

@Component({
    selector: 'e2e-markdown-states',
    imports: [
        KbqMarkdown,
        MarkdownLineBreakWithMarkdownTextInput
    ],
    templateUrl: './e2e.html',
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            width: 500px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eMarkdownStates'
    }
})
export class E2eMarkdownStates {}

@Component({
    selector: 'e2e-markdown-list-content',
    imports: [KbqMarkdown],
    template: `
        <div class="e2e-list-content" data-testid="e2eScreenshotTarget">
            <kbq-markdown [markdownText]="ordered" />
            <kbq-markdown [markdownText]="unordered" />
        </div>
    `,
    styles: `
        .e2e-list-content {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 24px;
            max-width: 720px;
            overflow: clip;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { 'data-testid': 'e2eMarkdownListContent' }
})
export class E2eMarkdownListContent {
    protected readonly ordered = `98. ### Release checks

    Read the [guide](#checks) before starting.

    Replace ~~beta~~ with **stable** and keep the *defaults*.

    ~~~bash
    node --version
    ~~~

    > Run both checks.
    >
    > Save the results.

99. Package status

    | Package | Status |
    | --- | --- |
    | components-experimental | Ready |

    ***

100. [x] Dependencies installed

     - Run \`yarn why marked\`.
     - Keep the log.

     1. Run \`yarn test\`.
     2. Review output.`;

    // Keep continuation lines aligned when replacing each top-level number with a bullet.
    protected readonly unordered = this.ordered.replace(/^\d+\./gm, (marker) => '-'.padEnd(marker.length));
}
