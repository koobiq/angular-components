import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    effect,
    inject,
    input,
    isDevMode,
    numberAttribute,
    OnDestroy,
    signal,
    SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import { KbqIcon } from './icon.component';

/**
 * Size options for `KbqIconButton`.
 * - `compact`: 16px icon with padding, 24×24px container.
 * - `normal`: 24px icon, no padding.
 */
export type KbqIconButtonSize = 'compact' | 'normal';

/** Host elements that are already buttons, or already activated from the keyboard by the browser. */
const NATIVELY_ACTIVATED_NODES = ['BUTTON', 'INPUT'];

/**
 * An icon that acts as a button. Applied to a native `<button>` it only adds the styling; applied to any
 * other element — `<i>` is what the library itself mostly uses — it also supplies the semantics the
 * element does not have: `role="button"` and `aria-disabled`. It does not synthesize Enter/Space
 * activation itself — attach a `(keydown.enter)`/`(keydown.space)` listener where it is used.
 *
 * It has no text of its own, so give it an `aria-label` (or an `aria-labelledby`); in dev mode it warns
 * when it has neither.
 *
 * It extends `KbqIcon` for the rendering, but deliberately does not register under that DI token: a
 * `contentChild(KbqIcon)` is looking for a decorative icon to position or tint, and an interactive
 * control is not one. See the note on `KbqIconItem`.
 */
@Component({
    selector: `[kbq-icon-button]`,
    template: '<ng-content />',
    styleUrls: ['icon-button.scss', 'icon-button-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq kbq-icon-button',

        '[attr.tabindex]': 'tabindex',
        '[attr.disabled]': 'disabled || null',
        '[attr.aria-disabled]': 'disabled || null',

        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-icon-button_compact]': "size() === 'compact'"
    }
})
export class KbqIconButton extends KbqIcon implements AfterViewInit, OnDestroy {
    /** An icon button is interactive and exposes its own name, so it is not decorative by default. */
    protected override readonly defaultAriaHidden: boolean = false;

    protected readonly focusMonitor = inject(FocusMonitor);
    /** Size of the icon button. */
    readonly size = input<KbqIconButtonSize>('normal');

    /** @docs-private */
    override readonly iconNameInput = input<string | undefined>(undefined, { alias: 'kbq-icon-button' });

    /** Position of the button in the tab order. A disabled button is taken out of it entirely. */
    get tabindex(): number | null {
        return this.disabled ? null : this._tabindex;
    }

    set tabindex(value: number | null) {
        this._tabindex = value;
    }

    private _tabindex: number | null = 0;

    /** Whether the button is disabled. */
    get disabled(): boolean {
        return this.disabledSignal();
    }

    set disabled(value: boolean) {
        this.disabledSignal.set(value);
    }

    /** @docs-private */
    readonly disabledSignal = signal(false);

    /** The button sizes itself through its own padding, so it never gets the bare icon's `max-height`. */
    protected override readonly appliesMaxHeight: boolean = false;

    /** @docs-private */
    readonly tabindexInput = input<number | null | undefined, number | string | null | undefined>(undefined, {
        alias: 'tabindex',
        // `numberAttribute` gives NaN for what it cannot parse, and `tabindex="NaN"` is an invalid attribute the
        // browser ignores, so an unparsable value renders no tabindex at all.
        transform: (value) => {
            if (value == null) return undefined;

            const tabindex = numberAttribute(value);

            return Number.isNaN(tabindex) ? null : tabindex;
        }
    });

    /** @docs-private */
    readonly disabledInput = input<boolean | undefined, boolean | string | null | undefined>(undefined, {
        alias: 'disabled',
        transform: booleanAttribute
    });

    override ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);

        // A bound input is handed to its member as the decorator input did; unbound, it leaves what code wrote.
        // A bound `undefined` or `null` restores the default tabindex instead of dropping the button out of the tab order.
        if (changes['tabindexInput']) {
            const tabindex = this.tabindexInput();

            this.tabindex = tabindex === undefined ? 0 : tabindex;
        }

        if (changes['disabledInput']) {
            const disabled = this.disabledInput();

            if (disabled !== undefined) this.disabled = disabled;
        }
    }

    constructor() {
        super();

        effect(() => (this.disabledSignal() ? this.stopFocusMonitor() : this.runFocusMonitor()));
    }

    ngAfterViewInit(): void {
        this.runFocusMonitor();
        this.applyButtonRole();
        this.warnIfMissingAccessibleName();
    }

    ngOnDestroy() {
        this.stopFocusMonitor();
    }

    /**
     * Whether the host already behaves like a button, so the browser activates it from the keyboard and
     * announces it without help.
     *
     * Read on demand rather than captured in the constructor: `routerLink` and a bound `[attr.href]` both
     * write the attribute during the update pass, so an anchor that navigates carries no `href` at all
     * while directive constructors run.
     */
    private isNativelyActivated(): boolean {
        const host = this.getHostElement();

        return NATIVELY_ACTIVATED_NODES.includes(host.nodeName) || (host.nodeName === 'A' && host.hasAttribute('href'));
    }

    /**
     * A link that navigates keeps its own role; anything else is a button only because this component
     * says so, and has to be announced as one.
     *
     * Written through the renderer instead of a host binding, because the binding is evaluated in the
     * parent's update pass — before `routerLink` has set its `href` — and on an `OnPush` component it may
     * never be evaluated again to correct itself.
     */
    private applyButtonRole(): void {
        const host = this.getHostElement();

        if (this.isNativelyActivated() || host.hasAttribute('role')) return;

        this.renderer.setAttribute(host, 'role', 'button');
    }

    /**
     * `KbqIcon` renders a decorative glyph, so an icon button carries no text. Without an
     * `aria-label`/`aria-labelledby`/`title` it has no accessible name at all (AXE `button-name`).
     *
     * A host that opted into `aria-hidden="true"` is exempt: assistive technology never reaches it, so it
     * has nothing to be named for. `KbqStepper` and the datepicker toggle are both built that way — a
     * mouse-only affordance beside a control that already carries the keyboard interaction.
     */
    private warnIfMissingAccessibleName(): void {
        if (!isDevMode()) return;

        const host = this.getHostElement();

        if (host.getAttribute('aria-hidden') === 'true') return;

        const hasAccessibleName =
            !!host.textContent?.trim() ||
            host.hasAttribute('aria-label') ||
            host.hasAttribute('aria-labelledby') ||
            host.hasAttribute('title');

        if (hasAccessibleName) return;

        // eslint-disable-next-line no-console
        console.warn('KbqIconButton has no accessible name. Add [aria-label] or [aria-labelledby] to it.', host);
    }

    private runFocusMonitor() {
        this.focusMonitor.monitor(this.getHostElement(), true);
    }

    private stopFocusMonitor() {
        this.focusMonitor.stopMonitoring(this.getHostElement());
    }
}
