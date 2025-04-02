import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    DestroyRef,
    Directive,
    ElementRef,
    Input,
    NgZone,
    OnDestroy,
    Optional,
    TemplateRef,
    ViewEncapsulation,
    booleanAttribute,
    inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IFocusableOption } from '@koobiq/cdk/a11y';
import { DOWN_ARROW, ENTER, NUMPAD_DIVIDE, RIGHT_ARROW, SLASH, SPACE } from '@koobiq/cdk/keycodes';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import { PopUpPlacements, PopUpTriggers } from '@koobiq/components/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqFormField } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTooltipTrigger, TooltipModifier } from '@koobiq/components/tooltip';
import { EMPTY, Subject, merge } from 'rxjs';
import { take } from 'rxjs/operators';
import { KbqVerticalNavbar } from './vertical-navbar.component';

export interface KbqNavbarFocusableItemEvent {
    item: KbqNavbarFocusableItem;
}

@Directive({
    selector: 'kbq-navbar-logo, [kbq-navbar-logo]',
    host: {
        class: 'kbq-navbar-logo',
        '(mouseenter)': 'hovered.next(true)',
        '(mouseleave)': 'hovered.next(false)'
    }
})
export class KbqNavbarLogo {
    readonly hovered = new Subject<boolean>();
}

@Directive({
    selector: 'kbq-navbar-item[bento], [kbq-navbar-item][bento]',
    host: {
        class: 'kbq-navbar-bento'
    }
})
export class KbqNavbarBento {}

@Directive({
    selector: 'kbq-navbar-title, [kbq-navbar-title]',
    host: {
        class: 'kbq-navbar-title',
        '[class.kbq-navbar-title_small]': 'isTextOverflown',

        '(mouseenter)': 'hovered.next(true)',
        '(mouseleave)': 'hovered.next(false)'
    }
})
export class KbqNavbarTitle implements AfterViewInit {
    protected readonly isBrowser = inject(Platform).isBrowser;
    protected readonly nativeElement = inject(ElementRef).nativeElement;

    readonly hovered = new Subject<boolean>();

    outerElementWidth: number;
    isTextOverflown: boolean = false;

    get text(): string {
        return this.nativeElement.textContent;
    }

    get isOverflown() {
        return this.nativeElement.scrollWidth > this.nativeElement.clientWidth;
    }

    getOuterElementWidth(): number {
        if (!this.isBrowser) return 0;

        const { width, marginLeft, marginRight } = getComputedStyle(this.nativeElement);

        return [width, marginLeft, marginRight].reduce((acc, item) => acc + parseInt(item) || 0, 0);
    }

    checkTextOverflown() {
        this.isTextOverflown = this.text.length > 18;
    }

    ngAfterViewInit(): void {
        this.outerElementWidth = this.getOuterElementWidth();
    }
}

@Component({
    selector: 'kbq-navbar-brand, [kbq-navbar-brand]',
    exportAs: 'kbqNavbarBrand',
    template: `
        <ng-content />
    `,
    host: {
        class: 'kbq-navbar-brand',
        '[class.kbq-hovered]': 'hovered'
    }
})
export class KbqNavbarBrand implements AfterContentInit {
    @ContentChild(KbqNavbarLogo) logo: KbqNavbarLogo;
    @ContentChild(KbqNavbarTitle) title: KbqNavbarTitle;

    hovered = false;

    get hasBento(): boolean {
        return !!this.navbar?.bento;
    }

    private readonly destroyRef = inject(DestroyRef);

    constructor(@Optional() private navbar: KbqVerticalNavbar) {}

    ngAfterContentInit(): void {
        merge(this.logo ? this.logo.hovered : (EMPTY as any), this.title ? this.title.hovered : (EMPTY as any))
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((value) => (this.hovered = !!value));

        this.navbar?.animationDone.subscribe(() => this.title?.checkTextOverflown());
    }
}

@Directive({
    selector: 'kbq-navbar-divider',
    host: {
        class: 'kbq-navbar-divider'
    }
})
export class KbqNavbarDivider {}

@Directive({
    selector: 'kbq-navbar-item, [kbq-navbar-item], kbq-navbar-brand, [kbq-navbar-brand], kbq-navbar-toggle',
    host: {
        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',

        class: 'kbq-navbar-focusable-item',
        '[class.kbq-navbar-item_has-nested]': '!!nestedElement',
        '[class.kbq-disabled]': 'disabled',

        '(focus)': 'onFocusHandler()',
        '(blur)': 'blur()'
    }
})
export class KbqNavbarFocusableItem implements AfterContentInit, AfterViewInit, OnDestroy, IFocusableOption {
    @ContentChild(KbqNavbarTitle) title: KbqNavbarTitle;

