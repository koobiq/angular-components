import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { KbqCodeBlockModule } from '@koobiq/components/code-block';
import { DocsNextContentBlock } from '../services/content';
import { DocsNextExampleFrame } from './example-frame';

type DocsNextRenderedBlock = { kind: 'html'; html: SafeHtml } | Exclude<DocsNextContentBlock, { kind: 'html' }>;

/** Article compiled from MDX: HTML, code blocks and example frames, in the typography of the site. */
@Component({
    selector: 'docs-next-content-blocks',
    imports: [KbqCodeBlockModule, DocsNextExampleFrame],
    template: `
        @for (block of rendered(); track $index) {
            @switch (block.kind) {
                @case ('html') {
                    <div class="docs-next-content-blocks__html" [innerHTML]="block.html"></div>
                }
                @case ('code') {
                    <kbq-code-block
                        class="docs-next-content-blocks__code"
                        filled
                        [files]="[{ content: block.content, language: block.language }]"
                    />
                }
                @case ('example') {
                    <docs-next-example-frame
                        [exampleId]="block.id"
                        [exampleTitle]="block.title"
                        [files]="block.files"
                    />
                }
            }
        }
    `,
    styles: `
        :host {
            display: block;
        }

        /* Lets the margins of the paragraphs and headings inside collapse with the blocks around. */
        .docs-next-content-blocks__html {
            display: contents;
        }

        .docs-next-content-blocks__code {
            margin: var(--kbq-size-l) 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'kbq-markdown docs-next-prose' }
})
export class DocsNextContentBlocks {
    private readonly sanitizer = inject(DomSanitizer);

    readonly blocks = input.required<DocsNextContentBlock[]>();

    // The HTML is compiled at build time from the MDX of this repository, so it is trusted: the sanitizer would
    // otherwise drop the heading ids the table of contents links to.
    protected readonly rendered = computed<DocsNextRenderedBlock[]>(() =>
        this.blocks().map((block) =>
            block.kind === 'html' ? { kind: 'html', html: this.sanitizer.bypassSecurityTrustHtml(block.html) } : block
        )
    );
}
