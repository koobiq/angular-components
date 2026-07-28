import { FocusMonitor } from '@angular/cdk/a11y';
import { CdkObserveContent } from '@angular/cdk/observers';
import {
    AfterContentInit,
    AfterViewChecked,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    contentChildren,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    inject,
    Input,
    isDevMode,
    numberAttribute,
    OnDestroy,
    Renderer2,
    signal,
    untracked,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    DOWN_ARROW,
    ENTER,
    getNodesWithoutComments,
    KBQ_TITLE_TEXT_REF,
    KbqColorDirective,
    KbqComponentColors,
    KbqTitleTextRef,
    LEFT_ARROW,
    leftIconClassName,
    RIGHT_ARROW,
    rightIconClassName,
    SPACE,
    ThemePalette
} from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';

/** Visual style of a button. */
export enum KbqButtonStyles {
    Filled = 'filled',
    Outline = 'outline',
    Transparent = 'transparent'
}

/**
 * Class set on a button host whose first visible child is an icon.
 *
 * Public CSS hook: consumed by `dropdown.scss` to detect an icon-only dropdown trigger.
 */
export const buttonLeftIconClassName = 'kbq-button-icon_left';

/**
 * Class set on a button host whose last visible child is an icon.
 *
 * Public CSS hook: consumed by `dropdown.scss` to detect an icon-only dropdown trigger.
 */
export const buttonRightIconClassName = 'kbq-button-icon_right';

/** Host tags that support the native `disabled` attribute. */
const nativelyDisableableTags = new Set([
    'button',
    'input',
    'select',
    'textarea'
]);

/** A button containing more icons than this keeps regular (non icon-button) styling. */
const maxIconsForIconButton = 2;

/**
 * Applies the `kbq-button`/`kbq-button-icon` host class and the left/right icon modifier classes.
 *
 * A button is treated as an icon button when its projected content consists only of `KbqIcon`s
 * and there are at most 2 of them. When icons are mixed with other content, only the outermost
 * icons receive the left/right classes.
 *
 * Must be used together with `KbqButton` (both match `[kbq-button]`): icon detection relies on
 * the `.kbq-button-wrapper` element rendered by the component's template.
 */
@Directive({
    selector: '[kbq-button]',
    host: {
        '[class.kbq-button]': '!isIconButton',
        '[class.kbq-button-icon]': 'isIconButton',
        '[class.kbq-button_no-label]': 'hasNoLabel'
    }
})
export class KbqButtonCssStyler implements AfterContentInit {
    private renderer = inject(Renderer2);

    readonly icons = contentChildren<KbqIcon>(forwardRef(() => KbqIcon));

    readonly nativeElement: HTMLElement;

    /** Whether the button contains only icons (at most 2). */
    get isIconButton(): boolean {
        return this._isIconButton();
    }

    /** Whether the projected label holds no text at all, e.g. an icon-only button. */
    get hasNoLabel(): boolean {
        return this._hasNoLabel();
    }

    private readonly _isIconButton = signal(false);

    private readonly _hasNoLabel = signal(false);

    private leftIcon: HTMLElement | null = null;
    private rightIcon: HTMLElement | null = null;

    /** Memoized `.kbq-button-wrapper`; stable for the lifetime of the host component. */
    private wrapperElement: HTMLElement | null = null;

    /** Whether the missing-accessible-name warning has already been emitted for this host. */
    private accessibleNameWarned = false;

    constructor() {
        const elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

        this.nativeElement = elementRef.nativeElement;

        // The contentChildren query tracks only KbqIcon instances, and only direct ones, while icon
        // placement and `hasNoLabel` also depend on text nodes and on content a consumer nested in
        // its own element — all invisible to the query. Those are covered by the MutationObserver in
        // the component template, which is why it stays enabled even for icon-less buttons. This
        // effect covers icon creation and removal (e.g. via @if) without waiting for the observer.
        effect(() => {
            this.icons();

            untracked(() => this.updateClassModifierForIcons());
        });
    }

    ngAfterContentInit() {
        this.updateClassModifierForIcons();
    }

