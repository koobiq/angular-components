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
    Directive,
    ElementRef,
    Input,
    NgZone,
    OnDestroy,
    TemplateRef,
    ViewEncapsulation,
    booleanAttribute,
    inject
} from '@angular/core';
import { IFocusableOption } from '@koobiq/cdk/a11y';
import { ENTER, NUMPAD_DIVIDE, RIGHT_ARROW, SLASH, SPACE } from '@koobiq/cdk/keycodes';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import { KBQ_WINDOW, PopUpPlacements, PopUpTriggers } from '@koobiq/components/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqFormField } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTooltipTrigger, TooltipModifier } from '@koobiq/components/tooltip';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { KbqNavbarIc } from './navbar-ic';

export interface KbqNavbarFocusableItemEvent {
    item: KbqNavbarIcFocusableItem;
}

@Directive({
    standalone: true,
    selector: 'kbq-navbar-ic-logo, [kbq-navbar-logo]',
    host: {
        class: 'kbq-navbar-ic-logo',
        '(mouseenter)': 'hovered.next(true)',
        '(mouseleave)': 'hovered.next(false)'
    }
})
export class KbqNavbarIcLogo {
    readonly hovered = new Subject<boolean>();
}

@Directive({
    standalone: true,
    selector: 'kbq-navbar-ic-title, [kbq-navbar-ic-title]',
    host: {
        class: 'kbq-navbar-ic-title',
        '[class.kbq-navbar-ic-title_small]': 'isTextOverflown',

        '(mouseenter)': 'hovered.next(true)',
        '(mouseleave)': 'hovered.next(false)'
    }
})
export class KbqNavbarIcTitle implements AfterViewInit {
    protected readonly isBrowser = inject(Platform).isBrowser;
    protected readonly nativeElement = inject(ElementRef).nativeElement;
    private readonly window = inject(KBQ_WINDOW);

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

        const { width, marginLeft, marginRight } = this.window.getComputedStyle(this.nativeElement);

        return [width, marginLeft, marginRight].reduce((acc, item) => acc + parseInt(item) || 0, 0);
    }

    checkTextOverflown() {
        this.isTextOverflown = this.text.length > 18;
    }

    ngAfterViewInit(): void {
        this.outerElementWidth = this.getOuterElementWidth();
    }
}

@Directive({
    standalone: true,
    selector: 'kbq-navbar-ic-divider',
    host: {
        class: 'kbq-navbar-ic-divider'
    }
})
export class KbqNavbarIcDivider {}

@Directive({
    standalone: true,
    selector:
        'kbq-navbar-ic-item, [kbq-navbar-ic-item], kbq-navbar-ic-header, [kbq-navbar-ic-header], kbq-navbar-ic-toggle',
    host: {
        '[attr.tabindex]': '-1',
        '[attr.disabled]': 'disabled || null',

        class: 'kbq-navbar-ic-focusable-item',
        '[class.kbq-navbar-ic-item_has-nested]': '!!nestedElement',
        '[class.kbq-disabled]': 'disabled',

        '(focus)': 'focusHandler()',
        '(blur)': 'blurHandler()'
    }
})
export class KbqNavbarIcFocusableItem implements AfterContentInit, AfterViewInit, OnDestroy, IFocusableOption {
    protected readonly elementRef = inject(ElementRef<HTMLElement>);
    protected readonly changeDetector = inject(ChangeDetectorRef);
    protected readonly focusMonitor = inject(FocusMonitor);
    protected readonly ngZone = inject(NgZone);

    @ContentChild(KbqNavbarIcTitle) title: KbqNavbarIcTitle;

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

        if (this.nestedElement) {
            this.nestedElement.focusViaKeyboard();

            this.changeDetector.markForCheck();

            return;
        }

        this.tooltip?.show();
        this.focusHandler();
    }

    focusHandler() {
        if (this.disabled || this.hasFocus) return;

        this.onFocus.next({ item: this });

        this.hasFocus = true;

        this.changeDetector.markForCheck();

        this.elementRef.nativeElement.focus();
    }

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

