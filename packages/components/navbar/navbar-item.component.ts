import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { Platform } from '@angular/cdk/platform';
import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    contentChild,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    Input,
    input,
    NgZone,
    OnDestroy,
    Signal,
    signal,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import {
    DOWN_ARROW,
    ENTER,
    IFocusableOption,
    KBQ_WINDOW,
    kbqInjectNativeElement,
    PopUpPlacements,
    PopUpTriggers,
    RIGHT_ARROW,
    SPACE
} from '@koobiq/components/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqFormField } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

/** Orientation of the navbar an element belongs to. */
export type KbqNavbarOrientation = 'horizontal' | 'vertical';

/**
 * Elements that already turn Enter/Space into a `click` on their own. Items authored on top of them must not
 * get a synthetic activation on the same key, or the handler runs twice.
 */
const NATIVELY_ACTIONABLE_TAGS = new Set(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']);

/** @docs-private */
export interface KbqNavbarFocusableItemEvent {
    item: KbqNavbarFocusableItem;
}

@Directive({
    selector: 'kbq-navbar-logo, [kbq-navbar-logo]',
    host: {
        class: 'kbq-navbar-logo'
    }
})
export class KbqNavbarLogo {}

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
        class: 'kbq-navbar-title'
    }
})
export class KbqNavbarTitle implements AfterViewInit {
    /** @docs-private */
    protected readonly isBrowser = inject(Platform).isBrowser;
    /** @docs-private */
    protected readonly nativeElement = kbqInjectNativeElement();
    private readonly window = inject(KBQ_WINDOW);

    /** @docs-private */
    outerElementWidth: number;

    /** Text content of the title element. */
    get text(): string {
        return this.nativeElement.textContent || '';
    }

    /** Whether the text is clipped horizontally (e.g. by `text-overflow: ellipsis`). */
    get isOverflown(): boolean {
        if (!this.isBrowser) return false;

        return this.nativeElement.scrollWidth > this.nativeElement.clientWidth;
    }

    /**
     * Whether the text is clipped vertically (e.g. by `-webkit-line-clamp`).
     *
     * Kept separate from `isOverflown` on purpose: wrapped text never exceeds its width, so only this
     * check catches a clamped title. `isOverflown` is also read by `KbqNavbarItem`, whose titles are
     * always `nowrap` — folding the two together would let sub-pixel line-height rounding enable
     * tooltips on every navbar item.
     */
    get isClamped(): boolean {
        if (!this.isBrowser) return false;

        return this.nativeElement.scrollHeight > this.nativeElement.clientHeight;
    }

    /**
     * Outer width of the title: its border box plus horizontal margins.
     *
     * Measured with `getBoundingClientRect()` rather than `getComputedStyle().width`, which resolves
     * to the used content-box width whatever `box-sizing` says and would drop the title's padding.
     */
    getOuterElementWidth(): number {
        if (!this.isBrowser) return 0;

        const { marginLeft, marginRight } = this.window.getComputedStyle(this.nativeElement);

        return [marginLeft, marginRight].reduce(
            (acc, item) => acc + (parseFloat(item) || 0),
            this.nativeElement.getBoundingClientRect().width
        );
    }

    /** @docs-private */
    ngAfterViewInit(): void {
        this.outerElementWidth = this.getOuterElementWidth();
    }
}

@Directive({
    selector: 'kbq-navbar-divider',
    host: {
        class: 'kbq-navbar-divider',
        role: 'separator',
        '[attr.aria-orientation]': 'ariaOrientation'
    }
})
export class KbqNavbarDivider {
    // Optional: the divider only picks up a rectangle element when both directives are imported, which is
    // what `KbqNavbarModule` does but a hand-rolled standalone import need not.
    private readonly rectangleElement = inject(KbqNavbarRectangleElement, { optional: true });

    /**
     * The separator runs across the navbar, so it is oriented the other way round: a horizontal navbar gets a
     * vertical rule and vice versa.
     */
    protected get ariaOrientation(): 'horizontal' | 'vertical' {
        return this.rectangleElement?.isHorizontal() ? 'vertical' : 'horizontal';
    }
}

