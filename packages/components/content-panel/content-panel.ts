import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    ErrorHandler,
    inject,
    Injector,
    input,
    linkedSignal,
    numberAttribute,
    OnInit,
    output,
    signal,
    untracked,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import {
    KBQ_A11Y_LOCALE_CONFIGURATION,
    kbqAfterAnimations,
    kbqAnimationsDisabled,
    KbqComponentColors,
    KbqLocaleOverridesDirective,
    KbqOverflowShadowContainer,
    KbqStateSaving
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqResizable, KbqResizer, KbqResizerSizeChangeEvent } from '@koobiq/components/resizer';
import { KbqScrollbar } from '@koobiq/components/scrollbar';
import { SizeL } from '@koobiq/design-tokens';
import { firstValueFrom, isObservable, Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'kbq-content-panel-aside',
    template: `
        <ng-content />
    `,
    styleUrl: './content-panel-aside.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-content-panel-aside'
    },
    exportAs: 'kbqContentPanelAside'
})
export class KbqContentPanelAside {}

@Directive({
    selector: '[kbqContentPanelHeaderTitle]',
    host: {
        class: 'kbq-content-panel-header-title'
    },
    exportAs: 'kbqContentPanelHeaderTitle'
})
export class KbqContentPanelHeaderTitle {}

@Directive({
    selector: '[kbqContentPanelHeaderActions]',
    host: {
        class: 'kbq-content-panel-header-actions'
    },
    exportAs: 'kbqContentPanelHeaderActions'
})
export class KbqContentPanelHeaderActions {}

