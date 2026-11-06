import { NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    Injector,
    signal,
    viewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqIconButton, KbqIconModule } from '@koobiq/components/icon';
import { DocsNextMenuGroup, docsNextMenuGroups } from '../data/menu';
import { DOCS_NEXT_SECTIONS, DocsNextSection } from '../data/sections';
import { DocsNextContent } from '../services/content';
import { DocsNextSiteState } from '../services/site-state';
import { DocsNextMenuFooter } from './menu-footer';
import { DocsNextNavVariantState } from './nav-variant';
import { DocsNextSheet } from './sheet';

const EXPANDED_STORAGE_KEY = 'docs-next-nav-expanded';

/** Sections whose menu is a list of pages; the icon gallery opens straight away. */
const hasPages = (section: DocsNextSection): boolean => section.id !== 'icons';

/**
 * The phone menu behind the burger (spec/navigation/mobile.md; Figma: Nav Drawer #1 and #2): links to Telegram and
 * GitHub, the sections with the menu of each, and the theme and language at the bottom. The version and framework stay
 * in the header.
 *
 * "Levels" opens inside the section of the open page, with a sticky row back to the list of sections. "Accordions"
 * shows every section in one list, all expanded at first, and remembers which ones the visitor collapsed. Either way a tap on a page closes the menu.
 */
@Component({
    selector: 'docs-next-mobile-menu',
    imports: [
        NgTemplateOutlet,
        RouterLink,
        KbqIconButton,
        KbqIconModule,
        DocsNextMenuFooter,
        DocsNextSheet
    ],
    templateUrl: './mobile-menu.html',
    styleUrl: './mobile-menu.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextMobileMenu {
    protected readonly state = inject(DocsNextSiteState);
    protected readonly content = inject(DocsNextContent);
    protected readonly navVariant = inject(DocsNextNavVariantState);
    private readonly window = inject(KBQ_WINDOW);
    private readonly injector = inject(Injector);

    protected readonly sheet = viewChild.required(DocsNextSheet);
    private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');
    private readonly sectionScroll = viewChild<ElementRef<HTMLElement>>('sectionScroll');

    protected readonly sections = DOCS_NEXT_SECTIONS;
    protected readonly hasPages = hasPages;

    /** Address of the open page without its subsection, as the items are matched. */
    protected readonly current = computed(() => this.state.rest().slice(0, 2).join('/'));

    /** Menu of every section in the language and framework of the site. */
    protected readonly menus = computed(
        () =>
            new Map<string, DocsNextMenuGroup[]>(
                DOCS_NEXT_SECTIONS.map((section) => [
                    section.id,
                    docsNextMenuGroups(section.id, this.state.locale(), this.state.framework())
                ])
            )
    );

    /** Section the "levels" layout shows; it stays while the pane slides away, so the content does not vanish first. */
    protected readonly levelSection = signal<DocsNextSection | null>(null);

    /** Whether the "levels" layout is inside the section rather than on the list of sections. */
    protected readonly deep = signal(false);

    /** The slide is off while the menu opens, so the level of the open page appears in place. */
    protected readonly animated = signal(false);

    protected readonly expanded = signal<ReadonlySet<string>>(this.readExpanded());

    /** Section whose accordion header is stuck over the list right now. */
    protected readonly stuckSection = signal<string | null>(null);

    open(): void {
        this.sheet().open();
    }

    protected close(): void {
        this.sheet().close();
    }

    protected onOpened(): void {
        const section = DOCS_NEXT_SECTIONS.find(({ id }) => id === this.state.section());

        const level = section && hasPages(section) ? section : null;

        this.animated.set(false);
        this.deep.set(!!level);

        if (level) this.levelSection.set(level);

        // Brings the open page into view once the list has rendered.
        setTimeout(() => {
            this.centerCurrentPage();
            this.updateStuck();
        });
    }

    protected drillIn(section: DocsNextSection): void {
        this.animated.set(true);

        const pane = this.sectionScroll()?.nativeElement;

        if (pane) pane.scrollTop = 0;

        this.levelSection.set(section);
        this.deep.set(true);
        this.focusAfterRender('.docs-next-menu__back');
    }

    protected drillOut(): void {
        this.animated.set(true);
        this.deep.set(false);
        this.focusAfterRender(`.docs-next-menu__pane [data-section="${this.levelSection()?.id}"]`);
    }

    /** The pane left behind turns inert, which would drop the focus; it moves to the other level once that has rendered. */
    private focusAfterRender(selector: string): void {
        afterNextRender(
            () => this.scroller().nativeElement.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true }),
            { injector: this.injector }
        );
    }

    /** Scrolls the list holding the open page, not the nav: scrollIntoView would also move the clipped track sideways. */
    private centerCurrentPage(): void {
        const item = this.scroller().nativeElement.querySelector<HTMLElement>('[aria-current="page"]');
        const list = item?.closest<HTMLElement>('[data-sheet-scroll]');

        if (!item || !list) return;

        const offset = item.getBoundingClientRect().top - list.getBoundingClientRect().top;

        list.scrollTop += offset - (list.clientHeight - item.offsetHeight) / 2;
    }

    /** A header is stuck when it sits at the top of the list while its own pages pass under it. */
    protected updateStuck(): void {
        const scroller = this.scroller().nativeElement;
        const top = scroller.getBoundingClientRect().top;
        const headers = scroller.querySelectorAll<HTMLElement>(
            '.docs-next-menu__accordion-header[aria-expanded="true"]'
        );
        let stuck: string | null = null;

        for (const header of Array.from(headers)) {
            const section = header.parentElement!;

            if (
                Math.round(header.getBoundingClientRect().top) <= Math.round(top) &&
                section.getBoundingClientRect().bottom > header.getBoundingClientRect().bottom
            ) {
                stuck = header.dataset['section'] ?? null;
            }
        }

        this.stuckSection.set(stuck);
    }

    protected toggle(sectionId: string): void {
        const next = new Set(this.expanded());

        if (next.has(sectionId)) {
            next.delete(sectionId);
        } else {
            next.add(sectionId);
        }

        this.expanded.set(next);
        // A collapsed section can leave the list scrolled so that another header now sits on top.
        setTimeout(() => this.updateStuck());

        try {
            this.window.localStorage.setItem(EXPANDED_STORAGE_KEY, JSON.stringify([...next]));
        } catch {
            // Not remembered then.
        }
    }

    /** Every section is expanded until the visitor collapses one. */
    private readExpanded(): ReadonlySet<string> {
        const all = new Set(DOCS_NEXT_SECTIONS.filter(hasPages).map(({ id }) => id));

        try {
            const stored = this.window.localStorage.getItem(EXPANDED_STORAGE_KEY);

            return stored === null ? all : new Set(JSON.parse(stored));
        } catch {
            return all;
        }
    }
}
