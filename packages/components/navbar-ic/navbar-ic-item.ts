import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    Directive,
    ElementRef,
    inject,
    Input,
    NgZone,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';
import { IFocusableOption } from '@koobiq/cdk/a11y';
import { ENTER, RIGHT_ARROW, SPACE } from '@koobiq/cdk/keycodes';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import {
    KBQ_WINDOW,
    kbqInjectNativeElement,
    KbqRectangleItem,
    PopUpPlacements,
    PopUpTriggers
} from '@koobiq/components/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqFormField } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTooltipTrigger, TooltipModifier } from '@koobiq/components/tooltip';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { KbqNavbarIc } from './navbar-ic';
import { toggleNavbarIcItemAnimation } from './navbar-ic.animation';

/**
 * The maximum number of characters that can be placed in a title without being wrapped.
 */
export const kbqMaxSymbolsInHeaderTitle = 22;

export interface KbqNavbarFocusableItemEvent {
    item: KbqNavbarIcFocusableItem;
}

/**
 * @deprecated Will be removed in the next major release.
 */
@Directive({
    selector: '[kbqNavbarIcLogo]',
    host: {
        class: 'kbq-navbar-ic-logo'
    }
})
export class KbqNavbarIcLogo {}

/**
 * @deprecated Will be removed in the next major release.
 */
@Directive({
    selector: '[kbqNavbarIcTitle]',
    host: {
        class: 'kbq-navbar-ic-title',
        '[class.kbq-navbar-ic-title_text-overflown]': 'isTextOverflown',

        '(mouseenter)': 'hovered.next(true)',
        '(mouseleave)': 'hovered.next(false)'
    }
})
export class KbqNavbarIcTitle implements AfterViewInit {
    protected readonly isBrowser = inject(Platform).isBrowser;
    protected readonly nativeElement = kbqInjectNativeElement();
    private readonly window = inject(KBQ_WINDOW);

    readonly hovered = new Subject<boolean>();

    outerElementWidth: number;
    isTextOverflown: boolean = false;

    get text(): string {
        return this.nativeElement.textContent || '';
    }

    get isOverflown() {
        return this.nativeElement.scrollWidth > this.nativeElement.clientWidth;
    }

    ngAfterViewInit(): void {
        this.outerElementWidth = this.getOuterElementWidth();

        this.checkTextOverflown();
    }

    getOuterElementWidth(): number {
        if (!this.isBrowser) return 0;

        const { width, marginLeft, marginRight } = this.window.getComputedStyle(this.nativeElement);

        return [width, marginLeft, marginRight].reduce((acc, item) => acc + parseInt(item) || 0, 0);
    }

    checkTextOverflown() {
        this.isTextOverflown = this.text.length > kbqMaxSymbolsInHeaderTitle;
    }
}

/**
 * @deprecated Will be removed in the next major release.
 */
@Directive({
    selector: '[kbqNavbarIcDivider]',
    host: {
        class: 'kbq-navbar-ic-divider'
    }
})
export class KbqNavbarIcDivider {}

/**
 * @deprecated Will be removed in the next major release.
 */
@Directive({
    selector:
        'kbq-navbar-ic-item, [kbq-navbar-ic-item], kbq-navbar-ic-header, [kbq-navbar-ic-header], kbq-navbar-ic-toggle',
    host: {
        '[attr.tabindex]': '-1',
        '[attr.disabled]': 'disabled || null',

        class: 'kbq-navbar-ic-focusable-item',
        '[class.kbq-disabled]': 'disabled',

        '(focus)': 'focusHandler()',
        '(blur)': 'blurHandler()'
    }
})
export class KbqNavbarIcFocusableItem implements AfterContentInit, AfterViewInit, OnDestroy, IFocusableOption {
    protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    protected readonly changeDetector = inject(ChangeDetectorRef);
    protected readonly focusMonitor = inject(FocusMonitor);
    protected readonly ngZone = inject(NgZone);

    /** @docs-private */
    @ContentChild(KbqNavbarIcTitle) title: KbqNavbarIcTitle;
    /** @docs-private */
    @ContentChild(KbqButton) button: KbqButton;
    /** @docs-private */
    @ContentChild(KbqFormField) formField: KbqFormField;

    get tooltip(): KbqTooltipTrigger {
        return this._tooltip;
    }

