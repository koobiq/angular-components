import { FocusMonitor } from '@angular/cdk/a11y';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { CdkObserveContent } from '@angular/cdk/observers';
import { Platform } from '@angular/cdk/platform';
import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    Directive,
    ElementRef,
    forwardRef,
    inject,
    Input,
    input,
    numberAttribute,
    OnDestroy,
    QueryList,
    Renderer2,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isUndefined } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { startWith } from 'rxjs/operators';
import { KbqPaginatedTabHeader } from './paginated-tab-header';

// Increasing integer for generating unique ids for tab nav components.
let nextUniqueId = 0;

/** Corresponds to `--kbq-tabs-size-tab-item-padding-horizontal` on text tabs in underlined mode. */
const TAB_PADDING = 12;

/**
 * Navigation component matching the styles of the tab group header.
 */
@Component({
    selector: '[kbqTabNavBar], [kbq-tab-nav-bar]',
    imports: [
        KbqIconModule,
        CdkObserveContent
    ],
    templateUrl: './tab-nav-bar.html',
    styleUrls: [
        './tab-nav-bar.scss',
        './tabs-tokens.scss',
        // KbqTabLink is a directive and can't have self styles, so we need to include its styles here.
        './tab-link.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-tab-nav-bar',
        '[class.kbq-tab-nav-bar_filled]': '!transparent()',
        '[class.kbq-tab-nav-bar_transparent]': 'transparent()',
        '[class.kbq-tab-nav-bar_on-background]': '!onSurface()',
        '[class.kbq-tab-nav-bar_on-surface]': 'onSurface()',
        '[class.kbq-tab-header_underlined]': 'underlined()',
        '[class.kbq-tab-header__pagination-controls_enabled]': 'showPaginationControls',
        '[attr.role]': 'role'
    },
    exportAs: 'kbqTabNavBar'
})
export class KbqTabNavBar extends KbqPaginatedTabHeader implements AfterContentInit {
    @ViewChild('tabListContainer', { static: true }) readonly tabListContainer: ElementRef;
    @ViewChild('tabList', { static: true }) readonly tabList: ElementRef;
    @ViewChild('nextPaginator') readonly nextPaginator: ElementRef<HTMLElement>;
    @ViewChild('previousPaginator') readonly previousPaginator: ElementRef<HTMLElement>;
    @ContentChildren(forwardRef(() => KbqTabLink), { descendants: true }) readonly items: QueryList<KbqTabLink>;

    private readonly isBrowser = inject(Platform).isBrowser;

    /** Whether the nav bar background should be transparent. */
    readonly transparent = input<boolean, unknown>(false, { transform: booleanAttribute });
    readonly onSurface = input<boolean, unknown>(false, { transform: booleanAttribute });

    /** Whether the nav bar should be underlined. */
    readonly underlined = input<boolean, unknown>(false, { transform: booleanAttribute });

    /**
     * Associated tab panel controlled by the nav bar.
     */
    readonly tabNavPanel = input<KbqTabNavPanel>();

    get role(): string | null {
        return this.tabNavPanel() ? 'tablist' : this.elementRef.nativeElement.getAttribute('role');
    }

    protected get activeTabOffsetWidth(): number | undefined {
        if (!this.isBrowser) return undefined;

        const width = this.items.get(this.selectedIndex)?.elementRef?.nativeElement?.offsetWidth;

        if (!width) return width;

        return width - TAB_PADDING * 2;
    }

    protected get activeTabOffsetLeft(): number | undefined {
        if (!this.isBrowser) return undefined;

        const left = this.items.get(this.selectedIndex)?.elementRef?.nativeElement?.offsetLeft;

        if (isUndefined(left)) return left;

        return left + TAB_PADDING;
    }

    protected get activeTabDisabled(): boolean {
        return !!this.items.get(this.selectedIndex)?.disabled;
    }

    override ngAfterContentInit() {
        // We need this to run before the `changes` subscription in parent to ensure that the `selectedIndex` is
        // up-to-date by the time the `KbqPaginatedTabHeader` starts looking for it.
        this.items.changes.pipe(startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.updateActiveLink();
        });

        super.ngAfterContentInit();
    }

    protected itemSelected() {}

    /** Notifies the component that the active link has been changed. */
    updateActiveLink(): void {
        if (!this.items) {
            return;
        }

        const items = this.items.toArray();

        for (let i = 0; i < items.length; i++) {
            if (items[i].active) {
                this.selectedIndex = i;
                this.changeDetectorRef.markForCheck();

                const tabNavPanel = this.tabNavPanel();

                if (tabNavPanel) {
                    tabNavPanel.activeTabId = items[i].id;
                }

                return;
            }
        }

        // The ink bar should hide itself if no items are active.
        this.selectedIndex = -1;
    }
}

/**
 * Link inside of a KbqTabNavBar.
 */
