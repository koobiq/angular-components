import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Platform } from '@angular/cdk/platform';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    ViewEncapsulation,
    booleanAttribute,
    effect,
    inject,
    input,
    signal
} from '@angular/core';

/**
 * A styling layer over a native `<table>`: it applies the library's spacing, typography and colors and
 * leaves the semantics to the platform. Sorting, resizing and virtual scrolling are out of scope — only
 * standard HTML table capabilities are available.
 */
@Component({
    selector: 'table[kbq-table]',
    template: '<ng-content />',
    styleUrls: ['table.scss', 'table-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-table',
        '[class.kbq-table_bordered]': 'border()',
        '[class.kbq-table_disable-hover]': 'disableHover()',
        '[class.kbq-table_sticky-header]': 'stickyHeader()',
        '[style.--kbq-table-size-sticky-header-height.px]': 'stickyHeaderHeight()'
    },
    exportAs: 'kbqTable'
})
export class KbqTable {
    private readonly elementRef = inject<ElementRef<HTMLTableElement>>(ElementRef);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly platform = inject(Platform);

    /**
     * Whether a line is drawn under every body row. Toggles the `kbq-table_bordered` class.
     *
     * @default false
     */
    readonly border = input(false, { transform: booleanAttribute });

    /**
     * Whether the background change on row hover is suppressed. Toggles the `kbq-table_disable-hover`
     * class. Use it when rows are not interactive and the highlight would be misleading.
     *
     * @default false
     */
    readonly disableHover = input(false, { transform: booleanAttribute });

    /**
     * Whether the header stays visible while the table scrolls. Toggles the `kbq-table_sticky-header`
     * class.
     *
     * @default false
     */
    readonly stickyHeader = input(false, { transform: booleanAttribute });

    /**
     * Measured height of the pinned header, published as `--kbq-table-size-sticky-header-height`. Body
     * cells and the focusable content inside them use it as `scroll-margin-block-start`, so scrolling a
     * control into view does not leave it under the header (WCAG 2.2 SC 2.4.11).
     */
    protected readonly stickyHeaderHeight = signal<number | null>(null);

    constructor() {
        effect((onCleanup) => {
            const head = this.stickyHeader() ? this.elementRef.nativeElement.tHead : null;

            if (!head || !this.platform.isBrowser) {
                this.stickyHeaderHeight.set(null);

                return;
            }

            const subscription = this.resizeObserver
                .observe(head)
                .subscribe(() => this.stickyHeaderHeight.set(head.offsetHeight));

            onCleanup(() => subscription.unsubscribe());
        });
    }
}