@Directive({
    standalone: true,
    selector:
        'kbq-navbar-ic-item, [kbq-navbar-ic-item], kbq-navbar-ic-divider, kbq-navbar-ic-header, [kbq-navbar-ic-header]',
    host: {
        '[class.kbq-expanded]': '!collapsed',
        '[class.kbq-collapsed]': 'collapsed'
    }
})
export class KbqNavbarIcRectangleElement {
    protected readonly isBrowser = inject(Platform).isBrowser;
    protected readonly nativeElement = inject(ElementRef).nativeElement;
    private readonly window = inject(KBQ_WINDOW);

    readonly state = new Subject<void>();

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

        const { width, marginLeft, marginRight } = this.window.getComputedStyle(this.nativeElement);

        return [width, marginLeft, marginRight].reduce((acc, item) => acc + parseInt(item), 0);
    }
}

@Component({
    standalone: true,
    selector: 'kbq-navbar-ic-item, [kbq-navbar-ic-item]',
    exportAs: 'kbqNavbarIcItem',
    templateUrl: './navbar-ic-item.html',
    styleUrl: './navbar-ic-item.scss',
    host: {
        class: 'kbq-navbar-ic-item',
        '[class.kbq-navbar-ic-item_collapsed]': 'isCollapsed',
        '[class.kbq-navbar-ic-item_with-title]': '!!title',

        '(keydown)': 'onKeyDown($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [KbqIcon]
})
export class KbqNavbarIcItem extends KbqTooltipTrigger implements AfterContentInit {
    readonly rectangleElement = inject(KbqNavbarIcRectangleElement);
    readonly navbarFocusableItem = inject(KbqNavbarIcFocusableItem);

    private changeDetectorRef = inject(ChangeDetectorRef);
    private dropdownTrigger = inject(KbqDropdownTrigger, { optional: true });
    private tooltip = inject(KbqTooltipTrigger, { optional: true });

    @ContentChild(KbqNavbarIcTitle) title: KbqNavbarIcTitle;

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

    get showDropDownAngle(): boolean {
        return this.hasDropDownTrigger && !this.isCollapsed;
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

        this.placement = PopUpPlacements.Right;

        this.changeDetectorRef.markForCheck();
    }

    getTitleWidth(): number {
        return this.title.outerElementWidth;
    }

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

@Component({
    standalone: true,
    selector: 'kbq-navbar-ic-toggle',
    template: `
        <ng-content select="[kbq-icon]">
            <i
                kbq-icon
                [class.kbq-chevron-left_16]="navbar.expanded"
                [class.kbq-chevron-right_16]="!navbar.expanded"
            ></i>
        </ng-content>

        @if (navbar.expanded) {
            <div class="kbq-navbar-ic-item__title">
                <ng-content select="kbq-navbar-ic-title" />
            </div>
        }
    `,
    styleUrls: ['./navbar-ic.scss'],
    host: {
        class: 'kbq-navbar-ic-item kbq-navbar-ic-toggle kbq-vertical',
        '[class.kbq-tooltip_open]': 'isOpen',
        '[class.kbq-collapsed]': '!navbar.expanded',
        '[class.kbq-expanded]': 'navbar.expanded',

        '(keydown)': 'onKeydown($event)',
        '(click)': 'toggle()',
        '(touchend)': 'handleTouchend()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        KbqIcon
    ],
    encapsulation: ViewEncapsulation.None
})
export class KbqNavbarIcToggle extends KbqTooltipTrigger implements OnDestroy {
    readonly navbar = inject(KbqNavbarIc);

    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    protected readonly document = inject<Document>(DOCUMENT);

    private readonly window = inject(KBQ_WINDOW);

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

    constructor() {
        super();

        this.placement = PopUpPlacements.Right;

        if (this.window) {
            this.ngZone.runOutsideAngular(() => {
                this.window.addEventListener('keydown', this.windowToggleHandler);
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
        this.window.removeEventListener('keydown', this.windowToggleHandler);
    }

    toggle = () => {
        this.navbar.toggle();

        this.changeDetectorRef.markForCheck();

        this.hide();
    };

    private windowToggleHandler = (event: KeyboardEvent) => {
        if (event.ctrlKey && [NUMPAD_DIVIDE, SLASH].includes(event.keyCode)) {
            this.ngZone.run(this.toggle);
        }
    };
}