@Directive({
    selector: 'kbq-navbar-item, [kbq-navbar-item], kbq-navbar-brand, [kbq-navbar-brand], kbq-navbar-toggle',
    host: {
        '[attr.tabindex]': 'tabIndex',
        // `aria-disabled` and not the `disabled` content attribute: these are custom elements, not form
        // controls, so the browser and assistive technology both ignore `disabled` on them.
        '[attr.aria-disabled]': 'disabled || null',

        class: 'kbq-navbar-focusable-item',
        '[class.kbq-navbar-item_has-nested]': '!!nestedElement',
        '[class.kbq-disabled]': 'disabled',

        '(focus)': 'onFocusHandler()',
        '(blur)': 'blur()'
    }
})
export class KbqNavbarFocusableItem implements AfterContentInit, AfterViewInit, OnDestroy, IFocusableOption {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private changeDetector = inject(ChangeDetectorRef);
    private focusMonitor = inject(FocusMonitor);
    private ngZone = inject(NgZone);
    private readonly destroyRef = inject(DestroyRef);

    /** @docs-private */
    readonly title = contentChild(KbqNavbarTitle);

    /** @docs-private */
    readonly button = contentChild(KbqButton);

    /** @docs-private */
    readonly formField = contentChild(KbqFormField);

    /** Interactive element projected into the item, if any. */
    get nestedElement(): KbqButton | KbqFormField | undefined {
        return this.button() || this.formField();
    }

    /** @docs-private */
    get tooltip(): KbqTooltipTrigger {
        return this._tooltip;
    }

    private _tooltip: KbqTooltipTrigger;

    /** @docs-private */
    readonly onFocus = new Subject<KbqNavbarFocusableItemEvent>();

    /** @docs-private */
    readonly onBlur = new Subject<KbqNavbarFocusableItemEvent>();

    /** @docs-private */
    get hasFocus(): boolean {
        return !!this.nestedElement?.hasFocus || this._hasFocus;
    }

    set hasFocus(value: boolean) {
        this._hasFocus = value;
    }

    private _hasFocus: boolean = false;

    /**
     * Whether the item is disabled.
     *
     * Deliberately kept a plain accessor input rather than a signal: `FocusKeyManager` reads it as a boolean
     * through its default skip predicate, and a signal would always read truthy there — the manager would then
     * skip every item and arrow navigation would stop working entirely.
     */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this._disabled) {
            this._disabled = value;
            this.changeDetector.markForCheck();
        }
    }

    private _disabled = false;

    /**
     * Items are never in the tab order themselves: the navbar host owns the single tab stop and moves focus
     * between items with the arrow keys (roving tabindex).
     */
    get tabIndex(): number {
        return -1;
    }

    constructor() {
        this.destroyRef.onDestroy(() => {
            this.onFocus.complete();
            this.onBlur.complete();
        });
    }

    /** @docs-private */
    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.elementRef);
    }

    /** @docs-private */
    ngAfterContentInit(): void {
        const button = this.button();

        if (button) {
            button.tabIndex = -1;
        }
    }

    /** @docs-private */
    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef);
    }

    /** @docs-private */
    setTooltip(value: KbqTooltipTrigger) {
        this._tooltip = value;
    }

    /** @docs-private */
    onFocusHandler() {
        if (this.disabled || this.hasFocus) {
            return;
        }

        this.onFocus.next({ item: this });

        this.hasFocus = true;

        this.changeDetector.markForCheck();

        this.elementRef.nativeElement.focus();
    }

    /** @docs-private */
    focus(origin?: FocusOrigin): void {
        if (this.disabled || this.hasFocus) {
            return;
        }

        if (origin === 'keyboard') {
            this.focusMonitor.focusVia(this.elementRef, origin);
        }

        if (this.nestedElement) {
            if (origin === 'keyboard') {
                // KbqButton tracks focus via FocusMonitor; KbqFormField just delegates to control.focus.
                if ('focusViaKeyboard' in this.nestedElement) {
                    this.nestedElement.focusViaKeyboard();
                } else {
                    this.nestedElement.focus();
                }
            }

            this.changeDetector.markForCheck();

            return;
        }

        if (origin === 'keyboard') {
            this.tooltip?.show();
            this.onFocusHandler();
        }
    }

    /** @docs-private */
    blur(): void {
        // When animations are enabled, Angular may end up removing the option from the DOM a little
        // earlier than usual, causing it to be blurred and throwing off the logic in the list
        // that moves focus not the next item. To work around the issue, we defer marking the option
        // as not focused until the next time the zone stabilizes.
        this.ngZone.onStable
            .asObservable()
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.ngZone.run(() => {
                    this._hasFocus = false;

                    this.tooltip?.hide();

                    if (this.button()?.hasFocus) {
                        return;
                    }

                    this.onBlur.next({ item: this });
                });
            });
    }

    /** @docs-private */
    getLabel(): string {
        return this.title()?.text || '';
    }
}

