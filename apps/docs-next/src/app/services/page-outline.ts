import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { KBQ_WINDOW } from '@koobiq/components/core';

export interface DocsNextOutlineItem {
    id: string;
    title: string;
    /** 0 for the top level of the article, 1 for the one below. */
    level: number;
}

/**
 * Headings of the open article and the one the reader is at (spec/components/page-toc.md), read by the table of
 * contents on a wide screen and by the "On this page" sheet on a phone. Only the two upper levels count.
 */
@Injectable({ providedIn: 'root' })
export class DocsNextPageOutline {
    private readonly document = inject(DOCUMENT);
    private readonly window = inject(KBQ_WINDOW);

    readonly items = signal<DocsNextOutlineItem[]>([]);
    readonly activeId = signal<string | null>(null);

    private container: HTMLElement | null = null;
    private readonly observer = new MutationObserver(() => this.collect());
    private readonly onScroll = (): void => this.updateActive();

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
        };
    }

    scrollTo(id: string): void {
        this.document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.replaceHash(id);
        this.activeId.set(id);
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
            if (active && this.window.scrollY > 0) this.replaceHash(active);
        }
    }

    private replaceHash(id: string): void {
        const { history, location } = this.window;

        history.replaceState(history.state, '', `${location.pathname}#${id}`);
    }

    private collect(): void {
        if (!this.container) return;

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