    updateClassModifierForIcons() {
        const wrapper = this.getWrapperElement();

        if (!wrapper) {
            if (isDevMode()) {
                // eslint-disable-next-line no-console
                console.warn('KbqButtonCssStyler should be imported together with KbqButton.');
            }

            return;
        }

        const icons = this.icons();
        const textElement = wrapper.querySelector('.kbq-button-text');

        // CSS cannot see text nodes, so it can never tell an icon-only label from a text label that
        // happens to contain an icon — the label box has to be told. `textContent` walks nested
        // elements, which also covers content a consumer wrapped in its own element before
        // projecting it (e.g. KbqButtonToggle), where the icon is not a direct child at all.
        this._hasNoLabel.set(!textElement?.textContent?.trim());

        // Build an ordered list of "effective" content nodes: the left-slot content, then the
        // default-slot content flattened out of `.kbq-button-text`, then the right-slot content.
        // Flattening the text span keeps legacy `<i kbq-icon> Text` markup (projected into the
        // default slot) working: those icons live inside `.kbq-button-text`, but for placement
        // they must be treated as direct siblings of the text, exactly as before the text span
        // existed. With no marker slots this list equals the old wrapper children.
        const effectiveNodes: Node[] = [];

        for (const node of this.getContentNodes(wrapper)) {
            if (node === textElement) {
                effectiveNodes.push(...this.getContentNodes(node as HTMLElement));
            } else {
                effectiveNodes.push(node);
            }
        }

        this._isIconButton.set(
            !!icons.length && icons.length === effectiveNodes.length && icons.length <= maxIconsForIconButton
        );

        let leftIcon: HTMLElement | null = null;
        let rightIcon: HTMLElement | null = null;

        if (icons.length && effectiveNodes.length > 1) {
            for (const icon of icons) {
                const iconHostElement = icon.getHostElement();
                const iconIndex = effectiveNodes.indexOf(iconHostElement);

                if (iconIndex === 0) leftIcon = iconHostElement;

                if (iconIndex === effectiveNodes.length - 1) rightIcon = iconHostElement;
            }
        }

        this.updateIconClass(this.leftIcon, leftIcon, leftIconClassName, buttonLeftIconClassName);
        this.updateIconClass(this.rightIcon, rightIcon, rightIconClassName, buttonRightIconClassName);

        this.leftIcon = leftIcon;
        this.rightIcon = rightIcon;

        this.warnIfIconButtonHasNoAccessibleName();
    }

    private updateIconClass(
        previous: HTMLElement | null,
        current: HTMLElement | null,
        iconClassName: string,
        buttonClassName: string
    ) {
        if (previous === current) return;

        if (previous) {
            this.renderer.removeClass(previous, iconClassName);
        }

        if (current) {
            this.renderer.addClass(current, iconClassName);
            this.renderer.addClass(this.nativeElement, buttonClassName);
        } else {
            this.renderer.removeClass(this.nativeElement, buttonClassName);
        }
    }

    private getWrapperElement(): HTMLElement | null {
        return (this.wrapperElement ??= this.nativeElement.querySelector('.kbq-button-wrapper'));
    }

    /**
     * Child nodes that take part in the icon detection: comments and whitespace-only text nodes are
     * ignored so that detection does not depend on `preserveWhitespaces`.
     */
    private getContentNodes(element: HTMLElement): Node[] {
        return getNodesWithoutComments(element.childNodes).filter(
            (node) => node.nodeType !== Node.TEXT_NODE || !!node.textContent?.trim()
        );
    }

    /**
     * `KbqIcon` renders a decorative glyph, so an icon-only button carries no text. Without an
     * `aria-label`/`aria-labelledby`/`title` it has no accessible name at all (AXE `button-name`).
     */
    private warnIfIconButtonHasNoAccessibleName(): void {
        if (!isDevMode() || this.accessibleNameWarned || !this.isIconButton) return;

        const host = this.nativeElement;
        const hasAccessibleName =
            !!host.textContent?.trim() ||
            host.hasAttribute('aria-label') ||
            host.hasAttribute('aria-labelledby') ||
            host.hasAttribute('title');

        if (hasAccessibleName) return;

        this.accessibleNameWarned = true;

        // eslint-disable-next-line no-console
        console.warn(
            'KbqButton: icon-only button has no accessible name. Add [aria-label] or [aria-labelledby] to it.',
            host
        );
    }
}

