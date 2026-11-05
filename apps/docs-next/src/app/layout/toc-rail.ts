import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    Injector,
    signal,
    viewChild
} from '@angular/core';
import { DocsNextPageOutline } from '../services/page-outline';
import { docsNextIsPlainClick } from '../services/plain-click';
import { DocsNextSiteState } from '../services/site-state';

/** How long the panel stays after the mouse has left it, so that a pass across the edge does not close it. */
const CLOSE_DELAY = 300;

/**
 * "On this page" on a tablet: a rail of ticks, one for each heading of the article with the one the reader is at
 * marked, and a panel with the list of the headings that the rail opens. The rail opens it by a press (a click, a tap,
 * Enter or Space) and, for a mouse, by pointing at it too. The panel hangs under the button, so a press reaches the
 * button while the list is open; Tab goes from the one into the other, Escape closes it and gives the focus back to
 * the button, and the item chosen gives the focus to its heading.
 */
@Component({
    selector: 'docs-next-toc-rail',
    template: `
        <nav
            class="docs-next-toc-rail"
            [attr.aria-label]="state.t('onThisPage')"
            [style.--docs-next-toc-rail-count]="outline.links().length"
        >
            <div class="docs-next-toc-rail__anchor">
                <button
                    #trigger
                    aria-controls="docs-next-toc-rail-panel"
                    class="docs-next-toc-rail__trigger"
                    type="button"
                    [attr.aria-expanded]="open()"
                    [attr.aria-label]="state.t('onThisPage')"
                    (click)="toggle($event)"
                >
                    <span aria-hidden="true" class="docs-next-toc-rail__ticks">
                        @for (item of outline.links(); track item.id) {
                            <span
                                class="docs-next-toc-rail__tick"
                                [class.docs-next-toc-rail__tick_active]="item.id === outline.activeId()"
                                [class.docs-next-toc-rail__tick_nested]="item.level > 0"
                            ></span>
                        }
                    </span>
                </button>

                <div
                    #panel
                    class="docs-next-toc-rail__panel"
                    id="docs-next-toc-rail-panel"
                    [class.docs-next-toc-rail__panel_open]="open()"
                    [inert]="!open()"
                >
                    <ul class="docs-next-toc-rail__list">
                        @for (item of outline.links(); track item.id) {
                            <li>
                                <a
                                    class="docs-next-toc-rail__item"
                                    [attr.aria-current]="item.id === outline.activeId() ? 'location' : null"
                                    [class.docs-next-toc-rail__item_nested]="item.level > 0"
                                    [href]="item.href"
                                    (click)="go($event, item.id)"
                                >
                                    {{ item.title }}
                                </a>
                            </li>
                        }
                    </ul>
                </div>
            </div>
        </nav>
    `,
    styleUrl: './toc-rail.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[style.display]': 'outline.links().length ? null : "none"',
        '(document:pointerdown)': 'onOutsidePress($event)',
        '(document:keydown)': 'onEscape($event)',
        '(focusout)': 'onFocusOut($event)',
        '(keydown)': 'onKeydown($event)',
        '(pointerenter)': 'onPointer($event, true)',
        '(pointerleave)': 'onPointer($event, false)'
    }
})
export class DocsNextTocRail {
    protected readonly state = inject(DocsNextSiteState);
    protected readonly outline = inject(DocsNextPageOutline);
    private readonly document = inject(DOCUMENT);
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    private readonly injector = inject(Injector);
    private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
    private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

    protected readonly open = signal(false);
    private closeTimer?: ReturnType<typeof setTimeout>;
    /** Whether pointing, not a press, opened the panel: the pointer is still over it, so a click does not close it. */
    private openedByHover = false;

    /** A press from the keyboard (a click with no pointer behind it) moves the focus into the list, as a mouse need not. */
    protected toggle(event: MouseEvent): void {
        // A panel the pointer has just opened is pinned by the press: closing it here would close what the pointer
        // opened, and the panel could not be opened again until the pointer left the rail and came back.
        if (this.openedByHover) {
            this.openedByHover = false;

            return;
        }

        if (this.open()) {
            this.close();
        } else {
            this.show(event.detail === 0);
        }
    }

