import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, viewChild } from '@angular/core';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqIconButton } from '@koobiq/components/icon';
import { DocsNextOutlineItem, DocsNextPageOutline } from '../services/page-outline';
import { DocsNextSiteState } from '../services/site-state';
import { DocsNextSheet } from './sheet';

interface DocsNextOutlineBranch {
    parent: DocsNextOutlineItem;
    children: DocsNextOutlineItem[];
}

/**
 * "On this page" on a phone (spec/components/page-toc.md; Figma: On this page, 66:34649): as high as its list, it
 * grows to the top of the screen once the list scrolls, the heading of the open branch sticks on top, and the open
 * section is in view when it opens. A tap closes it and goes to the heading.
 */
@Component({
    selector: 'docs-next-toc-sheet',
    imports: [KbqIconButton, DocsNextSheet],
    template: `
        <docs-next-sheet [growOnScroll]="true" [label]="state.t('onThisPage')" (opened)="onOpened()">
            <div class="docs-next-toc-sheet__top">
                <h2 class="docs-next-toc-sheet__title">{{ state.t('onThisPage') }}</h2>
                <button
                    kbq-icon-button="kbq-xmark_16"
                    class="docs-next-toc-sheet__close"
                    color="contrast"
                    size="compact"
                    type="button"
                    [attr.aria-label]="state.t('close')"
                    (click)="sheet().close()"
                ></button>
            </div>

            <div #scroller class="docs-next-toc-sheet__scroll" data-sheet-scroll>
                @for (branch of branches(); track branch.parent.id) {
                    <div class="docs-next-toc-sheet__branch">
                        <a
                            class="docs-next-toc-sheet__item docs-next-toc-sheet__item_parent"
                            [attr.aria-current]="branch.parent.id === outline.activeId() ? 'location' : null"
                            [class.docs-next-toc-sheet__item_sticky]="branch.children.length > 0"
                            [href]="'#' + branch.parent.id"
                            (click)="go($event, branch.parent.id)"
                        >
                            {{ branch.parent.title }}
                        </a>
                        @for (child of branch.children; track child.id) {
                            <a
                                class="docs-next-toc-sheet__item docs-next-toc-sheet__item_child"
                                [attr.aria-current]="child.id === outline.activeId() ? 'location' : null"
                                [href]="'#' + child.id"
                                (click)="go($event, child.id)"
                            >
                                {{ child.title }}
                            </a>
                        }
                    </div>
                }
            </div>
        </docs-next-sheet>
    `,
    styleUrl: './toc-sheet.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextTocSheet {
    protected readonly state = inject(DocsNextSiteState);
    protected readonly outline = inject(DocsNextPageOutline);
    private readonly window = inject(KBQ_WINDOW);

    protected readonly sheet = viewChild.required(DocsNextSheet);
    private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');

    /** Headings grouped under the top level, so the parent of a long branch can stick on top. */
    protected readonly branches = computed(() =>
        this.outline.items().reduce<DocsNextOutlineBranch[]>((branches, item) => {
            if (item.level === 0 || !branches.length) {
                branches.push({ parent: item, children: [] });
            } else {
                branches[branches.length - 1].children.push(item);
            }

            return branches;
        }, [])
    );

    open(): void {
        this.sheet().open();
    }

    protected onOpened(): void {
        setTimeout(() => {
            this.scroller()
                .nativeElement.querySelector('[aria-current="location"]')
                ?.scrollIntoView({ block: 'center' });
        });
    }

    protected go(event: Event, id: string): void {
        event.preventDefault();
        this.sheet().close();
        // The page scrolls once the dialog has given it back.
        this.window.requestAnimationFrame(() => this.outline.scrollTo(id));
    }
}