@Directive({
    selector: 'kbq-navbar-item, [kbq-navbar-item], kbq-navbar-divider, kbq-navbar-brand, [kbq-navbar-brand]',
    host: {
        '[class.kbq-vertical]': 'isVertical()',
        '[class.kbq-horizontal]': 'isHorizontal()',

        '[class.kbq-expanded]': 'isVertical() && !collapsed',
        '[class.kbq-collapsed]': 'isVertical() && collapsed'
    }
})
export class KbqNavbarRectangleElement {
    /** @docs-private */
    protected readonly isBrowser = inject(Platform).isBrowser;
    /** @docs-private */
    protected readonly nativeElement = kbqInjectNativeElement();
    private readonly window = inject(KBQ_WINDOW);
    private readonly destroyRef = inject(DestroyRef);

    /** Emits whenever the orientation or the collapsed state of the element changes. @docs-private */
    readonly state = new Subject<void>();

    private readonly _orientation = signal<KbqNavbarOrientation>('vertical');

    /**
     * Orientation of the navbar this element belongs to. Written by the ambient `KbqNavbar` /
     * `KbqVerticalNavbar`; the element itself only reads it.
     */
    get orientation(): KbqNavbarOrientation {
        return this._orientation();
    }

    set orientation(value: KbqNavbarOrientation) {
        if (this._orientation() === value) return;

        this._orientation.set(value);

        this.state.next();
    }

    /** Whether the ambient navbar is horizontal. @docs-private */
    readonly isHorizontal: Signal<boolean> = computed(() => this._orientation() === 'horizontal');

    /** Whether the ambient navbar is vertical. @docs-private */
    readonly isVertical: Signal<boolean> = computed(() => this._orientation() === 'vertical');

    // Deliberately left `undefined`: it is not equal to either boolean, so the guard below always lets the
    // first assignment through. Initializing it to `false` would swallow the initial `collapsed = false` of a
    // navbar that starts expanded, and with it the `updateDropdown()` that rides on that emission.
    private readonly _collapsed = signal<boolean | undefined>(undefined);

    /** Whether the element is rendered in its collapsed (icon-only) form. @docs-private */
    get collapsed(): boolean {
        return !!this._collapsed();
    }

    set collapsed(value: boolean) {
        if (this._collapsed() === value) return;

        this._collapsed.set(value);

        this.state.next();
    }

    /** Signal mirror of `collapsed`, for `computed()` consumers. @docs-private */
    readonly collapsedState: Signal<boolean> = computed(() => !!this._collapsed());

    /** @docs-private */
    readonly button = contentChild(KbqButtonCssStyler);

    constructor() {
        this.destroyRef.onDestroy(() => this.state.complete());
    }

    /**
     * Outer width of the item: its border box plus horizontal margins.
     *
     * Measured with `getBoundingClientRect()` rather than `getComputedStyle().width`, which resolves
     * to the used content-box width whatever `box-sizing` says. `.kbq-navbar-item` is `border-box`
     * with horizontal padding, so the computed value dropped that padding from every item, while
     * `KbqNavbar.width` — the figure this sum is compared against — has always been a border box.
     * The navbar therefore under-counted its own content and collapsed later than it should.
     */
    getOuterElementWidth(): number {
        if (!this.isBrowser) return 0;

        const { marginLeft, marginRight } = this.window.getComputedStyle(this.nativeElement);

        return [marginLeft, marginRight].reduce(
            (acc, item) => acc + (parseFloat(item) || 0),
            this.nativeElement.getBoundingClientRect().width
        );
    }
}

