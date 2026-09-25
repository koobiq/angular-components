import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { KbqBadge } from '@koobiq/components/badge';
import { KbqCodeBlock, KbqCodeBlockFile } from '@koobiq/components/code-block';
import { DocsApiBlock, DocsApiEntryPoint, DocsApiParam, DocsApiReturns } from './api-page.types';

/** JSDoc text: the HTML compiled from its Markdown, and the code in between, highlighted. */
@Component({
    selector: 'docs-api-text',
    imports: [KbqCodeBlock],
    template: `
        @for (block of blocks(); track $index) {
            @if (block.type === 'code') {
                <kbq-code-block
                    class="docs-code-block"
                    filled
                    [files]="[{ content: block.code, language: block.language }]"
                />
            } @else {
                <div [innerHTML]="block.html"></div>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'docs-api__text' }
})
export class DocsApiText {
    readonly blocks = input.required<DocsApiBlock[]>();
}

/** The parameters of a function or a method and the value it returns, laid out alike. */
@Component({
    selector: 'docs-api-call',
    imports: [DocsApiText],
    template: `
        @if (params(); as params) {
            <div class="docs-api__note-title">Parameters</div>
            <dl class="docs-api__params">
                @for (param of params; track param.name) {
                    <div class="docs-api__param">
                        <dt>
                            <code class="docs-api__term-name">{{ param.name }}</code>
                            <code class="docs-api__term-type">{{ param.type }}</code>
                        </dt>
                        <dd><docs-api-text [blocks]="param.description" /></dd>
                    </div>
                }
            </dl>
        }

        @if (returns(); as returns) {
            <div class="docs-api__note-title">Returns</div>
            <dl class="docs-api__params">
                <div class="docs-api__param">
                    <dt>
                        <code class="docs-api__term-type">{{ returns.type }}</code>
                    </dt>
                    <dd><docs-api-text [blocks]="returns.description" /></dd>
                </div>
            </dl>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'docs-api__call' }
})
export class DocsApiCall {
    readonly params = input<DocsApiParam[]>();
    readonly returns = input<DocsApiReturns>();
}

/** Kinds a template uses directly; their badge is set apart from the plain TypeScript ones. */
const TEMPLATE_KINDS = new Set(['component', 'directive', 'pipe']);

/**
 * The API tab of an entry point: each entry with its signature and the members worth explaining, rendered
 * from the data `tools/api-gen` writes.
 */
@Component({
    selector: 'docs-api-page',
    imports: [KbqBadge, KbqCodeBlock, DocsApiText, DocsApiCall],
    templateUrl: './api-page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-page kbq-markdown docs-api',
        // JSDoc is English, and the `ru` locale shows the same page: say so to a screen reader.
        lang: 'en'
    }
})
export class DocsApiPage {
    readonly entryPoint = input.required<DocsApiEntryPoint>();

    /** The import line above the entries: a code block like the signatures below it. */
    protected readonly importFiles = computed((): KbqCodeBlockFile[] => {
        const { path, primaryExport } = this.entryPoint();

        return primaryExport
            ? [{ content: `import { ${primaryExport} } from '${path}';`, language: 'typescript' }]
            : [];
    });

    protected getKindColor(kind: string): string {
        return TEMPLATE_KINDS.has(kind) ? 'fade-theme' : 'fade-contrast';
    }
}