    @ContentChild(KbqButton) button: KbqButton;

    @ContentChild(KbqFormField) formField: KbqFormField;

    get nestedElement(): KbqButton | KbqFormField {
        return this.button || this.formField;
    }

    get tooltip(): KbqTooltipTrigger {
        return this._tooltip;
    }

    private _tooltip: KbqTooltipTrigger;

    readonly onFocus = new Subject<KbqNavbarFocusableItemEvent>();

    readonly onBlur = new Subject<KbqNavbarFocusableItemEvent>();

    get hasFocus(): boolean {
        return !!this.nestedElement?.hasFocus || this._hasFocus;
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

    get tabIndex(): number {
        return -1;
    }

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private changeDetector: ChangeDetectorRef,
        private focusMonitor: FocusMonitor,
        private ngZone: NgZone
    ) {}

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

    onFocusHandler() {
        if (this.disabled || this.hasFocus) {
            return;
        }

        this.onFocus.next({ item: this });

        this.hasFocus = true;

        this.changeDetector.markForCheck();

        this.elementRef.nativeElement.focus();
    }

    focus(origin?: FocusOrigin): void {
        if (this.disabled || this.hasFocus) {
            return;
        }

        if (origin === 'keyboard') {
            this.focusMonitor.focusVia(this.elementRef, origin);
        }

        if (this.nestedElement) {
            this.nestedElement.focusViaKeyboard();

            this.changeDetector.markForCheck();

            return;
        }

        this.tooltip?.show();
        this.onFocusHandler();
    }