@Component({
    selector: 'kbq-navbar-item, [kbq-navbar-item]',
    imports: [
        KbqIcon
    ],
    templateUrl: './navbar-item.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-navbar-item',
        '[class.kbq-navbar-item_collapsed]': 'isCollapsed()',
        '[class.kbq-navbar-item_with-title]': '!!title()',

        '[attr.role]': 'role',
        '[attr.aria-label]': 'resolvedAriaLabel',

        '(keydown)': 'onKeyDown($event)'
    },
    // Composition, not inheritance: the item is not a tooltip trigger, it merely owns one. Only the tooltip
    // inputs that make sense on a navbar item are re-exposed; `KbqNavbarToggle` uses the same pattern.
    hostDirectives: [
        {
            directive: KbqTooltipTrigger,
            inputs: [
                'kbqTooltip',
                'kbqTooltipClass',
                'kbqTooltipColor',
                'kbqTooltipContext',
                'kbqTooltipOffset',
                'kbqTrigger',
                'kbqPlacement',
                'kbqPlacementPriority',
                'kbqEnterDelay',
                'kbqLeaveDelay',
                'kbqVisible'
            ],
            outputs: [
                'kbqVisibleChange',
                'kbqPlacementChange'
            ]
        }
    ],
    exportAs: 'kbqNavbarItem'
})
export class KbqNavbarItem implements AfterContentInit {
    /** @docs-private */
    readonly rectangleElement = inject(KbqNavbarRectangleElement);
    /** @docs-private */
    readonly navbarFocusableItem = inject(KbqNavbarFocusableItem);
    /** @docs-private */
    readonly tooltip = inject(KbqTooltipTrigger, { self: true });

    private readonly nativeElement = kbqInjectNativeElement();
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly dropdownTrigger = inject(KbqDropdownTrigger, { optional: true })!;
    private readonly bento = inject(KbqNavbarBento, { optional: true });

    /** @docs-private */
    readonly title = contentChild(KbqNavbarTitle);

    /** @docs-private */
    readonly icon = contentChild(KbqIcon);

    /** Text shown in the tooltip of a collapsed item. Defaults to the text of the projected `kbq-navbar-title`. */
    readonly collapsedText = input<string>('');

    /** Whether the item may be collapsed when the horizontal navbar runs out of room. */
    readonly collapsable = input(true, { transform: booleanAttribute });

    /**
     * Explicitly enables or disables the item's tooltip.
     *
     * Left unset, the tooltip is enabled exactly when the title cannot be read from the item itself — the item
     * is collapsed, or its title is clipped.
     */
    readonly tooltipDisabled = input<boolean | undefined, unknown>(undefined, {
        alias: 'kbqTooltipDisabled',
        transform: (value: unknown) => (value === undefined ? undefined : booleanAttribute(value))
    });

    private readonly ownCollapsed = signal<boolean | undefined>(undefined);

    /** Collapses the item regardless of what the ambient navbar decided. */
    set collapsed(value: boolean) {
        this.ownCollapsed.set(value);
    }

    // todo in future need rename to 'collapsed'
    /** Whether the item is rendered in its collapsed (icon-only) form. */
    readonly isCollapsed: Signal<boolean> = computed(
        () => this.ownCollapsed() ?? this.rectangleElement.collapsedState()
    );

    /** @docs-private */
    get croppedText(): string {
        const croppedTitleText = this.title()?.isOverflown ? this.titleText : '';

        return `${croppedTitleText}`;
    }

    /** Text used for the tooltip and for the accessible name of a collapsed item. */
    get titleText(): string | null {
        return this.collapsedText() || this.title()?.text || null;
    }

    /** @docs-private */
    get hasDropDownTrigger(): boolean {
        return !!this.dropdownTrigger;
    }

    /** @docs-private */
    protected readonly showVerticalDropDownAngle: Signal<boolean> = computed(
        () => !this.bento && this.hasDropDownTrigger && this.rectangleElement.isVertical() && !this.isCollapsed()
    );

    /** @docs-private */
    protected readonly showHorizontalDropDownAngle: Signal<boolean> = computed(
        () => this.hasDropDownTrigger && this.rectangleElement.isHorizontal() && !this.isCollapsed()
    );

    /** @docs-private */
    get hasCroppedText(): boolean {
        return !!this.title()?.isOverflown;
    }

    /**
     * Accessible name of the item. Needed for an icon-only item, which has no visible label of its own; an
     * item that renders a title is named by it.
     */
    readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