@Component({
    selector: 'kbq-content-panel-header',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <div class="kbq-content-panel-header__wrapper">
            <ng-content select="[kbqContentPanelHeaderTitle]" />
            <div class="kbq-content-panel-header__actions">
                <ng-content select="[kbqContentPanelHeaderActions]" />
                @if (!contentPanelContainer.disableClose()) {
                    <button
                        class="kbq-content-panel-header__close-button"
                        kbq-button
                        type="button"
                        [attr.aria-label]="a11yLocaleConfiguration().close"
                        [color]="componentColors.Contrast"
                        [kbqStyle]="buttonStyles.Transparent"
                        (click)="contentPanelContainer.close()"
                    >
                        <i kbq-icon="kbq-xmark_16"></i>
                    </button>
                }
            </div>
        </div>
        <ng-content />
    `,
    styleUrl: './content-panel-header.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-content-panel-header',
        '[style.box-shadow]':
            'contentPanel.bodyOverflow().top ? "var(--kbq-content-panel-header-overflow-box-shadow)" : null'
    },
    hostDirectives: [
        { directive: KbqLocaleOverridesDirective, inputs: ['kbqLocaleOverrides: localeOverrides'] }
    ]
})
export class KbqContentPanelHeader {
    /**
     * @docs-private
     */
    protected readonly contentPanelContainer = inject(KbqContentPanelContainer);
    /** @docs-private */
    protected readonly contentPanel = inject(KbqContentPanel);

    /**
     * @docs-private
     */
    protected readonly buttonStyles = KbqButtonStyles;

    /**
     * @docs-private
     */
    protected readonly componentColors = KbqComponentColors;
    /** Accessible name for the icon-only close button. */
    protected readonly a11yLocaleConfiguration = inject(KbqLocaleOverridesDirective, { self: true }).read(
        'a11y',
        KBQ_A11Y_LOCALE_CONFIGURATION
    );
}

@Component({
    selector: 'kbq-content-panel-body',
    imports: [KbqScrollbar, KbqOverflowShadowContainer],
    template: `
        <kbq-scrollbar #overflowContainer="kbqOverflowShadowContainer" kbqOverflowShadowContainer>
            <div class="kbq-content-panel-body__content">
                <ng-content />
            </div>
        </kbq-scrollbar>
    `,
    styleUrl: './content-panel-body.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-content-panel-body'
    },
    exportAs: 'kbqContentPanelBody'
})
export class KbqContentPanelBody {
    /** @docs-private */
    readonly scrollbar = viewChild.required(KbqScrollbar);
    /** @docs-private */
    readonly overflowContainer = viewChild.required(KbqOverflowShadowContainer);
}

@Component({
    selector: 'kbq-content-panel-footer',
    template: `
        <ng-content />
    `,
    styleUrl: './content-panel-footer.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-content-panel-footer',
        '[style.box-shadow]':
            'contentPanel.bodyOverflow().bottom ? "var(--kbq-content-panel-footer-overflow-box-shadow)" : null'
    }
})
export class KbqContentPanelFooter {
    /** @docs-private */
    protected readonly contentPanel = inject(KbqContentPanel);
}

@Component({
    selector: 'kbq-content-panel',
    template: `
        <ng-content select="kbq-content-panel-aside" />
        <div class="kbq-content-panel__content">
            <ng-content select="kbq-content-panel-header" />
            <ng-content select="kbq-content-panel-body" />
            <ng-content select="kbq-content-panel-footer" />
        </div>
    `,
    styleUrls: [
        './content-panel-tokens.scss',
        './content-panel.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-content-panel'
    }
})
export class KbqContentPanel {
    private readonly contentPanelBody = contentChild(KbqContentPanelBody);

    /**
     * Current body overflow state. Read by the header and footer to render their `box-shadow`.
     *
     * @docs-private
     */
    readonly bodyOverflow = computed(
        () => this.contentPanelBody()?.overflowContainer().overflow() ?? { top: false, bottom: false }
    );
}

/** How long a resize has to settle before the width is written. */
const resizeWriteDebounce = 300;

/** The persisted state of a content panel — whether it was open, and how wide it was dragged. */
export interface KbqContentPanelState {
    opened: boolean;
    width: number;
}

/**
 * Coerces a raw persisted payload into a `KbqContentPanelState`, returning `null` for anything
 * unrecognizable.
 *
 * Web storage is origin-wide and user-writable, so a payload is never trusted — without this, an entry
 * such as `{"width": "wide"}` would reach the inline `width` style and collapse the panel.
 */
const normalizeContentPanelState = (parsed: unknown): KbqContentPanelState | null => {
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

    const { opened, width } = parsed as Partial<KbqContentPanelState>;

    if (typeof opened !== 'boolean' || typeof width !== 'number' || !Number.isFinite(width)) return null;

    return { opened, width };
};

/**
 * Decides whether a content panel closes: only `true`, or a promise or an observable of it, closes the panel. Any
 * other answer keeps it open, an observable that completes with no value and an error included. An error the function
 * throws reaches the caller of `close()`, and an asynchronous one goes to the `ErrorHandler`.
 */
export type KbqContentPanelBeforeClose = () => boolean | Promise<boolean> | Observable<boolean>;

@Component({
    selector: 'kbq-content-panel-container',
    imports: [KbqResizable, KbqResizer, KbqScrollbar],
    template: `
        <kbq-scrollbar
            class="kbq-content-panel-container__scrollbar"
            [class.kbq-content-panel-container__scrollbar_animating]="contentAnimating()"
            [class.kbq-animations-disabled]="animationsDisabled"
            [style.margin-right.px]="contentMargin()"
        >
            <div class="kbq-content-panel-container__content">
                <ng-content />
            </div>
        </kbq-scrollbar>
        @if (openedState()) {
            <div
                animate.enter="kbq-content-panel-container__panel_enter"
                animate.leave="kbq-content-panel-container__panel_leave"
                class="kbq-content-panel-container__panel"
                kbqResizable
                [class.kbq-animations-disabled]="animationsDisabled"
                [style.min-width.px]="minWidth()"
                [style.width.px]="widthState()"
                [style.max-width.px]="maxWidth()"
            >
                @if (!disableResizer()) {
                    <div
                        class="kbq-content-panel-container__panel-resizer"
                        [kbqResizer]="[-1, 0]"
                        (sizeChange)="handleResizerSizeChange($event)"
                        (dblclick)="handleResizerDBLClick($event)"
                    ></div>
                }
                <ng-content select="kbq-content-panel" />
            </div>
        }
    `,
    styleUrl: './content-panel-container.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-content-panel-container',
        // A press on text inside would move the focus to `body`, out of reach of the ESCAPE listener, and so would a
        // press on a button in WebKit, which does not focus buttons.
        tabindex: '-1',
        '[class.kbq-content-panel-container__opened]': 'openedState()',
        '(keydown.escape)': 'handleEscapeKeydown($any($event))'
    },
    // `useStateSaving` and `stateSavingKey` are the directive's inputs, surfaced on the container.
    hostDirectives: [
        { directive: KbqStateSaving, inputs: ['useStateSaving', 'stateSavingKey'] }
    ],
    exportAs: 'kbqContentPanelContainer'
})
export class KbqContentPanelContainer implements OnInit {
    /**
     * Persistence of the opened state and width, applied as a host directive. `useStateSaving` and
     * `stateSavingKey` are its inputs, surfaced on the container.
     */
    private readonly stateSaving = inject(KbqStateSaving);

    /**
     * Whether the content panel is opened. Defaults to `undefined`.
     *
     * Bound through the `opened` attribute. Unset it is `undefined` rather than `false`, which is how the
     * container tells an application that drives the panel from one that leaves it to remember its own
     * state. Read {@link isOpened} for the state itself.
     */
    readonly openedInput = input(undefined, {
        alias: 'opened',
        transform: (value: unknown): boolean | undefined => (value == null ? undefined : booleanAttribute(value))
    });

    /**
     * Emits event when the content panel opened state is changed.
     */
    readonly openedChange = output<boolean>();

    /**
     * Whether the content panel can not be closed by clicking on the close button or pressing the ESCAPE key.
     * Defaults to `false`.
     */
    readonly disableClose = input(false, { transform: booleanAttribute });

    /**
     * Whether the content panel can not be closed by pressing the ESCAPE key.
     */
    readonly disableCloseByEscape = input(this.disableClose(), { transform: booleanAttribute });

    /**
     * Decides whether the content panel closes: by the close button, the ESCAPE key, {@link close} or {@link toggle}.
     * A bound `opened` does not consult it. Defaults to `undefined`.
     */
    readonly beforeClose = input<KbqContentPanelBeforeClose>();

    /**
     * Whether the content panel resizer is disabled.
     */
    readonly disableResizer = input(false, { transform: booleanAttribute });

    /**
     * Minimum width of the `KbqContentPanel`. Defaults to `480`.
     */
    readonly minWidth = input(480, { transform: numberAttribute });

    /**
     * Width of the `KbqContentPanel`. Defaults to `640`.
     */
    readonly width = input(640, { transform: numberAttribute });

    /**
     * Max width of the `KbqContentPanel`. Defaults to `800`.
     */
    readonly maxWidth = input(800, { transform: numberAttribute });

    /**
     * A linked signal rather than a plain one: it follows the input whenever the input changes, and keeps
     * a local write until then — which is what lets a restored state survive the input's initial value.
     *
     * @docs-private
     */
    protected readonly openedState = linkedSignal(() => this.openedInput() ?? false);

    /**
     * @docs-private
     */
    protected readonly widthState = linkedSignal(() => this.width());

    /**
     * Whether the content panel is opened.
     */
    readonly isOpened = computed(() => this.openedState());

    /**
     * The room the content leaves for the opened panel.
     *
     * @docs-private
     */
    protected readonly contentMargin = computed(() =>
        this.openedState() ? this.widthState() + (parseInt(SizeL) || 16) : 0
    );

    /**
     * Whether the margin of the content transitions: only while it makes room for the panel opening or
     * closing, so that a resize of the panel moves the content at once.
     *
     * @docs-private
     */
    protected readonly contentAnimating = signal(false);

    /** @docs-private */
    protected readonly animationsDisabled = kbqAnimationsDisabled();

    private readonly content = viewChild.required(KbqScrollbar, { read: ElementRef });
    private readonly injector = inject(Injector);
    private contentAnimation?: { destroy(): void };

    private readonly destroyRef = inject(DestroyRef);
    private readonly errorHandler = inject(ErrorHandler);

    /** The answer of an asynchronous `beforeClose`, which a repeated request waits for instead of asking again. */
    private closeRequest?: Promise<void>;

    /** Whether `beforeClose` is being asked: one that closes the panel itself is not asked again. */
    private askingBeforeClose = false;

    /**
     * Resizing reports on every pointer move, so the width is written once the drag settles rather than
     * on each frame. The store's unchanged-payload skip does not help here — every frame is a new number.
     */
    private readonly resized = new Subject<void>();

    constructor() {
        this.resized.pipe(debounceTime(resizeWriteDebounce), takeUntilDestroyed()).subscribe(() => {
            this.saveState();
        });

        // The state lives under the new key now, so restore from it.
        this.stateSaving.keyChanges.subscribe(() => this.restoreState());

        let opened: boolean | undefined;

        effect(() => {
            const previous = opened;

            opened = this.openedState();

            if (previous !== undefined && previous !== opened) {
                // A panel closed, or closed and opened again, by other means no longer waits for the answer.
                this.closeRequest = undefined;
                this.animateContent();
            }
        });
    }

    ngOnInit(): void {
        this.restoreState();
    }

    private animateContent(): void {
        this.contentAnimating.set(true);
        this.contentAnimation?.destroy();
        this.contentAnimation = kbqAfterAnimations(
            () => this.content().nativeElement,
            () => this.contentAnimating.set(false),
            this.injector
        );
    }

    /** Reads the persisted state and applies it. Runs while initializing, and again on a key change. */
    private restoreState(): void {
        if (!this.persists) return;

        const savedState = this.stateSaving.read(normalizeContentPanelState);

        if (!savedState) return;

        this.stateSaving.applying(() => {
            // A bound `[opened]` owns the opened state, so only the width is restored there. `[width]` is
            // not ownership in the same way: there is no `widthChange`, so a drag never reaches the
            // application and the input is the starting width rather than the current one.
            if (this.openedInput() === undefined) {
                this.openedState.set(savedState.opened);
            }

            this.widthState.set(this.clampWidth(savedState.width));
        });
    }

    /**
     * Persists whether the panel is open and how wide it is.
     *
     * Called whenever the panel is opened, closed or resized.
     */
    saveState(): void {
        untracked(() => {
            if (!this.persists) return;

            this.stateSaving.write({ opened: this.openedState(), width: this.widthState() });
        });
    }

    /**
     * Removes the state persisted for this panel.
     *
     * Persistence itself stays on — the next change is written again. Unset `useStateSaving` to stop it.
     */
    clearSavedState(): void {
        untracked(() => this.stateSaving.clear());
    }

    /**
     * Whether state is currently persisted for this panel — restored on init, or written since.
     * Always `false` while `useStateSaving` is unset, and `false` again after `clearSavedState()`.
     */
    get hasSavedState(): boolean {
        return this.stateSaving.state != null;
    }

    /**
     * Toggles the content panel opened state. Closing asks `beforeClose`, as {@link close} does.
     */
    toggle(): void {
        // Untracked, as `open()`, `close()`, `saveState()` and `clearSavedState()`: called from a consumer's
        // `effect()`, the state read on the way — `opened`, the width, the state saving inputs — would make the
        // effect run again on every open and close.
        untracked(() => {
            if (this.openedState()) {
                this.close();
            } else {
                this.setOpened(true);
            }
        });
    }

    /**
     * Opens the content panel.
     */
    open(): void {
        untracked(() => {
            if (!this.openedState()) this.setOpened(true);
        });
    }

    /**
     * Closes the content panel, unless `beforeClose` keeps it open. Without `beforeClose` the panel closes at once,
     * and with an asynchronous one once it answers: `openedChange` reports the close.
     */
    close(): void {
        untracked(() => this.requestClose());
    }

    /** Closes the panel or starts asking `beforeClose`, and tells whether it did either. */
    private requestClose(): boolean {
        if (this.closeRequest) return true;

        if (this.askingBeforeClose || !this.openedState()) return false;

        const answer = this.askBeforeClose();

        if (typeof answer !== 'object' || answer === null) return this.closeIfAllowed(answer);

        // A request the panel dropped by closing meanwhile is not answered.
        const request: Promise<void> = Promise.resolve(answer)
            .then((allowed) => {
                if (request !== this.closeRequest) return;

                // Over before the panel closes, so that a listener of the close can request the next one.
                this.closeRequest = undefined;
                this.closeIfAllowed(allowed);
            })
            .catch((error: unknown) => this.errorHandler.handleError(error))
            .finally(() => {
                if (request === this.closeRequest) this.closeRequest = undefined;
            });

        this.closeRequest = request;

        return true;
    }

    /** Asks `beforeClose`, with an observable answer reduced to its first value. Without it the panel closes. */
    private askBeforeClose(): boolean | Promise<boolean> {
        const beforeClose = this.beforeClose();

        if (!beforeClose) return true;

        this.askingBeforeClose = true;

        try {
            const answer = beforeClose();

            return isObservable(answer)
                ? firstValueFrom(answer.pipe(takeUntilDestroyed(this.destroyRef)), { defaultValue: false })
                : answer;
        } finally {
            this.askingBeforeClose = false;
        }
    }

    private closeIfAllowed(allowed: boolean): boolean {
        // Only an explicit `true` closes, so an answer lost on the way, such as a dismissed confirmation, keeps the
        // changes. It can also come after the panel left the page, and an output of a destroyed component throws on
        // emit.
        if (allowed !== true || this.destroyRef.destroyed) return false;

        if (this.openedState()) this.setOpened(false);

        return true;
    }

    private setOpened(opened: boolean): void {
        this.openedState.set(opened);
        this.openedChange.emit(opened);
        this.saveState();
    }

    /**
     * @docs-private
     */
    protected handleResizerDBLClick(event: MouseEvent): void {
        event.preventDefault();

        this.widthState.set(this.width());

        // Persisted straight away rather than through the debounce: a reset is a single deliberate act,
        // and leaving the dragged width stored would bring it back on the next visit.
        this.saveState();
    }

    /**
     * @docs-private
     */
    protected handleResizerSizeChange({ width }: KbqResizerSizeChangeEvent): void {
        this.widthState.set(this.clampWidth(width));

        this.resized.next();
    }

    /** Whether this panel reads and writes its state at all. */
    private get persists(): boolean {
        // A panel that is not in the document has no stable key — the default resolver derives one from
        // the path to `<body>` — which is the ordinary state of one projected into an overlay.
        return this.stateSaving.useStateSaving() && !!this.stateSaving.host?.isConnected;
    }

    /** Holds a width inside the configured bounds, which can differ from the ones a state was saved under. */
    private clampWidth(width: number): number {
        if (width > this.maxWidth()) return this.maxWidth();
        if (width < this.minWidth()) return this.minWidth();

        return width;
    }

    /**
     * @docs-private
     */
    protected handleEscapeKeydown(event: KeyboardEvent): void {
        // A control inside the container consumed the key to close a popup of its own, such as an autocomplete panel.
        if (event.defaultPrevented) return;

        if (!this.openedState() || this.disableClose() || this.disableCloseByEscape()) return;

        // A synchronous veto leaves the key to the listeners further up, such as a dialog the panel sits in.
        if (!this.requestClose()) return;

        event.preventDefault();
        event.stopPropagation();
    }
}
