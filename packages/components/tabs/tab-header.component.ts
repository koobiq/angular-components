import { Directionality } from '@angular/cdk/bidi';
import { Platform } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    Inject,
    Input,
    NgZone,
    Optional,
    QueryList,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
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
    templateUrl: 'tab-header.html',
    styleUrls: ['tab-header.scss'],
    inputs: ['selectedIndex'],
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
    /** The index of the active tab. */
    @Input() vertical: boolean = false;
    @Input() underlined: boolean = false;

    @ContentChildren(KbqTabLabelWrapper, { descendants: false }) items: QueryList<KbqTabLabelWrapper>;
    @ViewChild('tabListContainer', { static: true }) tabListContainer: ElementRef;
    @ViewChild('tabList', { static: true }) tabList: ElementRef;
    @ViewChild('nextPaginator') nextPaginator: ElementRef<HTMLElement>;
    @ViewChild('previousPaginator') previousPaginator: ElementRef<HTMLElement>;

    get activeTabOffsetWidth() {
        return this.items.get(this.selectedIndex)?.elementRef?.nativeElement?.offsetWidth + 'px';
    }

    get activeTabOffsetLeft() {
        return this.items.get(this.selectedIndex)?.elementRef?.nativeElement?.offsetLeft + 'px';
    }

    constructor(
        readonly elementRef: ElementRef,
        readonly changeDetectorRef: ChangeDetectorRef,
        viewportRuler: ViewportRuler,
        ngZone: NgZone,
        platform: Platform,
        @Optional() dir: Directionality,
        @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string
    ) {
        super(elementRef, changeDetectorRef, viewportRuler, ngZone, platform, dir, animationMode);
    }

    itemSelected(event: KeyboardEvent) {
        event.preventDefault();
    }
}
