import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { DocsNextPageOutline } from '../services/page-outline';
import { docsNextIsPlainClick } from '../services/plain-click';
import { DocsNextSiteState } from '../services/site-state';

/** How long the panel stays after the mouse has left it, so that a pass across the edge does not close it. */
const CLOSE_DELAY = 300;

/**
 * "On this page" on a tablet: a rail of ticks, one for each heading of the article with the one the reader is at
 * marked, and a panel with the list of the headings that the rail opens. The rail opens it by a press (a click, a tap,
 * Enter or Space) and, for a mouse, by pointing at it too. The panel stands right after the button, so Tab goes from the
 * one into the other; Escape closes it and gives the focus back to the button.
 */
@Component({
    selector: 'docs-next-toc-rail',
    template: `
        <nav class="docs-next-toc-rail" [attr.aria-label]="state.t('onThisPage')">
            <button
                #trigger
                aria-controls="docs-next-toc-rail-panel"
                class="docs-next-toc-rail__trigger"
                type="button"
                [attr.aria-expanded]="open()"
                [attr.aria-label]="state.t('onThisPage')"
                [style.--docs-next-toc-rail-count]="outline.links().length"
                (click)="toggle()"
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
        </nav>
    `,
    styleUrl: './toc-rail.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[style.display]': 'outline.links().length ? null : "none"',
        '(document:pointerdown)': 'onOutsidePress($event)',
        '(focusout)': 'onFocusOut($event)',
        '(keydown.escape)': 'close(true)',
        '(pointerenter)': 'onPointer($event, true)',
        '(pointerleave)': 'onPointer($event, false)'
    }
})
export class DocsNextTocRail {
    protected readonly state = inject(DocsNextSiteState);
    protected readonly outline = inject(DocsNextPageOutline);
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

    protected readonly open = signal(false);
    private closeTimer?: ReturnType<typeof setTimeout>;

    protected toggle(): void {
        if (this.open()) {
            this.close();
        } else {
            this.show();
        }
    }

    protected close(returnFocus = false): void {
        clearTimeout(this.closeTimer);

        if (!this.open()) return;

        this.open.set(false);

        if (returnFocus) this.trigger().nativeElement.focus();
    }

    /** Pointing opens the panel for a mouse only: for a finger the press does it, and a touch is no hover. */
    protected onPointer(event: PointerEvent, inside: boolean): void {
        if (event.pointerType !== 'mouse') return;

        clearTimeout(this.closeTimer);

        if (inside) {
            this.show();
        } else {
            this.closeTimer = setTimeout(() => this.close(), CLOSE_DELAY);
        }
    }

    protected onFocusOut(event: FocusEvent): void {
        const next = event.relatedTarget as Node | null;

        // Tab out of the panel closes it; a press on a part of it that takes no focus does not.
        if (next && !this.host.contains(next)) this.close();
    }

    protected onOutsidePress(event: PointerEvent): void {
        if (this.open() && !this.host.contains(event.target as Node)) this.close();
    }

    protected go(event: MouseEvent, id: string): void {
        if (!docsNextIsPlainClick(event)) return;

        event.preventDefault();
        this.close();
        this.outline.scrollTo(id);
    }

    private show(): void {
        this.open.set(true);
    }
}