    /**
     * A collapsed item shows nothing but its icon, and a tooltip is a transient overlay — never an accessible
     * name. The name is therefore published on the element itself, unless the consumer named it already.
     */
    protected get resolvedAriaLabel(): string | null {
        return this.ariaLabel() ?? (this.isCollapsed() ? this.titleText : null);
    }

    /**
     * Items authored as `<kbq-navbar-item>` are custom elements with no implicit role, so they are announced as
     * plain content. Anything already actionable — a native element, or a projected button/form field that owns
     * the interaction — keeps its own semantics.
     *
     * No `aria-haspopup` for dropdown-trigger items on purpose: `KbqDropdownTrigger` deliberately omits it
     * because the panel carries no menu semantics; it does publish `aria-expanded` itself.
     */
    protected get role(): string | null {
        if (NATIVELY_ACTIONABLE_TAGS.has(this.nativeElement.tagName) || this.navbarFocusableItem.nestedElement) {
            return null;
        }

        return 'button';
    }

    /** Whether Enter/Space has to be turned into a click by hand. */
    private get needsSyntheticActivation(): boolean {
        return this.role === 'button' && !this.hasDropDownTrigger;
    }

    constructor() {
        if (this.hasDropDownTrigger) {
            this.dropdownTrigger.openByArrowDown = false;
        }

        this.rectangleElement.state.pipe(takeUntilDestroyed()).subscribe(() => {
            this.updateDropdown();

            this.updateTooltip();

            this.changeDetectorRef.markForCheck();
        });

        this.navbarFocusableItem.setTooltip(this.tooltip);

        this.tooltip.arrow = false;
        this.tooltip.offset = 0;

        this.tooltip.setOverlayPanelClass('kbq-tooltip-panel_horizontal-navbar');

        // The tooltip of a collapsed item stands in for its missing title, so it must not also open on focus:
        // `KbqNavbarFocusableItem.focus()` shows it explicitly, and only for keyboard focus.
        this.tooltip.trigger = `${PopUpTriggers.Hover}`;

        effect(() => {
            // Re-read the reactive inputs the tooltip content depends on.
            this.collapsedText();
            this.tooltipDisabled();
            this.isCollapsed();

            this.updateTooltip();
        });
    }

    /** @docs-private */
    ngAfterContentInit(): void {
        this.updateTooltip();
    }

    /** @docs-private */
    updateTooltip(): void {
        if (this.isCollapsed()) {
            this.tooltip.content = `${this.titleText || ''}`;
        } else if (this.hasCroppedText) {
            this.tooltip.content = this.croppedText;
        }

        // A fully visible title needs no tooltip; a collapsed or clipped one is the only way to read it.
        this.tooltip.disabled = this.tooltipDisabled() ?? (!this.isCollapsed() && !this.hasCroppedText);

        if (this.rectangleElement.isVertical()) {
            this.tooltip.tooltipPlacement = PopUpPlacements.Right;
            this.tooltip.tooltipPlacementPriority = PopUpPlacements.Right;
        }

        this.changeDetectorRef.markForCheck();
    }

    /** @docs-private */
    getTitleWidth(): number {
        return this.title()?.outerElementWidth ?? 0;
    }

    /** @docs-private */
    protected onKeyDown($event: KeyboardEvent) {
        if (this.needsSyntheticActivation && [ENTER, SPACE].includes($event.keyCode)) {
            this.nativeElement.click();

            $event.preventDefault();

            return;
        }

        if (!this.hasDropDownTrigger) {
            return;
        }

        if (
            (this.rectangleElement.isHorizontal() && $event.keyCode === DOWN_ARROW) ||
            (this.rectangleElement.isVertical() && $event.keyCode === RIGHT_ARROW)
        ) {
            this.dropdownTrigger.openedBy = 'keyboard';
            this.dropdownTrigger.open();

            $event.stopPropagation();
            $event.preventDefault();
        }
    }

    private updateDropdown(): void {
        if (!this.dropdownTrigger?.dropdown) return;

        if (this.rectangleElement.isVertical()) {
            this.dropdownTrigger.dropdown.overlapTriggerX = false;
            this.dropdownTrigger.dropdown.overlapTriggerY = true;
            // needs to shift dropdown to the left by 8 pixels
            this.dropdownTrigger.offsetX = -8;
        }
    }
}