@Component({
    selector: '[kbq-button]',
    imports: [
        CdkObserveContent
    ],
    templateUrl: './button.component.html',
    styleUrls: ['./button.scss', './button-tokens.scss'],
    providers: [
        { provide: KBQ_TITLE_TEXT_REF, useExisting: KbqButton }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[attr.disabled]': 'nativeDisabledAttribute',
        '[attr.aria-disabled]': 'ariaDisabledAttribute',
        '[attr.role]': 'roleAttribute()',
        '[class.kbq-disabled]': 'disabled',
        '[attr.tabindex]': 'tabIndexAttribute',
        '[class]': 'kbqStyle',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()'
    }
})
export class KbqButton
    extends KbqColorDirective
    implements OnDestroy, AfterViewInit, AfterViewChecked, KbqTitleTextRef
{
    private focusMonitor = inject(FocusMonitor);
    protected styler = inject(KbqButtonCssStyler);

    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    /** Lower-cased tag name of the host element. */
    private readonly hostTagName = this.elementRef.nativeElement.nodeName.toLowerCase();

    /** Whether the host element supports the native `disabled` attribute. */
    private readonly supportsNativeDisabled = nativelyDisableableTags.has(this.hostTagName);

    hasFocus: boolean = false;

    @ViewChild('kbqTitleText') textElement: ElementRef<HTMLElement>;

    /** The flex row that lays out the icons and text, used as the overflow width constraint. */
    @ViewChild('parentTextElement') parentTextElement: ElementRef<HTMLElement>;

    /**
     * Visual style of the button. Setting it marks the value as owned by the button, so a
     * surrounding `KbqButtonGroupRoot` no longer overrides it.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get kbqStyle(): string {
        return this._kbqStyleClassName;
    }

    set kbqStyle(value: string | KbqButtonStyles) {
        this.kbqStyleSetExplicitly = true;

        this.applyKbqStyle(value);
    }

    private _kbqStyle: string | KbqButtonStyles = KbqButtonStyles.Filled;
    private _kbqStyleClassName = `kbq-button_${KbqButtonStyles.Filled}`;

    /**
     * Color of the button. Setting it marks the value as owned by the button, so a surrounding
     * `KbqButtonGroupRoot` no longer overrides it.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    override get color(): KbqComponentColors | ThemePalette | string {
        return super.color;
    }

    override set color(value: KbqComponentColors | ThemePalette | string) {
        this.colorSetExplicitly = true;

        super.color = value;
    }

    // @todo 20 In the next major release this feature will be replaced on the input signal.
    /**
     * Whether the button is disabled. A surrounding `KbqButtonGroupRoot` can disable the button in
     * addition to this input, but never re-enables a button disabled through it.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this.disabledSignal();
    }

    set disabled(value: boolean) {
        this.ownDisabled = value;

        this.applyDisabledState();
    }

    /** Whether `kbqStyle` was set from the outside rather than propagated by a button group. */
    private kbqStyleSetExplicitly = false;

    /** Whether `color` was set from the outside rather than propagated by a button group. */
    private colorSetExplicitly = false;

    /** Disabled state requested through the `disabled` input. */
    private ownDisabled = false;

    /** Disabled state propagated by a surrounding `KbqButtonGroupRoot`. */
    private groupDisabled = false;

    /** @docs-private */
    readonly disabledSignal = signal(false);

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: numberAttribute })
    get tabIndex(): number {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: number) {
        // `numberAttribute` yields NaN for non-numeric input, which would render `tabindex="NaN"`.
        this._tabIndex = Number.isNaN(value) ? 0 : value;
    }

    private _tabIndex = 0;

    /** Value rendered into the native `disabled` attribute; invalid HTML on hosts such as `<a>`. */
    protected get nativeDisabledAttribute(): true | null {
        return this.disabled && this.supportsNativeDisabled ? true : null;
    }

    /** Disabled state exposed to assistive tech for hosts without native `disabled` support. */
    protected get ariaDisabledAttribute(): true | null {
        return this.disabled && !this.supportsNativeDisabled ? true : null;
    }

    /**
     * An `<a kbq-button>` without `href` does not navigate and has no implicit role, so it is
     * announced as a button. Anchors that do navigate (`href`, `routerLink`) keep their link role,
     * and a native `<button>` keeps its implicit one.
     *
     * A signal rather than a plain getter: `href` is applied by host bindings of the same element
     * (`RouterLink`, `[attr.href]`), which run after this component's own, so the value cannot be
     * resolved while the host bindings are being evaluated.
     */
    protected readonly roleAttribute = signal<'button' | null>(null);

    /**
     * Value rendered into the `tabindex` attribute. A native `<button>`/`<input>` is already in the
     * tab order, so the default needs no attribute at all. Anchors keep it: one without `href` is
     * not focusable otherwise, and whether an `href` is present cannot be decided here — directives
     * such as `RouterLink` apply theirs after this host binding runs.
     */
    protected get tabIndexAttribute(): number | null {
        if (this.disabled) return -1;

        return this.supportsNativeDisabled && this._tabIndex === 0 ? null : this._tabIndex;
    }

    constructor() {
        super();

        // Applied through `super` so that the default does not count as an explicit color.
        super.color = KbqComponentColors.ContrastFade;
        this.setDefaultColor(KbqComponentColors.ContrastFade);

        // `KbqColorDirective`'s constructor assigns `this.color`, which dispatches to the override
        // below and flips the flag. Reset it here rather than relying on the field initializer
        // happening to run after `super()`.
        this.colorSetExplicitly = false;

        // Native capture-phase listeners instead of host listeners: Angular coalesces listeners
        // for the same event on the same element, so stopImmediatePropagation from a host listener
        // would not stop consumer-bound handlers. Matters for <a kbq-button> hosts only —
        // a disabled native <button> does not emit these events at all. The keydown guard covers
        // directives that activate on keydown directly (e.g. KbqDropdownTrigger, which opens on
        // ENTER/SPACE and on DOWN/LEFT/RIGHT arrows).
        this.getHostElement().addEventListener('click', this.haltDisabledEvents, true);
        this.getHostElement().addEventListener('keydown', this.haltDisabledKeydownEvents, true);
    }

    /**
     * Applies the color propagated by a surrounding `KbqButtonGroupRoot`, unless the button defines
     * its own.
     * @docs-private
     */
    setColorFromGroup(value: KbqComponentColors | ThemePalette | string): void {
        if (this.colorSetExplicitly) return;

        super.color = value;
    }

    /**
     * Applies the style propagated by a surrounding `KbqButtonGroupRoot`, unless the button defines
     * its own.
     * @docs-private
     */
    setKbqStyleFromGroup(value: KbqButtonStyles | string): void {
        if (this.kbqStyleSetExplicitly) return;

        this.applyKbqStyle(value);
    }

    /**
     * Applies the disabled state propagated by a surrounding `KbqButtonGroupRoot`. It is additive:
     * a button disabled through its own input stays disabled when the group is re-enabled.
     * @docs-private
     */
    setDisabledFromGroup(value: boolean): void {
        this.groupDisabled = value;

        this.applyDisabledState();
    }

    ngAfterViewInit(): void {
        this.runFocusMonitor();
        this.updateRole();
    }

    ngAfterViewChecked(): void {
        // `href` can appear or disappear long after the first check — `[attr.href]` bound to a value
        // that resolves later, or a `RouterLink` whose target becomes `null`. Only anchors can change
        // role, so a `<button>` host skips the lookup entirely; setting the signal to its current
        // value is a no-op, so a stable host does not schedule extra passes.
        if (this.hostTagName === 'a') {
            this.updateRole();
        }
    }

    /**
     * Re-evaluates the role announced to assistive tech. Only needed when the host `href` is added or
     * removed outside of Angular, without a subsequent change detection pass.
     * @docs-private
     */
    updateRole(): void {
        const navigates = this.hostTagName !== 'a' || this.elementRef.nativeElement.hasAttribute('href');

        this.roleAttribute.set(navigates ? null : 'button');
    }

    ngOnDestroy() {
        this.getHostElement().removeEventListener('click', this.haltDisabledEvents, true);
        this.getHostElement().removeEventListener('keydown', this.haltDisabledKeydownEvents, true);
        this.stopFocusMonitor();
    }

    onFocus() {
        this.hasFocus = true;
    }

    onBlur() {
        this.hasFocus = false;
    }

    getHostElement() {
        return this.elementRef.nativeElement;
    }

    focus(): void {
        if (this.disabled) return;

        this.getHostElement().focus();
    }

    focusViaKeyboard(): void {
        if (this.disabled) return;

        this.focusMonitor.focusVia(this.getHostElement(), 'keyboard');
    }

    haltDisabledEvents = (event: Event) => {
        if (this.disabled) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
        }
    };

    private haltDisabledKeydownEvents = (event: KeyboardEvent) => {
        // Keys that activate sibling host directives on the same host (e.g. KbqDropdownTrigger opens
        // on ENTER/SPACE and on DOWN/LEFT/RIGHT arrows). Tab/Escape are intentionally left untouched
        // so focus can still move away from a disabled — but still focusable — <a kbq-button> host.
        if ([ENTER, SPACE, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW].includes(event.keyCode)) {
            this.haltDisabledEvents(event);
        }
    };

    projectContentChanged() {
        this.styler.updateClassModifierForIcons();
    }

    private applyKbqStyle(value: string | KbqButtonStyles): void {
        const kbqStyle = value || KbqButtonStyles.Filled;

        if (kbqStyle === this._kbqStyle) return;

        this._kbqStyle = kbqStyle;
        this._kbqStyleClassName = `kbq-button_${kbqStyle}`;

        this.changeDetectorRef.markForCheck();
    }

    private applyDisabledState(): void {
        this.disabledSignal.set(this.ownDisabled || this.groupDisabled);
    }

    private runFocusMonitor() {
        this.focusMonitor.monitor(this.elementRef.nativeElement, true);
    }

    private stopFocusMonitor() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }
}
