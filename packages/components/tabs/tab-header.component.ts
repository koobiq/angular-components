import { CdkObserveContent } from '@angular/cdk/observers';
import { Platform } from '@angular/cdk/platform';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    contentChildren,
    ElementRef,
    inject,
    input,
    QueryList,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { isUndefined, kbqQueryListFrom } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { KbqPaginatedTabHeader } from './paginated-tab-header';
import { KbqTabLabelWrapper } from './tab-label-wrapper.directive';

/**
 * The directions that scrolling can go in when the header's tabs exceed the header width. 'After'
 * will scroll the header towards the end of the tabs list and 'before' will scroll towards the
 * beginning of the list.
 */
export type ScrollDirection = 'after' | 'before';

/** Corresponds to `--kbq-tabs-size-tab-item-padding-horizontal` on text/icon+text tabs. */
const TAB_PADDING = 12;

/**
 * The header of the tab group which displays a list of all the tabs in the tab group.
 * When the tabs list's width exceeds the width of the header container,
 * then arrows will be displayed to allow the user to scroll
 * left and right across the header.
 * @docs-private
 */
@Component({
    selector: 'kbq-tab-header',
    imports: [KbqIconModule, CdkObserveContent, KbqScrollbarViewport],
    templateUrl: './tab-header.html',
    styleUrl: './tab-header.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-tab-header',
        '[class.kbq-tab-header_vertical]': 'vertical',
        '[class.kbq-tab-header_underlined]': 'underlined()',
        '[class.kbq-tab-header__pagination-controls_enabled]': 'showPaginationControls',
        '[class.kbq-tab-header_rtl]': "getLayoutDirection() == 'rtl'"
    },
    outputs: ['selectFocusedIndex', 'indexFocused']
})
export class KbqTabHeader extends KbqPaginatedTabHeader {
    /** Whether the tabs are underlined. */
    readonly underlined = input<boolean, unknown>(false, { transform: booleanAttribute });

    private readonly itemsQuery = contentChildren(KbqTabLabelWrapper, { descendants: false });
    private readonly itemsList = kbqQueryListFrom(this.itemsQuery);
    private readonly tabListContainerQuery = viewChild.required<ElementRef>('tabListContainer');
    private readonly scrollbarViewportQuery = viewChild.required('tabListContainer', { read: KbqScrollbarViewport });
    private readonly tabListQuery = viewChild.required<ElementRef>('tabList');
    private readonly nextPaginatorQuery = viewChild.required<ElementRef<HTMLElement>>('nextPaginator');
    private readonly previousPaginatorQuery = viewChild.required<ElementRef<HTMLElement>>('previousPaginator');

    /** The label wrappers of the tabs. */
    get items(): QueryList<KbqTabLabelWrapper> {
        return this.itemsList();
    }

    /** The scroll container of the tab labels. */
    get tabListContainer(): ElementRef {
        return this.tabListContainerQuery();
    }

    protected get scrollbarViewport(): KbqScrollbarViewport {
        return this.scrollbarViewportQuery();
    }

    /** The element that holds the tab labels. */
    get tabList(): ElementRef {
        return this.tabListQuery();
    }

    /** The pagination arrow towards the end of the tab list. */
    get nextPaginator(): ElementRef<HTMLElement> {
        return this.nextPaginatorQuery();
    }

    /** The pagination arrow towards the beginning of the tab list. */
    get previousPaginator(): ElementRef<HTMLElement> {
        return this.previousPaginatorQuery();
    }

    private readonly isBrowser = inject(Platform).isBrowser;

    /** The underline as the last check of the tab group measured it, see `ngAfterContentChecked`. */
    private checkedUnderline?: string;

    protected get activeTabOffsetWidth(): number | undefined {
        if (!this.isBrowser) return undefined;

        const item = this.items.get(this.selectedIndex);
        const width = item?.elementRef?.nativeElement?.offsetWidth;

        if (!width || item?.tab?.iconOnlyLabel) return width;

        return width - TAB_PADDING * 2;
    }

    protected get activeTabOffsetLeft(): number | undefined {
        if (!this.isBrowser) return undefined;

        const item = this.items.get(this.selectedIndex);
        const left = item?.elementRef?.nativeElement?.offsetLeft;

        if (isUndefined(left) || item?.tab?.iconOnlyLabel) return left;

        return left + TAB_PADDING;
    }

    protected get activeTabDisabled(): boolean {
        return !!this.items.get(this.selectedIndex)?.disabled;
    }

    override ngAfterContentChecked(): void {
        super.ngAfterContentChecked();

        // The labels belong to the view of the tab group, so a change of their size or state gives this view no
        // notice: the underline is measured again whenever the group is checked, as it was before OnPush.
        const underline = `${this.activeTabOffsetLeft}:${this.activeTabOffsetWidth}:${this.activeTabDisabled}`;

        if (underline !== this.checkedUnderline) {
            this.checkedUnderline = underline;
            this.changeDetectorRef.markForCheck();
        }
    }

    protected itemSelected(event: KeyboardEvent): void {
        event.preventDefault();
    }
}
