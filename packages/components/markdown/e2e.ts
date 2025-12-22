import { ChangeDetectionStrategy, Component } from '@angular/core';
import { kbqMarkdownMarkedOptionsProvider } from './markdown.component';
import { KbqMarkdownModule } from './markdown.module';

@Component({
    selector: 'e2e-markdown-line-break-with-markdown-text-input-example',
    imports: [KbqMarkdownModule],
    providers: [kbqMarkdownMarkedOptionsProvider({ breaks: true })],
    // prettier-ignore
    template: `
        <kbq-markdown markdownText="First line\nSecond line" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eMarkdownLineBreakWithMarkdownTextInputExample {}

@Component({
    selector: 'e2e-markdown-states',
    imports: [
        KbqMarkdownModule,
        E2eMarkdownLineBreakWithMarkdownTextInputExample
    ],
    templateUrl: './e2e.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eMarkdownStates'
    }
})
export class E2eMarkdownStates {}
