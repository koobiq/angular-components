import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    input,
    signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { KbqCodeBlockModule } from '@koobiq/components/code-block';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { filter } from 'rxjs/operators';
import { DocsNextContentBlock } from '../services/content';
import { DocsNextHeadingHighlight } from '../services/heading-highlight';
import { DocsNextPageOutline } from '../services/page-outline';
import { docsNextIsPlainClick } from '../services/plain-click';
import { DocsNextSiteState } from '../services/site-state';
import { DocsNextExampleFrame } from './example-frame';

type DocsNextRenderedBlock = { kind: 'html'; html: SafeHtml } | Exclude<DocsNextContentBlock, { kind: 'html' }>;

const HEADING_LINK = 'docs-next-heading-link';
/** How long the link shows that it has copied the address. */
const COPIED_DURATION = 2000;

/**
 * Article compiled from MDX: HTML, code blocks and example frames, in the typography of the site. Every heading with an
 * id gets a link to itself: a click copies its address (styles: `styles/_heading-links.scss`).
 */
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
        <span class="docs-next-content-blocks__live" aria-live="polite">{{ announcement() }}</span>
    `,
    styles: `
        :host {
            display: block;
        }

        .docs-next-content-blocks__live {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            clip-path: inset(50%);
            white-space: nowrap;
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
    host: { class: 'kbq-markdown docs-next-prose', '(click)': 'onClick($event)' }
})
export class DocsNextContentBlocks {
    private readonly sanitizer = inject(DomSanitizer);
    private readonly state = inject(DocsNextSiteState);
    private readonly window = inject(KBQ_WINDOW);
    private readonly document = inject(DOCUMENT);
    private readonly outline = inject(DocsNextPageOutline);
    private readonly highlight = inject(DocsNextHeadingHighlight);
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    /** Said to screen readers when an address is copied. */
    protected readonly announcement = signal('');
    private resetTimer?: ReturnType<typeof setTimeout>;

    readonly blocks = input.required<DocsNextContentBlock[]>();

    constructor() {
        const destroyRef = inject(DestroyRef);

        afterNextRender(() => {
            // The links are added by this very observer: what it adds itself is not a reason to look again.
            const observer = new MutationObserver((records) => {
                if (records.some((record) => !this.isOwn(record))) this.addHeadingLinks();
            });

            observer.observe(this.host, { childList: true, subtree: true });
            this.addHeadingLinks();
            destroyRef.onDestroy(() => observer.disconnect());
        });

        // The addresses follow the address of the page, which can change under the same headings.
        inject(Router)
            .events.pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntilDestroyed()
            )
            .subscribe(() => this.addHeadingLinks());
        destroyRef.onDestroy(() => clearTimeout(this.resetTimer));
    }

    // The HTML is compiled at build time from the MDX of this repository, so it is trusted: the sanitizer would
    // otherwise drop the heading ids the table of contents links to.
    protected readonly rendered = computed<DocsNextRenderedBlock[]>(() =>
        this.blocks().map((block) =>
            block.kind === 'html' ? { kind: 'html', html: this.sanitizer.bypassSecurityTrustHtml(block.html) } : block
        )
    );

    protected onClick(event: MouseEvent): void {
        const link = (event.target as Element).closest<HTMLAnchorElement>(`a.${HEADING_LINK}`);

        // With a modifier the browser opens the link in a new tab, as it does for any link.
        if (!link || !docsNextIsPlainClick(event)) return;

        const heading = link.parentElement!.closest<HTMLElement>('[id]')!;

        event.preventDefault();
        void this.copy(link, heading);
    }

    private async copy(link: HTMLAnchorElement, heading: HTMLElement): Promise<void> {
        // The address in the bar names the section either way, so it can be copied by hand where the clipboard is shut.
        this.outline.replaceHash(heading.id);

        try {
            await this.window.navigator.clipboard.writeText(
                new URL(link.getAttribute('href')!, this.window.location.origin).href
            );
        } catch {
            this.announcement.set(this.state.t('linkInAddressBar'));

            return;
        }

        const icon = link.querySelector('i')!;

        icon.className = 'kbq kbq-icon kbq-check_16';
        this.announcement.set(this.state.t('linkCopied'));
        clearTimeout(this.resetTimer);
        this.resetTimer = setTimeout(() => {
            icon.className = 'kbq kbq-icon kbq-link_16';
            this.announcement.set('');
        }, COPIED_DURATION);
    }

    /** Whether a change is the work of `addHeadingLinks`: the tail it adds and what it moves into it. */
    private isOwn({ target, addedNodes }: MutationRecord): boolean {
        const added = Array.from(addedNodes);

        return (
            (target instanceof Element && !!target.closest('.docs-next-heading__tail')) ||
            (added.length > 0 &&
                added.every((node) => (node as Element).classList?.contains('docs-next-heading__tail')))
        );
    }

    /**
     * Puts the link at the end of every heading with an id. The last word, the badge and the link are held together,
     * so that the link never wraps to a line of its own.
     */
    private addHeadingLinks(): void {
        for (const heading of this.host.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id], h5[id]')) {
            const href = this.outline.hrefFor(heading.id);
            const existing = heading.querySelector<HTMLAnchorElement>(`a.${HEADING_LINK}`);

            if (existing) {
                if (existing.getAttribute('href') !== href) existing.href = href;

                continue;
            }

            const link = this.document.createElement('a');
            const icon = this.document.createElement('i');

            link.className = HEADING_LINK;
            link.href = href;
            link.setAttribute('aria-label', this.state.t('linkToSection', { title: heading.textContent!.trim() }));
            icon.className = 'kbq kbq-icon kbq-link_16';
            icon.setAttribute('aria-hidden', 'true');
            link.append(icon);

            this.holdTogether(heading).append(link);
        }

        this.highlight.flushPending();
    }

    /** The element that carries the end of the heading: its last word and the badge, which must not part. */
    private holdTogether(heading: HTMLElement): HTMLElement {
        const nodes = Array.from(heading.childNodes);
        let start = nodes.length - 1;

        while (start > 0 && (nodes[start] as Element).classList?.contains('docs-header-badge')) start--;

        let first = nodes[start];

        if (first?.nodeType === Node.TEXT_NODE) {
            const text = (first as Text).data.trimEnd();

            first = (first as Text).splitText(text.lastIndexOf(' ') + 1);
        }

        const tail = this.document.createElement('span');

        tail.className = 'docs-next-heading__tail';
        first?.before(tail);

        for (let node = first; node;) {
            const next: ChildNode | null = node.nextSibling;

            tail.append(node);
            node = next as ChildNode;
        }

        return tail;
    }
}
