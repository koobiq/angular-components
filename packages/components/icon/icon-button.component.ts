import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    forwardRef,
    inject,
    Input,
    input,
    isDevMode,
    numberAttribute,
    OnDestroy,
    signal,
    ViewEncapsulation
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { KbqIcon } from './icon.component';

/**
 * Size options for `KbqIconButton`.
 * - `compact`: 16px icon with padding, 24×24px container.
 * - `normal`: 24px icon, no padding.
 */
export type KbqIconButtonSize = 'compact' | 'normal';

/** Host elements that are already buttons, or already activated from the keyboard by the browser. */
const NATIVELY_ACTIVATED_NODES = ['BUTTON', 'INPUT'];

/** `'Spacebar'` is what pre-Chromium Edge reports for the space bar. */
const ACTIVATION_KEYS = ['Enter', ' ', 'Spacebar'];

/**
 * An icon that acts as a button. Applied to a native `<button>` it only adds the styling; applied to any
 * other element — `<i>` is what the library itself mostly uses — it also supplies the semantics the
 * element does not have: `role="button"`, Enter/Space activation and `aria-disabled`.
 *
 * It has no text of its own, so give it an `aria-label` (or an `aria-labelledby`); in dev mode it warns
 * when it has neither.
 */
@Component({
    selector: `[kbq-icon-button]`,
    template: '<ng-content />',
    styleUrls: ['icon-button.scss', 'icon-button-tokens.scss'],
    // Host metadata is inherited through `ɵɵInheritDefinitionFeature`, DI tokens are not: without this a
    // `contentChild(KbqIcon)` walks straight past an icon button. `providers` are not inherited either,
    // so every subclass in the hierarchy needs its own entry.
    providers: [{ provide: KbqIcon, useExisting: forwardRef(() => KbqIconButton) }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq kbq-icon-button',

        '[attr.tabindex]': 'tabindex',
        '[attr.disabled]': 'disabled || null',
        '[attr.role]': 'hostRole',
        '[attr.aria-disabled]': 'disabled || null',

        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-icon-button_compact]': 'isCompact()',
        // @deprecated Will be removed in the next major release (#DS-5338)
        '[class.kbq-icon-button_small]': 'isCompact()'
    }
})
export class KbqIconButton extends KbqIcon implements AfterViewInit, OnDestroy {
    /** An icon button is interactive and exposes its own name, so it is not decorative by default. */
    protected override readonly defaultAriaHidden: boolean = false;

    protected readonly focusMonitor = inject(FocusMonitor);
    /** Size of the icon button. */
    readonly size = input<KbqIconButtonSize>('normal');
    /**
     * @deprecated Use `size` input instead. Will be removed in the next major release (#DS-5338).
     */
    readonly small = input(false);

    /** @docs-private */
    protected readonly isCompact = computed(() => this.size() === 'compact' || this.small());

    /** Name of an icon within a @koobiq/icons. */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ alias: 'kbq-icon-button' }) override iconName: string | undefined;

    /**
     * Position of the button in the tab order. A disabled button is taken out of it entirely.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: (value: unknown): number | null => (value == null ? null : numberAttribute(value)) })
    get tabindex(): number | null {
        return this.disabled ? null : this._tabindex;
    }

    set tabindex(value: number | null) {
        this._tabindex = value;
    }

    private _tabindex: number | null = 0;

    // @todo 20 In the next major release this feature will be replaced on the input signal.
    /** Whether the button is disabled. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this.disabledSignal.set(value);
    }

    // @todo 20 In the next major release this line will be deleted.
    private _disabled: boolean;

    /** @docs-private */
    readonly disabledSignal = signal(false);

    /** The button sizes itself through its own padding, so it never gets the bare icon's `max-height`. */
    protected override readonly appliesMaxHeight: boolean = false;

    /** `null` on an element that is a button already; `'button'` on everything else. @docs-private */
    protected readonly hostRole: 'button' | null;

    private readonly nativelyActivated: boolean;
    private accessibleNameWarned = false;

    constructor() {
        super();

        const host = this.getHostElement();

        // A link that navigates keeps its own role and its own Enter handling; anything else is a button
        // only because this component says so, and has to be told to behave like one.
        this.nativelyActivated =
            NATIVELY_ACTIVATED_NODES.includes(host.nodeName) || (host.nodeName === 'A' && host.hasAttribute('href'));
        this.hostRole = this.nativelyActivated ? null : 'button';

        // @todo 20 In the next major release this line will be deleted.
        toObservable(this.disabledSignal).subscribe((value) => (this._disabled = value));

        effect(() => (this.disabledSignal() ? this.stopFocusMonitor() : this.runFocusMonitor()));
    }

    ngAfterViewInit(): void {
        this.runFocusMonitor();
        this.warnIfMissingAccessibleName();
        this.listenForKeyboardActivation();
    }

    ngOnDestroy() {
        this.stopFocusMonitor();
    }

    /**
     * Enter and Space have to synthesize the click a non-button host never fires on its own.
     *
     * The listener is registered here rather than declared in `host`, so that it runs after every
     * listener the element already carries: `KbqTagRemove` and `KbqCleaner` activate this very element
     * themselves, and the `defaultPrevented` check is what keeps the click from being synthesized twice.
     * A host listener is registered during element creation and would always run first, with nothing yet
     * to check.
     */
    private listenForKeyboardActivation(): void {
        if (this.nativelyActivated) return;

        this.destroyRef.onDestroy(
            this.renderer.listen(this.getHostElement(), 'keydown', (event: KeyboardEvent) =>
                this.activateFromKeyboard(event)
            )
        );
    }

    private activateFromKeyboard(event: KeyboardEvent): void {
        if (this.disabled || event.defaultPrevented) return;
        if (!ACTIVATION_KEYS.includes(event.key)) return;

        // Space scrolls the page, and both keys are usually acted on by whatever list or overlay the
        // button sits in.
        event.preventDefault();
        event.stopPropagation();

        this.getHostElement().click();
    }

    /**
     * `KbqIcon` renders a decorative glyph, so an icon button carries no text. Without an
     * `aria-label`/`aria-labelledby`/`title` it has no accessible name at all (AXE `button-name`).
     */
    private warnIfMissingAccessibleName(): void {
        if (!isDevMode() || this.accessibleNameWarned) return;

        const host = this.getHostElement();
        const hasAccessibleName =
            !!host.textContent?.trim() ||
            host.hasAttribute('aria-label') ||
            host.hasAttribute('aria-labelledby') ||
            host.hasAttribute('title');

        if (hasAccessibleName) return;

        this.accessibleNameWarned = true;

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
