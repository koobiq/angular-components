import { CdkObserveContent } from '@angular/cdk/observers';
import { Platform } from '@angular/cdk/platform';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    ElementRef,
    inject,
    input,
    QueryList,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { isUndefined } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
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
    imports: [KbqIconModule, CdkObserveContent],
    templateUrl: './tab-header.html',
    styleUrl: './tab-header.scss',
    changeDetection: ChangeDetectionStrategy.Default,
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

    @ContentChildren(KbqTabLabelWrapper, { descendants: false }) readonly items: QueryList<KbqTabLabelWrapper>;
    @ViewChild('tabListContainer', { static: true }) readonly tabListContainer: ElementRef;
    @ViewChild('tabList', { static: true }) readonly tabList: ElementRef;
    @ViewChild('nextPaginator') readonly nextPaginator: ElementRef<HTMLElement>;
    @ViewChild('previousPaginator') readonly previousPaginator: ElementRef<HTMLElement>;

    private readonly isBrowser = inject(Platform).isBrowser;

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

    protected itemSelected(event: KeyboardEvent): void {
        event.preventDefault();
    }
}
