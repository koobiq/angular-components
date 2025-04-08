import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    ElementRef,
    Input,
    QueryList,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqPaginatedTabHeader } from './paginated-tab-header';
import { KbqTabLabelWrapper } from './tab-label-wrapper.directive';

/**
 * The directions that scrolling can go in when the header's tabs exceed the header width. 'After'
 * will scroll the header towards the end of the tabs list and 'before' will scroll towards the
 * beginning of the list.
 */
export type ScrollDirection = 'after' | 'before';

/**
 * The header of the tab group which displays a list of all the tabs in the tab group.
 * When the tabs list's width exceeds the width of the header container,
 * then arrows will be displayed to allow the user to scroll
 * left and right across the header.
 * @docs-private
 */
@Component({
    selector: 'kbq-tab-header',
    templateUrl: './tab-header.html',
    styleUrl: './tab-header.scss',
    outputs: ['selectFocusedIndex', 'indexFocused'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
    host: {
        class: 'kbq-tab-header',
        '[class.kbq-tab-header_vertical]': 'vertical',
        '[class.kbq-tab-header_underlined]': 'underlined',
        '[class.kbq-tab-header__pagination-controls_enabled]': 'showPaginationControls',
        '[class.kbq-tab-header_rtl]': "getLayoutDirection() == 'rtl'"
    }
})
export class KbqTabHeader extends KbqPaginatedTabHeader {
    /** Whether the tabs are underlined. */
    @Input({ transform: booleanAttribute }) underlined: boolean = false;

    @ContentChildren(KbqTabLabelWrapper, { descendants: false }) readonly items: QueryList<KbqTabLabelWrapper>;
    @ViewChild('tabListContainer', { static: true }) readonly tabListContainer: ElementRef;
    @ViewChild('tabList', { static: true }) readonly tabList: ElementRef;
    @ViewChild('nextPaginator') readonly nextPaginator: ElementRef<HTMLElement>;
    @ViewChild('previousPaginator') readonly previousPaginator: ElementRef<HTMLElement>;

    protected get activeTabOffsetWidth(): string | null {
        return this.items.get(this.selectedIndex)?.elementRef?.nativeElement?.offsetWidth;
    }

    protected get activeTabOffsetLeft(): string | null {
        return this.items.get(this.selectedIndex)?.elementRef?.nativeElement?.offsetLeft;
    }

    protected itemSelected(event: KeyboardEvent): void {
        event.preventDefault();
    }
}