@Directive({
    selector: '[kbqTabLink], [kbq-tab-link]',
    host: {
        class: 'kbq-tab-link',
        '[class.kbq-selected]': 'active',
        '[class.kbq-tab-label_vertical]': 'vertical',
        '[class.kbq-tab-label_horizontal]': '!vertical',
        '[class.kbq-tab-label_underlined]': 'underlined',
        '[class.kbq-disabled]': 'disabled',

        '[attr.id]': 'id',
        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',
        '[attr.aria-disabled]': 'disabled',
        '[attr.aria-selected]': 'ariaSelected',
        '[attr.role]': 'role',
        '[attr.aria-controls]': 'ariaControls',
        '[attr.aria-current]': 'ariaCurrent',

        '(focus)': 'handleFocus()',
        '(keydown)': 'handleKeydown($event)'
    },
    exportAs: 'kbqTabLink'
})
export class KbqTabLink implements OnDestroy, AfterViewInit {
    /** Unique id for the link. */
    // TODO: Skipped for migration because:
    //  Class of this input is referenced in the signature of another class.
    @Input() id = `kbq-tab-link-${nextUniqueId++}`;

    /** Whether the link is active. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get active(): boolean {
        return this._active;
    }

    set active(value: boolean) {
        if (value !== this._active) {
            this._active = value;
            this.tabNavBar.updateActiveLink();
        }
    }

    /** Whether the tab link is active or not. */
    private _active: boolean = false;

    get vertical(): boolean {
        return this.tabNavBar.vertical;
    }

    get underlined(): boolean {
        return this.tabNavBar.underlined();
    }

    /** Whether the tab link is disabled. */
    // TODO: Skipped for migration because:
    //  Class of this input is referenced in the signature of another class.
    @Input({ transform: booleanAttribute }) disabled: boolean = false;

    /** Link tab index. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: numberAttribute })
    get tabIndex(): number {
        if (this.tabNavBar.tabNavPanel()) {
            return this.active && !this.disabled ? this._tabIndex : -1;
        } else {
            return this.disabled ? -1 : this._tabIndex;
        }
    }

    set tabIndex(value: number) {
        this._tabIndex = value;
    }

    private _tabIndex: number = 0;

    /** Link aria-selected attribute value. */
    protected get ariaSelected(): string | null {
        if (this.tabNavBar.tabNavPanel()) {
            return this.active ? 'true' : 'false';
        } else {
            return this.elementRef.nativeElement.getAttribute('aria-selected');
        }
    }

    /** Link role attribute value. */
    protected get role(): string | null {
        return this.tabNavBar.tabNavPanel() ? 'tab' : this.elementRef.nativeElement.getAttribute('role');
    }

    /** Link aria-controls attribute value. */
    protected get ariaControls(): string | null {
        const tabNavPanel = this.tabNavBar.tabNavPanel();

        return tabNavPanel ? tabNavPanel?.id() : this.elementRef.nativeElement.getAttribute('aria-controls');
    }

    /** Link aria-current attribute value. */
    protected get ariaCurrent(): string | null {
        return this.active && !this.tabNavBar.tabNavPanel() ? 'page' : null;
    }

    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly renderer = inject(Renderer2);
    private readonly tabNavBar = inject(KbqTabNavBar);

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.elementRef.nativeElement);

        this.addClassModifierForIcons(Array.from(this.elementRef.nativeElement.querySelectorAll('.kbq-icon')));
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    private addClassModifierForIcons(icons: HTMLElement[]) {
        const twoIcons = 2;
        const [firstIconElement, secondIconElement] = icons;

        if (icons.length === 1) {
            const COMMENT_NODE = 8;

            if (firstIconElement.nextSibling && firstIconElement.nextSibling.nodeType !== COMMENT_NODE) {
                this.renderer.addClass(firstIconElement, 'kbq-icon_left');
            }

            if (firstIconElement.previousSibling && firstIconElement.previousSibling.nodeType !== COMMENT_NODE) {
                this.renderer.addClass(firstIconElement, 'kbq-icon_right');
            }
        } else if (icons.length === twoIcons) {
            this.renderer.addClass(firstIconElement, 'kbq-icon_left');
            this.renderer.addClass(secondIconElement, 'kbq-icon_right');
        }
    }

    /** Focuses the tab link. */
    focus(): void {
        this.elementRef.nativeElement.focus();
    }

    /** Handles the focus event. */
    protected handleFocus() {
        // Since we allow navigation through tabbing in the nav bar, we have to update the focused index whenever the
        // link receives focus.
        this.tabNavBar.focusIndex = this.tabNavBar.items.toArray().indexOf(this);
    }

    /** Handles the keydown event. */
    protected handleKeydown(event: KeyboardEvent) {
        if (event.keyCode === SPACE || event.keyCode === ENTER) {
            if (this.disabled) {
                event.preventDefault();
            } else if (this.tabNavBar.tabNavPanel()) {
                // Only prevent the default action on space since it can scroll the page.
                // Don't prevent enter since it can break link navigation.
                if (event.keyCode === SPACE) {
                    event.preventDefault();
                }

                this.elementRef.nativeElement.click();
            }
        }
    }
}

/**
 * Tab panel component associated with KbqTabNav.
 */
@Directive({
    selector: '[kbqTabNavPanel]',
    host: {
        class: 'kbq-tab-nav-panel',

        '[attr.id]': 'id()',
        '[attr.aria-labelledby]': 'activeTabId',

        role: 'tabpanel'
    },
    exportAs: 'kbqTabNavPanel'
})
export class KbqTabNavPanel {
    /** Unique id for the tab panel. */
    readonly id = input(`kbq-tab-nav-panel-${nextUniqueId++}`);

    /** Id of the active tab in the nav bar. */
    activeTabId?: string;
}