    blur(): void {
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

@Directive({
    selector: 'kbq-navbar-item, [kbq-navbar-item], kbq-navbar-divider, kbq-navbar-brand, [kbq-navbar-brand]',
    host: {
        '[class.kbq-vertical]': 'vertical',
        '[class.kbq-horizontal]': 'horizontal',

        '[class.kbq-expanded]': 'vertical && !collapsed',
        '[class.kbq-collapsed]': 'vertical && collapsed'
    }
})
export class KbqNavbarRectangleElement {
    protected readonly isBrowser = inject(Platform).isBrowser;
    protected readonly nativeElement = inject(ElementRef).nativeElement;

    readonly state = new Subject<void>();

    get horizontal(): boolean {
        return this._horizontal;
    }

    set horizontal(value: boolean) {
        this._horizontal = value;

        this.state.next();
    }

    private _horizontal: boolean;

    get vertical(): boolean {
        return this._vertical;
    }

    set vertical(value: boolean) {
        this._vertical = value;

        this.state.next();
    }

    private _vertical: boolean;

    get collapsed(): boolean {
        return this._collapsed;
    }

    set collapsed(value: boolean) {
        this._collapsed = value;

        this.state.next();
    }

    private _collapsed: boolean;

    @ContentChild(KbqButtonCssStyler) button: KbqButtonCssStyler;

    getOuterElementWidth(): number {
        if (!this.isBrowser) return 0;

        const { width, marginLeft, marginRight } = getComputedStyle(this.nativeElement);

        return [width, marginLeft, marginRight].reduce((acc, item) => acc + parseInt(item), 0);
    }
}

@Component({
    selector: 'kbq-navbar-item, [kbq-navbar-item]',
    exportAs: 'kbqNavbarItem',
    templateUrl: './navbar-item.component.html',
    host: {
        class: 'kbq-navbar-item',
        '[class.kbq-navbar-item_collapsed]': 'isCollapsed',
        '[class.kbq-navbar-item_with-title]': '!!title',

        '(keydown)': 'onKeyDown($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqNavbarItem extends KbqTooltipTrigger implements AfterContentInit {
    @ContentChild(KbqNavbarTitle) title: KbqNavbarTitle;

    @ContentChild(KbqIcon) icon: KbqIcon;

    @Input() collapsedText: string;

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

    // todo in future need rename to 'collapsed'
    get isCollapsed(): boolean {
        return this._collapsed ?? this.rectangleElement.collapsed;
    }

    private _collapsed = false;

    get croppedText(): string {
        const croppedTitleText = this.title?.isOverflown ? this.titleText : '';

        return `${croppedTitleText}`;
    }

    @Input()
    get collapsable(): boolean {
        return this._collapsable;
    }

    set collapsable(value: boolean) {
        this._collapsable = coerceBooleanProperty(value);
    }

    private _collapsable: boolean = true;

    get titleText(): string | null {
        return this.collapsedText || this.title?.text || null;
    }

    get disabled(): boolean {
        if (this._disabled !== undefined) {
            return this._disabled;
        }

        return !this.isCollapsed && !this.hasCroppedText;
    }

    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }

    get hasDropDownTrigger(): boolean {
        return !!this.dropdownTrigger;
    }

    get showVerticalDropDownAngle(): boolean {
        return !this.bento && this.hasDropDownTrigger && this.rectangleElement.vertical && !this.isCollapsed;
    }

    get showHorizontalDropDownAngle(): boolean {
        return this.hasDropDownTrigger && this.rectangleElement.horizontal && !this.isCollapsed;
    }

    get hasCroppedText(): boolean {
        return !!this.title?.isOverflown;
    }

    constructor(
        public rectangleElement: KbqNavbarRectangleElement,
        public navbarFocusableItem: KbqNavbarFocusableItem,
        private changeDetectorRef: ChangeDetectorRef,
        @Optional() private dropdownTrigger: KbqDropdownTrigger,
        @Optional() private bento: KbqNavbarBento,
        @Optional() private tooltip: KbqTooltipTrigger
    ) {
        super();

        if (this.hasDropDownTrigger) {
            this.dropdownTrigger.openByArrowDown = false;
        }

        this.rectangleElement.state.subscribe(() => {
            this.collapsed = this.rectangleElement.collapsed;

            this.changeDetectorRef.detectChanges();
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
        this.updateTooltip();
    }

    updateTooltip(): void {
        if (this.isCollapsed) {
            this.content = `${this.titleText || ''}`;
        } else if (!this.isCollapsed && this.hasCroppedText) {
            this.content = this.croppedText;
        }

        if (this.rectangleElement.vertical) {
            this.placement = PopUpPlacements.Right;
        }

        this.changeDetectorRef.markForCheck();
    }

    getTitleWidth(): number {
        return this.title.outerElementWidth;
    }

    onKeyDown($event: KeyboardEvent) {
        if (!this.hasDropDownTrigger) {
            return;
        }

        if (
            (this.rectangleElement.horizontal && $event.keyCode === DOWN_ARROW) ||
            (this.rectangleElement.vertical && $event.keyCode === RIGHT_ARROW)
        ) {
            this.dropdownTrigger.openedBy = 'keyboard';
            this.dropdownTrigger.open();

            $event.stopPropagation();
            $event.preventDefault();
        }
    }
}

@Component({
    selector: 'kbq-navbar-toggle',
    template: `
        @if (!customIcon) {
            <i
                [class.kbq-chevron-left_16]="navbar.expanded"
                [class.kbq-chevron-right_16]="!navbar.expanded"
                kbq-icon
            ></i>
        }

        <ng-content select="[kbq-icon]" />

        @if (navbar.expanded) {
            <div class="kbq-navbar-item__title">
                <ng-content select="kbq-navbar-title" />
            </div>
        }
    `,
    styleUrls: ['./navbar.scss'],
    host: {
        class: 'kbq-navbar-item kbq-navbar-toggle kbq-vertical',
        '[class.kbq-tooltip_open]': 'isOpen',
        '[class.kbq-collapsed]': '!navbar.expanded',
        '[class.kbq-expanded]': 'navbar.expanded',

        '(keydown)': 'onKeydown($event)',
        '(click)': 'toggle()',
        '(touchend)': 'handleTouchend()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqNavbarToggle extends KbqTooltipTrigger implements OnDestroy {
    protected readonly document = inject<Document>(DOCUMENT);

    @ContentChild(KbqIcon) customIcon: KbqIcon;

    @Input('kbqCollapsedTooltip')
    get content(): string | TemplateRef<any> {
        return this._content;
    }

    set content(content: string | TemplateRef<any>) {
        this._content = content;

        this.updateData();
    }

    get disabled(): boolean {
        return this.navbar.expanded;
    }

    protected modifier: TooltipModifier = TooltipModifier.Default;

    constructor(
        public navbar: KbqVerticalNavbar,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        super();

        this.placement = PopUpPlacements.Right;

        const window = this.getWindow();

        if (window) {
            this.ngZone.runOutsideAngular(() => {
                window.addEventListener('keydown', this.windowToggleHandler);
            });
        }
    }

    onKeydown($event: KeyboardEvent) {
        if ([SPACE, ENTER].includes($event.keyCode)) {
            this.toggle();

            $event.stopPropagation();
            $event.preventDefault();
        }

        super.handleKeydown($event);
    }

    ngOnDestroy(): void {
        this.getWindow()?.removeEventListener('keydown', this.windowToggleHandler);
    }

    toggle = () => {
        this.navbar.toggle();

        this.changeDetectorRef.markForCheck();

        this.hide();
    };

    private getWindow(): Window | null {
        return this.document?.defaultView || window;
    }

    private windowToggleHandler = (event: KeyboardEvent) => {
        if (event.ctrlKey && [NUMPAD_DIVIDE, SLASH].includes(event.keyCode)) {
            this.ngZone.run(this.toggle);
        }
    };
}