    /**
     * Inside the list the arrows go from one item to the next, and Home and End to the first and the last; on the button
     * the down arrow opens the list. Tab still goes through the items one by one.
     */
    protected onKeydown(event: KeyboardEvent): void {
        const target = event.target as HTMLElement;

        if (target === this.trigger().nativeElement) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();

                if (this.open()) {
                    this.focusItem();
                } else {
                    this.show(true);
                    this.openedByHover = false;
                }
            }

            return;
        }

        const items = this.items();
        const index = items.indexOf(target as HTMLAnchorElement);

        if (index < 0) return;

        const last = items.length - 1;
        const next = {
            ArrowDown: index === last ? 0 : index + 1,
            ArrowUp: index === 0 ? last : index - 1,
            Home: 0,
            End: last
        }[event.key];

        if (next === undefined) return;

        event.preventDefault();
        items[next].focus();
    }

    protected close(returnFocus = false): void {
        clearTimeout(this.closeTimer);

        if (!this.open()) return;

        this.open.set(false);
        this.openedByHover = false;

        if (returnFocus) this.trigger().nativeElement.focus();
    }

    /** Pointing opens the panel for a mouse only: for a finger the press does it, and a touch is no hover. */
    protected onPointer(event: PointerEvent, inside: boolean): void {
        if (event.pointerType !== 'mouse') return;

        clearTimeout(this.closeTimer);

        if (inside) {
            if (!this.open()) {
                this.show();
                this.openedByHover = true;
            }
        } else if (this.openedByHover) {
            // A panel a press has pinned stays open, as a menu does; the one the pointer opened goes with the pointer.
            this.closeTimer = setTimeout(() => this.close(), CLOSE_DELAY);
        }
    }

    protected onFocusOut(event: FocusEvent): void {
        const next = event.relatedTarget as Node | null;

        // Tab out of the panel closes it; a press on a part of it that takes no focus does not.
        if (next && !this.host.contains(next)) this.close();
    }

    /**
     * Escape closes the panel. The pointer opens it with the focus left on the page, so the key is heard on the whole
     * document: what a hover reveals has to be dismissible without moving the pointer (WCAG 1.4.13).
     */
    protected onEscape(event: KeyboardEvent): void {
        if (event.key !== 'Escape' || !this.open()) return;

        // The focus inside the panel goes back to the button; there is none when the pointer has opened it.
        this.close(this.host.contains(this.document.activeElement));
    }

    protected onOutsidePress(event: PointerEvent): void {
        if (this.open() && !this.host.contains(event.target as Node)) this.close();
    }

    protected go(event: MouseEvent, id: string): void {
        if (!docsNextIsPlainClick(event)) return;

        event.preventDefault();

        // Opened by pointing, the panel stays while the pointer is over it, and goes with the pointer.
        const keepsOpen = this.openedByHover;

        if (!keepsOpen) this.close();

        this.outline.scrollTo(id);

        // A panel that has closed under the focus would leave it on `<body>`, and the next Tab would start the page over.
        if (!keepsOpen) this.focusHeading(id);
    }

    private show(focusItem = false): void {
        this.open.set(true);

        // The list is hidden until it has been drawn open, and a hidden element takes no focus.
        if (focusItem) afterNextRender(() => this.focusItem(), { injector: this.injector });
    }

    /** Puts the focus on the heading the link has led to, without calling off the smooth scroll on its way there. */
    private focusHeading(id: string): void {
        const heading = this.document.getElementById(id);

        if (!heading) return;

        // A heading takes no focus of its own, and taking it must not scroll the page a second time.
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
    }

    private items(): HTMLAnchorElement[] {
        return Array.from(this.panel().nativeElement.querySelectorAll('a'));
    }

    /** The item the reader is at, or the first one. */
    private focusItem(): void {
        const items = this.items();

        (items.find((item) => item.getAttribute('aria-current') === 'location') ?? items[0])?.focus();
    }
}
