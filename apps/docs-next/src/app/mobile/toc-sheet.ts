import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    signal,
    viewChild
} from '@angular/core';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { DocsNextPageOutline } from '../services/page-outline';
import { DocsNextSiteState } from '../services/site-state';

/** Height of the row at the bottom of the island, in both states. */
const BAR_HEIGHT = 48;

/**
 * "On this page" on a phone (Figma: New Docs, 122:35907): an island floating at the bottom of the screen with the
 * heading the reader is at and how far the page is read. A tap grows the island itself into a panel with the
 * headings of the article; a tap on a heading shrinks it back and goes there.
 *
 * The panel is laid out at its open size all the time, and the island is a clip of it, so the morph animates only
 * `clip-path`, `transform` and `opacity`.
 */
@Component({
    selector: 'docs-next-toc-sheet',
    imports: [CdkTrapFocus, KbqIconModule],
    template: `
        <div class="docs-next-toc-sheet__backdrop"></div>

        <div
            class="docs-next-toc-sheet"
            [attr.aria-label]="open() ? state.t('onThisPage') : null"
            [attr.aria-modal]="open() ? true : null"
            [attr.role]="open() ? 'dialog' : null"
            [cdkTrapFocus]="open()"
            [style.height.px]="openHeight() || null"
        >
            <div class="docs-next-toc-sheet__shadow"></div>

            <div class="docs-next-toc-sheet__surface">
                <nav
                    #list
                    class="docs-next-toc-sheet__list"
                    id="docs-next-toc-sheet-list"
                    [attr.aria-label]="state.t('onThisPage')"
                    [inert]="!open()"
                >
                    @for (item of outline.items(); track item.id) {
                        <a
                            class="docs-next-toc-sheet__item"
                            [attr.aria-current]="item.id === outline.activeId() ? 'location' : null"
                            [class.docs-next-toc-sheet__item_nested]="item.level > 0"
                            [href]="'#' + item.id"
                            (click)="go($event, item.id)"
                        >
                            <span class="docs-next-toc-sheet__item-text">{{ item.title }}</span>
                        </a>
                    }
                </nav>

                <div class="docs-next-toc-sheet__bar">
                    <button
                        #toggle
                        aria-controls="docs-next-toc-sheet-list"
                        class="docs-next-toc-sheet__toggle"
                        type="button"
                        [attr.aria-expanded]="open()"
                        [attr.aria-label]="open() ? state.t('close') : state.t('onThisPage') + ': ' + activeTitle()"
                        (click)="open() ? close() : show()"
                    ></button>
                    <span class="docs-next-toc-sheet__progress">
                        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16">
                            <circle class="docs-next-toc-sheet__progress-track" cx="8" cy="8" r="7" />
                            <circle
                                class="docs-next-toc-sheet__progress-value"
                                cx="8"
                                cy="8"
                                pathLength="100"
                                r="7"
                                [attr.stroke-dasharray]="outline.progress() + ' 100'"
                            />
                        </svg>
                    </span>
                    <span class="docs-next-toc-sheet__title" aria-hidden="true">{{ activeTitle() }}</span>
                    <i class="docs-next-toc-sheet__chevron" kbq-icon="kbq-chevron-up_16"></i>
                </div>
            </div>
        </div>
    `,
    styleUrl: './toc-sheet.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class.docs-next-toc-sheet_open]': 'open()',
        '(click)': 'onClick($event)',
        '(keydown.escape)': 'close()',
        '[style.display]': 'outline.items().length ? null : "none"'
    }
})
export class DocsNextTocSheet {
    protected readonly state = inject(DocsNextSiteState);
    protected readonly outline = inject(DocsNextPageOutline);
    private readonly window = inject(KBQ_WINDOW);

    private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');
    private readonly toggle = viewChild.required<ElementRef<HTMLButtonElement>>('toggle');

    protected readonly open = signal(false);
    protected readonly openHeight = signal(0);

    protected readonly activeTitle = computed(
        () => this.outline.items().find(({ id }) => id === this.outline.activeId())?.title ?? ''
    );

    constructor() {
        const destroyRef = inject(DestroyRef);

        afterNextRender(() => {
            const onResize = (): void => {
                if (this.open()) this.measure();
            };

            this.window.addEventListener('resize', onResize);
            destroyRef.onDestroy(() => this.window.removeEventListener('resize', onResize));
        });
    }

    protected show(): void {
        this.measure();
        this.open.set(true);

        const list = this.list().nativeElement;
        const active = list.querySelector<HTMLElement>('[aria-current="location"]');

        // The list has the size of the open panel all along, so the open item is centred before the island grows.
        if (active) list.scrollTop = active.offsetTop - (list.clientHeight - active.offsetHeight) / 2;
    }

    protected close(): void {
        if (!this.open()) return;

        this.open.set(false);
        this.toggle().nativeElement.focus({ preventScroll: true });
    }

    // A tap on the backdrop closes the panel; from the keyboard, Escape does.
    protected onClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('docs-next-toc-sheet__backdrop')) this.close();
    }

    protected go(event: Event, id: string): void {
        event.preventDefault();
        this.close();
        this.outline.scrollTo(id);
    }

    /** The panel is as high as its list, which the styles cap at the room the screen has. */
    private measure(): void {
        this.openHeight.set(this.list().nativeElement.offsetHeight + BAR_HEIGHT);
    }
}
