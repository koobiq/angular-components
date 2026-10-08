import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import {
    AfterContentInit,
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    Directive,
    ElementRef,
    inject,
    Injector,
    input,
    NgZone,
    OnChanges,
    OnDestroy,
    output,
    Renderer2,
    signal,
    SimpleChanges,
    untracked,
    ViewEncapsulation
} from '@angular/core';
import {
    isControl,
    isInput,
    isLeftBracket,
    isRightBracket,
    kbqAfterAnimations,
    kbqAnimationsDisabled,
    KbqStateSaving
} from '@koobiq/components/core';

export enum SidebarPositions {
    Left = 'left',
    Right = 'right'
}

interface KbqSidebarParams {
    openedStateMinWidth: string;
    openedStateWidth: string;
    openedStateMaxWidth: string;

    closedStateWidth: string;
}

@Directive({
    selector: '[kbq-sidebar-opened]',
    host: {
        class: 'kbq-sidebar-opened'
    },
    exportAs: 'kbqSidebarOpened'
})
export class KbqSidebarOpened {
    readonly minWidth = input<string>(undefined!);
    readonly width = input<string>(undefined!);
    readonly maxWidth = input<string>(undefined!);
}

@Directive({
    selector: '[kbq-sidebar-closed]',
    host: {
        class: 'kbq-sidebar-closed'
    },
    exportAs: 'kbqSidebarClosed'
})
export class KbqSidebarClosed {
    readonly width = input<string>(undefined!);
}

/** The persisted state of a sidebar — whether it was open, and the width it was last left at. */
export interface KbqSidebarState {
    opened: boolean;
    /** Absent while the sidebar has never been resized away from the width its content declares. */
    width?: string;
}

/**
 * Coerces a raw persisted payload into a `KbqSidebarState`, returning `null` for anything unrecognizable.
 *
 * Web storage is origin-wide and user-writable, so a payload is never trusted — without this, an entry
 * such as `{"opened": "yes"}` would reach the width bindings and break them.
 */
const normalizeSidebarState = (parsed: unknown): KbqSidebarState | null => {
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

    const { opened, width } = parsed as Partial<KbqSidebarState>;

    if (typeof opened !== 'boolean') return null;

    return typeof width === 'string' ? { opened, width } : { opened };
};

@Component({
    selector: 'kbq-sidebar',
    templateUrl: 'sidebar.component.html',
    styleUrls: ['./sidebar.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-sidebar',
        '[class.kbq-sidebar_opened]': 'opened',
        '[class.kbq-animations-disabled]': 'animationsDisabled',
        '[style.min-width]': 'opened ? params.openedStateMinWidth : params.closedStateWidth',
        '[style.width]': 'opened ? params.openedStateWidth : params.closedStateWidth',
        '[style.max-width]': 'opened ? params.openedStateMaxWidth : params.closedStateWidth'
    },
    // `useStateSaving` and `stateSavingKey` are the directive's inputs, surfaced on the sidebar.
    hostDirectives: [
        { directive: KbqStateSaving, inputs: ['useStateSaving', 'stateSavingKey'] }
    ],
    exportAs: 'kbqSidebar'
})
export class KbqSidebar implements OnChanges, OnDestroy, AfterContentInit {
    private ngZone = inject(NgZone);
    private elementRef = inject(ElementRef);

    /**
     * @docs-private
     */
    protected readonly document = inject<Document>(DOCUMENT);
    private readonly renderer = inject(Renderer2);
    private readonly isBrowser = inject(Platform).isBrowser;
    private readonly injector = inject(Injector);

    /**
     * Whether the sidebar opens and closes without motion.
     * @docs-private
     */
    protected readonly animationsDisabled = kbqAnimationsDisabled();

    private stateAnimation?: { destroy(): void };

    /**
     * Persistence of the opened state and width, applied as a host directive. `useStateSaving` and
     * `stateSavingKey` are its inputs, forwarded onto the sidebar.
     */
    private readonly stateSaving = inject(KbqStateSaving);

    get opened(): boolean {
        return this.openedState();
    }

    set opened(value: boolean) {
        // Untracked: an `effect` that assigns `opened` must not come to depend on the state it replaces.
        untracked(() => this.setOpened(value));
    }

    private readonly openedState = signal(true);

    /**
     * Whether anything has assigned `opened`. Snapshotted while initializing, where only an input binding
     * can have done so — `toggle()` needs a view query and the bracket shortcut is registered later — so
     * it reads as "the application drives this sidebar" and suppresses persistence.
     */
    private openedWritten = false;

    private controlled = false;

    readonly position = input<SidebarPositions>(undefined!);

    /**
     * @docs-private
     */
    get params(): KbqSidebarParams {
        return this.paramsState();
    }

    /** @docs-private */
    set params(value: KbqSidebarParams) {
        this.paramsState.set(value);
    }

    private readonly paramsState = signal<KbqSidebarParams>({
        openedStateWidth: 'inherit',
        openedStateMinWidth: 'inherit',
        openedStateMaxWidth: 'inherit',

        closedStateWidth: '32px'
    });

    readonly stateChanged = output<boolean>();

    /**
     * @docs-private
     */
    readonly openedContent = contentChild(KbqSidebarOpened);

    /**
     * @docs-private
     */
    readonly closedContent = contentChild(KbqSidebarClosed);

    /**
     * @docs-private
     */
    get internalState(): boolean {
        return this.internalStateSignal();
    }

    /** @docs-private */
    set internalState(value: boolean) {
        this.internalStateSignal.set(value);
    }

    private readonly internalStateSignal = signal(true);

