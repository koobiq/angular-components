import { ChangeDetectionStrategy, Component, model, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    KbqCodeBlock,
    type KbqCodeBlockFile,
    kbqCodeBlockHighlightJsConfigProvider
} from '@koobiq/components/code-block';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Code block line links and author highlights */
@Component({
    selector: 'code-block-line-links-example',
    imports: [KbqCodeBlock, KbqToggleModule, FormsModule],
    template: `
        <div class="layout-row layout-wrap layout-gap-l layout-margin-bottom-m">
            <kbq-toggle [(ngModel)]="lineNumbers">{{ t().lineNumbers }}</kbq-toggle>
            <kbq-toggle [(ngModel)]="filled">{{ t().filled }}</kbq-toggle>
            <kbq-toggle [(ngModel)]="tabs">{{ t().tabs }}</kbq-toggle>
        </div>
        <kbq-code-block
            viewportMaxHeight="320"
            [hideTabs]="!tabs()"
            [lineNumbers]="lineNumbers()"
            [filled]="filled()"
            [files]="files"
        />
        <p>{{ t().hint }}</p>
        <p>{{ t().keyboardHint }}</p>
        <section class="example-code-block-description">
            <h3>{{ t().descriptionTitle }}</h3>
            <p>{{ t().baseline }}</p>
            <h4>{{ t().taskChangesTitle }}</h4>
            <ul>
                @for (change of t().changes; track change.title) {
                    <li><strong>{{ change.title }}</strong> {{ change.description }}</li>
                }
            </ul>
            <p>
                {{ t().linkExamples }}
                <a href="#request-example-L7">{{ t().singleLineLink }}</a>
                ·
                <a href="#request-example-L6-L11">{{ t().rangeLink }}</a>
            </p>
            <h4>{{ t().otherChangesTitle }}</h4>
            <ul>
                @for (change of t().otherChanges; track change.title) {
                    <li><strong>{{ change.title }}</strong> {{ change.description }}</li>
                }
            </ul>

            <h3>{{ t().useCasesTitle }}</h3>
            <p>{{ t().useCases }}</p>

            <h3>{{ t().comparisonTitle }}</h3>
            <p>{{ t().comparisonIntro }}</p>
            <p>
                {{ t().comparisonSource }}
                <a href="https://github.com/koobiq/angular-components/pull/2418">PR #2418</a>
                ·
                <a href="https://github.com/koobiq/angular-components/tree/5eba581466eb0d1a7075be35807100140854bbab">
                    5eba581
                </a>
            </p>
            <table class="example-code-block-comparison">
                <caption>{{ t().comparisonCaption }}</caption>
                <thead>
                    <tr>
                        <th scope="col">{{ t().comparisonColumns.feature }}</th>
                        <th scope="col">{{ t().comparisonColumns.current }}</th>
                        <th scope="col">PR #2418</th>
                    </tr>
                </thead>
                <tbody>
                    @for (row of t().comparison; track row.feature) {
                        <tr>
                            <th scope="row">{{ row.feature }}</th>
                            <td>{{ row.current }}</td>
                            <td>{{ row.pullRequest }}</td>
                        </tr>
                    }
                </tbody>
            </table>

            <h3>{{ t().scopeTitle }}</h3>
            <p>{{ t().scope }}</p>
            <p>{{ t().identityRequirement }}</p>
        </section>
    `,
    styles: `
        code-block-line-links-example .example-code-block-description {
            margin-block-start: var(--kbq-size-3xl);

            h3,
            h4 {
                margin-block: var(--kbq-size-xl) var(--kbq-size-m);
            }

            li + li {
                margin-block-start: var(--kbq-size-m);
            }
        }

        code-block-line-links-example .example-code-block-comparison {
            inline-size: 100%;
            border-collapse: collapse;
            text-align: start;
            overflow-wrap: anywhere;

            caption {
                margin-block-end: var(--kbq-size-m);
                text-align: start;
                color: var(--kbq-foreground-contrast-secondary);
            }

            th,
            td {
                padding: var(--kbq-size-m);
                border-block-end: 1px solid var(--kbq-line-contrast-less);
                vertical-align: top;
                text-align: start;
            }

            thead {
                background: var(--kbq-background-contrast-less);
            }
        }

        code-block-line-links-example .kbq-code-block.kbq-code-block_line-links {
            --kbq-code-block-line-action-size: var(--kbq-size-xl);

            .kbq-code-block__gutter .kbq-code-block__line-action {
                inset-inline-start: calc(-1 * var(--kbq-size-xl));
                color: var(--kbq-icon-contrast-fade);
                background: transparent;
                border: 0;
                border-radius: 0;

                .kbq-icon {
                    color: inherit;
                }

                &:hover {
                    color: var(--kbq-states-icon-contrast-fade-hover);
                    background: transparent;
                }

                &:active {
                    color: var(--kbq-states-icon-contrast-fade-active);
                }
            }

            &.kbq-code-block_hide-line-numbers .kbq-code-block__line:hover .kbq-code-block__gutter::before,
            &.kbq-code-block_hide-line-numbers .kbq-code-block__code.cdk-keyboard-focused .kbq-code-block__line:focus-within .kbq-code-block__gutter::before {
                content: '';
                position: absolute;
                inset-block: 0;
                inset-inline-start: calc(-1 * var(--kbq-size-xl));
                inset-inline-end: 0;
                z-index: -1;
                box-sizing: border-box;
                background:
                    linear-gradient(
                        var(--kbq-code-block-gutter-hover-background, transparent),
                        var(--kbq-code-block-gutter-hover-background, transparent)
                    ),
                    linear-gradient(
                        var(--kbq-code-block-gutter-highlight-overlay, transparent),
                        var(--kbq-code-block-gutter-highlight-overlay, transparent)
                    ),
                    linear-gradient(
                        var(--kbq-code-block-gutter-row-background, transparent),
                        var(--kbq-code-block-gutter-row-background, transparent)
                    ),
                    var(--kbq-code-block-gutter-background);
                box-shadow:
                    var(--kbq-code-block-gutter-selection-shadow, 0 0 transparent),
                    var(--kbq-code-block-gutter-highlight-shadow, 0 0 transparent);
                pointer-events: none;
            }
        }

        code-block-line-links-example .kbq-code-block.kbq-code-block_line-links {
            .kbq-code-block__main {
                overflow-x: auto;
                overflow-y: auto;
            }

            .kbq-code-block__pre {
                inline-size: max-content;
                min-inline-size: 100%;
            }

            .kbq-code-block__code {
                white-space: pre;
                overflow-wrap: normal;
            }
        }

        code-block-line-links-example .kbq-code-block.kbq-code-block_line-links {
            --kbq-code-block-highlight-background: var(--kbq-background-theme-less);
            --kbq-code-block-highlight-line: var(--kbq-line-theme);
            --kbq-code-block-selection-background: var(--kbq-states-background-transparent-active);
            --kbq-code-block-selection-line: transparent;

            .kbq-code-block__line_highlighted {
                --kbq-code-block-gutter-highlight-shadow: 0 0 transparent;

                box-shadow: none;

                .kbq-code-block__gutter::after {
                    content: '';
                    position: absolute;
                    inset-block: 0;
                    inset-inline-start: calc(-1 * var(--kbq-size-xl));
                    z-index: 2;
                    display: block;
                    inline-size: 2px;
                    background: var(--kbq-code-block-highlight-line);
                    pointer-events: none;
                }
            }

            .kbq-code-block__highlight {
                text-decoration: none;
            }
        }
    `,
    providers: [
        kbqCodeBlockHighlightJsConfigProvider({
            languages: { typescript: () => import('highlight.js/lib/languages/typescript') }
        })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class CodeBlockLineLinksExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    readonly lineNumbers = model(false);
    readonly filled = model(false);
    readonly tabs = model(true);
    protected readonly files: KbqCodeBlockFile[] = [
        {
            id: 'request-example',
            filename: 'request.ts',
            language: 'typescript',
            content: `interface RequestOptions {
    signal?: AbortSignal;
    retries: number;
}

export async function request(url: string, options: RequestOptions) {
    const response = await fetch(url, { signal: options.signal });

    if (!response.ok) {
        throw new Error(\`Request failed: \${response.status}\`);
    }

    return response.json();
}

const controller = new AbortController();
const options = {
    signal: controller.signal,
    retries: 3
};

const result = await request('/api/events', options);
console.log(result);

// Cancel the request when leaving the page.
controller.abort();`,
            highlightedLines: [
                { start: 6, end: 7 },
                { start: 9, end: 11 }
            ],
            highlightedRanges: [
                { start: { line: 2, offset: 13 }, end: { line: 2, offset: 24 } },
                { start: { line: 7, offset: 47 }, end: { line: 7, offset: 61 } },
                { start: { line: 17, offset: 16 }, end: { line: 20, offset: 1 } },
                { start: { line: 26, offset: 11 }, end: { line: 26, offset: 16 } }
            ]
        },
        {
            id: 'events-example',
            filename: 'events.ts',
            language: 'typescript',
            content: `import { request } from './request';

interface Event {
    id: string;
    title: string;
    createdAt: string;
}

export async function loadEvents(signal: AbortSignal): Promise<Event[]> {
    const events = await request('/api/events', {
        signal,
        retries: 3
    });

    return events.map((event: Event) => ({
        ...event,
        title: event.title.trim()
    }));
}`,
            highlightedLines: [{ start: 9, end: 13 }],
            highlightedRanges: [{ start: { line: 17, offset: 27 }, end: { line: 17, offset: 31 } }]
        },
        {
            id: 'retry-example',
            filename: 'retry.ts',
            language: 'typescript',
            content: `const delay = (milliseconds: number) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function retry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === attempts) {
                throw error;
            }

            await delay(250 * 2 ** (attempt - 1));
        }
    }

    throw new Error('No attempts available');
}`,
            highlightedLines: [{ start: 8, end: 11 }],
            highlightedRanges: [{ start: { line: 13, offset: 24 }, end: { line: 13, offset: 46 } }]
        }
    ];
}