    private _tooltip: KbqTooltipTrigger;

    readonly onFocus = new Subject<KbqNavbarFocusableItemEvent>();

    readonly onBlur = new Subject<KbqNavbarFocusableItemEvent>();

    get hasFocus(): boolean {
        return this._hasFocus;
    }

    set hasFocus(value: boolean) {
        this._hasFocus = value;
    }

    private _hasFocus: boolean = false;

    /** Whether the item is disabled. */
    @Input({ transform: booleanAttribute })
    get disabled() {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this._disabled) {
            this._disabled = value;
            this.changeDetector.markForCheck();
        }
    }

    private _disabled = false;

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.elementRef);
    }

    ngAfterContentInit(): void {
        if (this.button) {
            this.button.tabIndex = -1;
        }
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef);
    }

    setTooltip(value: KbqTooltipTrigger) {
        this._tooltip = value;
    }

    focus(origin?: FocusOrigin): void {
        if (this.disabled || this.hasFocus) {
            return;
        }

        if (origin === 'keyboard') {
            this.focusMonitor.focusVia(this.elementRef, origin);
        }

        this.tooltip?.show();
        this.focusHandler();
    }

    /** @docs-private */
    focusHandler() {
        if (this.disabled || this.hasFocus) return;

        this.onFocus.next({ item: this });

        this.hasFocus = true;

        this.changeDetector.markForCheck();

        this.elementRef.nativeElement.focus();
    }

    /** @docs-private */
    blurHandler(): void {
        // When animations are enabled, Angular may end up removing the option from the DOM a little
        // earlier than usual, causing it to be blurred and throwing off the logic in the list
        // that moves focus not the next item. To work around the issue, we defer marking the option
        // as not focused until the next time the zone stabilizes.
        this.ngZone.onStable
            .asObservable()
            .pipe(take(1))
            .subscribe(() => {
                this.ngZone.run(() => {
                    this._hasFocus = false;

                    this.tooltip?.hide();

                    if (this.button?.hasFocus) {
                        return;
                    }

                    this.onBlur.next({ item: this });
                });
            });
    }

    getLabel(): string {
        return this.title?.text || '';
    }
}

/**
 * @deprecated Will be removed in the next major release.
 */
@Component({
    selector: 'kbq-navbar-ic-item, [kbq-navbar-ic-item]',
    imports: [KbqIcon],
    templateUrl: './navbar-ic-item.html',
    styleUrl: './navbar-ic-item.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqNavbarIcItem',
    host: {
        class: 'kbq-navbar-ic-item',
        '[class.kbq-navbar-ic-item_with-title]': '!!title',
        '(keydown)': 'onKeyDown($event)'
    },
    hostDirectives: [KbqRectangleItem],
    animations: [toggleNavbarIcItemAnimation()]
})
export class KbqNavbarIcItem extends KbqTooltipTrigger implements AfterContentInit {
    readonly rectangleElement = inject(KbqRectangleItem);
    readonly navbar = inject(KbqNavbarIc);
    readonly navbarFocusableItem = inject(KbqNavbarIcFocusableItem);

    private changeDetectorRef = inject(ChangeDetectorRef);
    private dropdownTrigger = inject(KbqDropdownTrigger, { optional: true });
    private tooltip = inject(KbqTooltipTrigger, { optional: true });

    /** @docs-private */
    @ContentChild(KbqNavbarIcTitle) title: KbqNavbarIcTitle;
    /** @docs-private */
    @ContentChild(KbqIcon) icon: KbqIcon;
    /** @docs-private */
    @ContentChild(KbqButtonCssStyler) button: KbqButtonCssStyler;

    @Input('kbqTrigger')
    get trigger(): string {
        return this._trigger;
    }

    set trigger(value: string) {
        if (value) {
            this._trigger = value;

            this.initListeners();
        }
    }

    set collapsed(value: boolean) {
        if (this._collapsed !== value) {
            this._collapsed = value;

            this.updateTooltip();
        }
    }

    private _collapsed = false;

    get croppedText(): string {
        return this.title?.isOverflown ? this.titleText : '';
    }

    get titleText(): string {
        return this.title?.text;
    }

