import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import {
    AfterContentInit,
    afterNextRender,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    contentChild,
    Directive,
    ElementRef,
    inject,
    Input,
    input,
    NgZone,
    OnDestroy,
    output,
    Renderer2,
    ViewEncapsulation
} from '@angular/core';
import { isControl, isInput, isLeftBracket, isRightBracket, KbqStateSaving } from '@koobiq/components/core';
import { kbqSidebarAnimations, KbqSidebarAnimationState } from './sidebar-animations';

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
 * such as `{"opened": "yes"}` would reach the animation params and break the host binding.
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
        '[@state]': `{
            value: animationState,
            params: params
        }`,
        '(@state.start)': 'onAnimationStart()',
        '(@state.done)': 'onAnimationDone()'
    },
    // `useStateSaving` and `stateSavingKey` are the directive's inputs, surfaced on the sidebar.
    hostDirectives: [
        { directive: KbqStateSaving, inputs: ['useStateSaving', 'stateSavingKey'] }
    ],
    animations: [kbqSidebarAnimations.sidebarState],
    exportAs: 'kbqSidebar'
})
export class KbqSidebar implements OnDestroy, AfterContentInit {
    private ngZone = inject(NgZone);
    private elementRef = inject(ElementRef);

    /**
     * @docs-private
     */
    protected readonly document = inject<Document>(DOCUMENT);
    private readonly renderer = inject(Renderer2);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly isBrowser = inject(Platform).isBrowser;

    /**
     * Persistence of the opened state and width, applied as a host directive. `useStateSaving` and
     * `stateSavingKey` are its inputs, forwarded onto the sidebar.
     */
    private readonly stateSaving = inject(KbqStateSaving);

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get opened(): boolean {
        return this._opened;
    }

    set opened(value: boolean) {
        this.openedWritten = true;

        if (this._opened) {
            this.saveWidth();
        }

        this._opened = value;

        // The single choke point for `toggle()` and the bracket shortcut alike. Writing is a no-op until
        // the state has been read, so the input binding that runs before initialization cannot overwrite
        // what is stored.
        this.saveState();
    }

    private _opened: boolean = true;

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
    params: KbqSidebarParams = {
        openedStateWidth: 'inherit',
        openedStateMinWidth: 'inherit',
        openedStateMaxWidth: 'inherit',

        closedStateWidth: '32px'
    };

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
    get animationState(): KbqSidebarAnimationState {
        return this._opened ? KbqSidebarAnimationState.Opened : KbqSidebarAnimationState.Closed;
    }

    /**
     * @docs-private
     */
    internalState: boolean = true;

    private unbindKeydownListener: ReturnType<Renderer2['listen']> | null = null;

    constructor() {
        afterNextRender(() => this.registerKeydownListener());
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

        if (!this.persists) return;

        const savedState = this.stateSaving.read(normalizeSidebarState);

        if (!savedState) return;

        this.stateSaving.applying(() => {
            // Past the setter on purpose: it captures the current `offsetWidth` on the way out, which
            // would overwrite the width being restored on the line below.
            this._opened = savedState.opened;

            // `internalState` only catches up in `onAnimationDone`, so without this a sidebar restored
            // closed renders its opened content until the first animation finishes.
            this.internalState = savedState.opened;

            if (savedState.width) {
                this.params.openedStateWidth = savedState.width;
            }
        });

        this.changeDetectorRef.markForCheck();
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
        this.opened = !this.opened;
        this.changeDetectorRef.markForCheck();
    }

    /**
     * @docs-private
     */
    onAnimationStart() {
        if (this._opened) {
            this.internalState = this._opened;
        }
    }

    /**
     * @docs-private
     */
    onAnimationDone() {
        this.internalState = this._opened;

        this.stateChanged.emit(this._opened);
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

        return width && width !== 'inherit' ? { opened: this._opened, width } : { opened: this._opened };
    }

    private saveWidth() {
        if (!this.isBrowser) return;

        this.params.openedStateWidth = `${this.elementRef.nativeElement.offsetWidth}px`;
    }
}
