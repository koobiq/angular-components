import { DOCUMENT, Location } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { filter } from 'rxjs/operators';
import { DocsNextHeadingHighlight } from './heading-highlight';

export interface DocsNextOutlineItem {
    id: string;
    title: string;
    /** 0 for the top level of the article, 1 for the one below. */
    level: number;
}

export interface DocsNextOutlineLink extends DocsNextOutlineItem {
    /** Address of the heading on the open page. */
    href: string;
}

/**
 * Headings of the open article and the one the reader is at (spec/components/page-toc.md), read by the table of
 * contents on a wide screen and by the "On this page" sheet on a phone. Only the two upper levels count.
 */
@Injectable({ providedIn: 'root' })
export class DocsNextPageOutline {
    private readonly document = inject(DOCUMENT);
    private readonly window = inject(KBQ_WINDOW);
    private readonly location = inject(Location);
    private readonly highlight = inject(DocsNextHeadingHighlight);

    readonly items = signal<DocsNextOutlineItem[]>([]);
    /** The items with their addresses, which follow the address of the page: a bare `#id` would resolve to the site root. */
    readonly links = computed<DocsNextOutlineLink[]>(() => {
        this.url();

        return this.items().map((item) => ({
            ...item,
            href: this.hrefFor(item.id)
        }));
    });
    readonly activeId = signal<string | null>(null);
    /** How far the page is read, in percent. */
    readonly progress = signal(0);

    private readonly url = toSignal(inject(Router).events.pipe(filter((event) => event instanceof NavigationEnd)), {
        initialValue: null
    });

    private container: HTMLElement | null = null;
    private readonly observer = new MutationObserver(() => this.collect());
    private readonly onScroll = (): void => {
        this.updateActive();
        this.updateProgress();
    };

    /** Follows the headings of an article until the returned function is called. */
    observe(container: HTMLElement): () => void {
        this.container = container;
        this.observer.observe(container, { childList: true, subtree: true });
        this.window.addEventListener('scroll', this.onScroll, { passive: true });
        this.collect();

        return () => {
            if (this.container !== container) return;

            this.observer.disconnect();
            this.window.removeEventListener('scroll', this.onScroll);
            this.container = null;
            this.items.set([]);
            this.activeId.set(null);
            this.progress.set(0);
        };
    }

    scrollTo(id: string): void {
        this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.replaceHash(id);
        this.activeId.set(id);
        this.highlight.highlightAfterScroll(id);
    }

    private updateActive(): void {
        const items = this.items();
        // The heading the reader is at: the last one above the line under the header.
        const line =
            parseFloat(
                this.window
                    .getComputedStyle(this.document.documentElement)
                    .getPropertyValue('--docs-next-header-height')
            ) + 24;
        let active: string | null = items[0]?.id ?? null;

        for (const item of items) {
            const heading = this.document.getElementById(item.id);

            if (heading && heading.getBoundingClientRect().top <= line) active = item.id;
        }

        if (active !== this.activeId()) {
            this.activeId.set(active);

            // The address names the open section, so a link can be shared to that place (spec, item 34).
            if (active && this.window.scrollY > 0 && !this.highlight.isSettling()) this.replaceHash(active);
        }
    }

    private updateProgress(): void {
        const scrollable = this.document.documentElement.scrollHeight - this.window.innerHeight;

        this.progress.set(scrollable > 0 ? Math.min(100, Math.max(0, (this.window.scrollY / scrollable) * 100)) : 100);
    }

    /** Address of a heading on the open page; a bare `#id` would resolve against `<base href>` to the site root. */
    hrefFor(id: string): string {
        return this.location.prepareExternalUrl(this.pathWithHash(id));
    }

    replaceHash(id: string): void {
        this.location.replaceState(this.pathWithHash(id), '', this.location.getState());
    }

    // `path()` keeps the query of the address, which `pathname` would drop.
    private pathWithHash(id: string): string {
        return `${this.location.path()}#${encodeURIComponent(id)}`;
    }

    private collect(): void {
        if (!this.container) return;

        // The article arrives after it is observed, and its length changes the share already read.
        this.updateProgress();

        const headings = Array.from(this.container.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id]'));
        const depths = [...new Set(headings.map((heading) => Number(heading.tagName[1])))].sort().slice(0, 2);
        const items = headings
            .filter((heading) => depths.includes(Number(heading.tagName[1])))
            .map((heading) => ({
                id: heading.id,
                title: heading.textContent?.trim() ?? '',
                level: depths.indexOf(Number(heading.tagName[1]))
            }));

        if (
            items.map(({ id }) => id).join() !==
            this.items()
                .map(({ id }) => id)
                .join()
        ) {
            this.items.set(items);
            this.updateActive();
        }
    }
}
