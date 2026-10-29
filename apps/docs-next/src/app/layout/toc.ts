import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { DocsNextPageOutline } from '../services/page-outline';
import { DocsNextSiteState } from '../services/site-state';

const COMPACT_STORAGE_KEY = 'docs-next-toc-compact';

/**
 * "On this page" (spec/components/page-toc.md): the two upper heading levels of the article, the visible one lit as
 * the page scrolls, and the address following it. A button switches between the list and a compact rail of bars,
 * whose popup lists the headings; the choice is remembered.
 */
@Component({
    selector: 'docs-next-toc',
    imports: [NgTemplateOutlet, KbqButtonModule, KbqIconModule],
    templateUrl: './toc.html',
    styleUrl: './toc.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'docs-next-toc',
        '[class.docs-next-toc_compact]': 'compact()',
        '[class.docs-next-toc_empty]': '!items().length',
        role: 'navigation',
        '[attr.aria-label]': 'state.t("onThisPage")'
    }
})
export class DocsNextToc {
    protected readonly state = inject(DocsNextSiteState);
    private readonly outline = inject(DocsNextPageOutline);
    private readonly window = inject(KBQ_WINDOW);

    protected readonly items = this.outline.items;
    protected readonly activeId = this.outline.activeId;
    readonly compact = signal(this.readCompact());

    protected toggleCompact(): void {
        this.compact.update((value) => !value);

        try {
            this.window.localStorage.setItem(COMPACT_STORAGE_KEY, String(this.compact()));
        } catch {
            // Not remembered then.
        }
    }

    protected scrollTo(event: Event, id: string): void {
        event.preventDefault();
        this.outline.scrollTo(id);
    }

    private readCompact(): boolean {
        try {
            return this.window.localStorage.getItem(COMPACT_STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    }
}