    get disabled(): boolean {
        return this.collapsed || !this.hasCroppedText || this._disabled;
    }

    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }

    get hasDropDownTrigger(): boolean {
        return !!this.dropdownTrigger;
    }

    get showDropDownAngle(): boolean {
        return this.hasDropDownTrigger && !this.collapsed;
    }

    get hasCroppedText(): boolean {
        return !!this.title?.isOverflown;
    }

    constructor() {
        super();

        if (this.dropdownTrigger) {
            this.dropdownTrigger.openByArrowDown = false;
        }

        this.rectangleElement.state.subscribe(() => {
            this.disabled = this.collapsed = this.rectangleElement.collapsed;

            this.changeDetectorRef.markForCheck();
        });

        this._trigger = `${PopUpTriggers.Hover}`;

        this.navbarFocusableItem.setTooltip(this);

        if (this.tooltip) {
            this.tooltip.arrow = false;
            this.tooltip.offset = 0;

            this.tooltip['overlayConfig'].panelClass = 'kbq-tooltip-panel_horizontal-navbar';
        }
    }

    ngAfterContentInit(): void {
        if (this.dropdownTrigger?.dropdown) {
            this.dropdownTrigger.dropdown.overlapTriggerX = false;
            this.dropdownTrigger.dropdown.overlapTriggerY = true;
            // needs to shift dropdown to the left by 8 pixels
            this.dropdownTrigger.offsetX = -8;
        }

        this.updateTooltip();
    }

    /** @docs-private */
    updateTooltip(): void {
        if (!this.collapsed && this.hasCroppedText) {
            this.content = this.croppedText;
        }

        this.placement = PopUpPlacements.Right;

        this.changeDetectorRef.markForCheck();
    }

    /** @docs-private */
    onKeyDown($event: KeyboardEvent) {
        if (!this.hasDropDownTrigger) {
            return;
        }

        if (this.dropdownTrigger && this.rectangleElement && $event.keyCode === RIGHT_ARROW) {
            this.dropdownTrigger.openedBy = 'keyboard';
            this.dropdownTrigger.open();

            $event.stopPropagation();
            $event.preventDefault();
        }
    }
}

/**
 * @deprecated Will be removed in the next major release.
 */
@Component({
    selector: 'kbq-navbar-ic-toggle',
    imports: [KbqIcon],
    template: `
        <div class="kbq-navbar-ic-item__inner">
            @if (navbar.pinned) {
                <i kbq-icon [class.kbq-bars-arrow-left_16]="navbar.expanded"></i>
                <ng-content select="[kbqNavbarIcTitle]">{{ localeData.collapseButton }}</ng-content>
            } @else if ((navbar.expandedByHoverOrFocus || navbar.expandedByToggle) && !navbar.pinned) {
                <i kbq-icon [class.kbq-bars-arrow-right_16]="navbar.expanded"></i>
                {{ localeData.pinButton }}
            } @else {
                <i kbq-icon [class.kbq-bars-arrow-right_16]="!navbar.expanded"></i>
            }
        </div>
    `,
    styleUrls: ['./navbar-ic.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-navbar-ic-item kbq-navbar-ic-toggle',
        '[class.kbq-collapsed]': '!navbar.expanded',
        '[class.kbq-expanded]': 'navbar.expanded',
        '(keydown)': 'onKeydown($event)',
        '(click)': 'toggle()'
    },
    hostDirectives: [KbqRectangleItem]
})
export class KbqNavbarIcToggle {
    readonly navbar = inject(KbqNavbarIc);
    readonly rectangleElement = inject(KbqRectangleItem);

    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    protected modifier: TooltipModifier = TooltipModifier.Default;

    /** localized data
     * @docs-private */
    get localeData() {
        return this.navbar?.configuration.toggle;
    }

    constructor() {
        this.rectangleElement.state.subscribe(() => this.changeDetectorRef.markForCheck());
    }

    /** @docs-private */
    onKeydown($event: KeyboardEvent) {
        if ([SPACE, ENTER].includes($event.keyCode)) {
            this.toggle();

            $event.stopPropagation();
            $event.preventDefault();
        }
    }

    toggle = () => {
        if ((this.navbar.expandedByHoverOrFocus || this.navbar.expandedByToggle) && !this.navbar.pinned) {
            this.navbar.pinned = true;
        } else {
            this.navbar.pinned = false;
            this.navbar.toggle();
        }

        this.changeDetectorRef.detectChanges();
    };
}