    private unbindKeydownListener: ReturnType<Renderer2['listen']> | null = null;

    /** @docs-private */
    readonly openedInput = input<boolean | undefined>(undefined, { alias: 'opened' });

    ngOnChanges(changes: SimpleChanges): void {
        // A bound input is handed to its member as the decorator input did; unbound, it leaves what code wrote.
        if (changes['openedInput']) {
            const opened = this.openedInput();

            if (opened !== undefined) this.opened = opened;
        }
    }

    constructor() {
        afterNextRender(() => this.registerKeydownListener());

        // The state lives under the new key now, so restore from it.
        this.stateSaving.keyChanges.subscribe(() => this.restoreState());
    }

    ngAfterContentInit(): void {
        const openedContent = this.openedContent();
        const closedContent = this.closedContent();

        this.params = {
            openedStateWidth: openedContent?.width() || 'inherit',
            openedStateMinWidth: openedContent?.minWidth() || 'inherit',
            openedStateMaxWidth: openedContent?.maxWidth() || 'inherit',

            closedStateWidth: closedContent?.width() || '32px'
        };

        // After the params above, which are rebuilt wholesale and would discard a restored width.
        this.controlled = this.openedWritten;

        this.restoreState();

        // The first render shows the content of the initial state; `stateChanged` reports it once rendered.
        this.internalState = this.openedState();
        this.waitForStateAnimation();
    }

    /** Reads the persisted state and applies it. Runs while initializing, and again on a key change. */
    private restoreState(): void {
        if (!this.persists) return;

        const savedState = this.stateSaving.read(normalizeSidebarState);

        if (!savedState) return;

        this.stateSaving.applying(() => {
            // Past the setter on purpose: it captures the current `offsetWidth` on the way out, which
            // would overwrite the width being restored on the line below.
            this.openedState.set(savedState.opened);

            // `internalState` otherwise only catches up once the width transition ends.
            this.internalState = savedState.opened;

            if (savedState.width) {
                this.params = { ...this.params, openedStateWidth: savedState.width };
            }
        });
    }

    ngOnDestroy(): void {
        this.unRegisterKeydownListener();
    }

    /**
     * Persists whether the sidebar is open and the width it was last left at.
     *
     * Called whenever `opened` changes. The width is only captured as the sidebar closes, so dragging it
     * wider and reloading without closing it keeps the previous width — the same as before persistence.
     */
    saveState(): void {
        if (!this.persists) return;

        this.stateSaving.write(this.snapshot());
    }

    /**
     * Removes the state persisted for this sidebar.
     *
     * Persistence itself stays on — the next change is written again. Unset `useStateSaving` to stop it.
     */
    clearSavedState(): void {
        this.stateSaving.clear();
    }

    /**
     * Whether state is currently persisted for this sidebar — restored on init, or written since.
     * Always `false` while `useStateSaving` is unset, and `false` again after `clearSavedState()`.
     */
    get hasSavedState(): boolean {
        return this.stateSaving.state != null;
    }

    toggle(): void {
        this.opened = !untracked(this.openedState);
    }

    private setOpened(value: boolean): void {
        this.openedWritten = true;

        if (this.openedState()) {
            this.saveWidth();
        }

        const changed = value !== this.openedState();

        this.openedState.set(value);

        if (changed) {
            // The opened content is in place while the sidebar widens, the closed one once it has narrowed.
            if (value) {
                this.internalState = true;
            }

            this.waitForStateAnimation();
        }

        // The single choke point for `toggle()` and the bracket shortcut alike. Writing is a no-op until
        // the state has been read, so the input binding that runs before initialization cannot overwrite
        // what is stored.
        this.saveState();
    }

    /** Switches the content and reports the state once the width transition has ended. */
    private waitForStateAnimation(): void {
        this.stateAnimation?.destroy();
        this.stateAnimation = kbqAfterAnimations(
            () => this.elementRef.nativeElement,
            () => {
                this.internalState = this.openedState();
                this.stateChanged.emit(this.openedState());
            },
            this.injector
        );
    }

    private registerKeydownListener(): void {
        this.ngZone.runOutsideAngular(() => {
            this.unbindKeydownListener ||= this.renderer.listen(this.document, 'keypress', (event) =>
                this.handleKeydown(event)
            );
        });
    }

    private unRegisterKeydownListener(): void {
        if (this.unbindKeydownListener) {
            this.unbindKeydownListener();
            this.unbindKeydownListener = null;
        }
    }

    private handleKeydown(event: KeyboardEvent): void {
        if (isControl(event) || isInput(event)) return;

        const position = this.position();

        if (
            (position === SidebarPositions.Left && isLeftBracket(event)) ||
            (position === SidebarPositions.Right && isRightBracket(event))
        ) {
            this.toggle();
        }
    }

    /** Whether this sidebar reads and writes its state at all. */
    private get persists(): boolean {
        // A sidebar that is not in the document has no stable key — the default resolver derives one from
        // the path to `<body>` — which is the ordinary state of one projected into an overlay.
        return this.stateSaving.useStateSaving() && !this.controlled && !!this.stateSaving.host?.isConnected;
    }

    /** The whole state, with the width left out while it is the one the content declares. */
    private snapshot(): KbqSidebarState {
        const width = this.params.openedStateWidth;
        const opened = this.openedState();

        return width && width !== 'inherit' ? { opened, width } : { opened };
    }

    private saveWidth() {
        if (!this.isBrowser) return;

        this.params = { ...this.params, openedStateWidth: `${this.elementRef.nativeElement.offsetWidth}px` };
    }
}
