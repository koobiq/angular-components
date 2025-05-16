import { animate, state, style, transition, trigger } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    Directive,
    inject,
    input,
    NgZone,
    OnDestroy,
    OnInit,
    output,
    Renderer2,
    signal,
    ViewEncapsulation
} from '@angular/core';
import { outputFromObservable, outputToObservable, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { isControl, isInput, isLeftBracket, isRightBracket } from '@koobiq/cdk/keycodes';
import { KbqAnimationDurations } from '@koobiq/components/core';

enum KbqSidebarAnimationState {
    Opened = 'opened',
    Closed = 'closed'
}

type KbqSidebarAnimationParams = Partial<{
    openedStateMinWidth: string;
    openedStateWidth: string;
    openedStateMaxWidth: string;
    closedStateWidth: string;
}>;

const KBQ_SIDEBAR_ANIMATION_PARAMS_DEFAULT: KbqSidebarAnimationParams = {
    openedStateMinWidth: 'inherit',
    openedStateWidth: 'inherit',
    openedStateMaxWidth: 'inherit',
    closedStateWidth: '32px'
};

const KBQ_SIDEBAR_ANIMATION = trigger('state', [
    state(
        'opened',
        style({
            minWidth: '{{ openedStateMinWidth }}',
            width: '{{ openedStateWidth }}',
            maxWidth: '{{ openedStateMaxWidth }}'
        }),
        {
            params: {
                openedStateMinWidth: '',
                openedStateWidth: '',
                openedStateMaxWidth: ''
            } satisfies KbqSidebarAnimationParams
        }
    ),
    state(
        'closed',
        style({
            minWidth: '{{ closedStateWidth }}',
            width: '{{ closedStateWidth }}',
            maxWidth: '{{ closedStateWidth }}'
        }),
        { params: { closedStateWidth: '' } satisfies KbqSidebarAnimationParams }
    ),
    transition('opened => closed', [animate(KbqAnimationDurations.Entering)]),
    transition('closed => opened', [animate(KbqAnimationDurations.Complex)])

]);

export enum KbqSidebarPositions {
    Left = 'left',
    Right = 'right'
}

@Directive({
    standalone: true,
    selector: '[kbq-sidebar-opened],[kbqSidebarOpened]',
    exportAs: 'kbqSidebarOpened',
    host: {
        class: 'kbq-sidebar_opened'
    }
})
export class KbqSidebarOpened {
    /**
     * Min width of the sidebar when opened.
     */
    readonly minWidth = input(KBQ_SIDEBAR_ANIMATION_PARAMS_DEFAULT.openedStateMinWidth);
    /**
     * Width of the sidebar when opened.
     */
    readonly width = input(KBQ_SIDEBAR_ANIMATION_PARAMS_DEFAULT.openedStateWidth);
    /**
     * Max width of the sidebar when opened.
     */
    readonly maxWidth = input(KBQ_SIDEBAR_ANIMATION_PARAMS_DEFAULT.openedStateMaxWidth);
}

@Directive({
    standalone: true,
    selector: '[kbq-sidebar-closed],[kbqSidebarClosed]',
    exportAs: 'kbqSidebarClosed',
    host: {
        class: 'kbq-sidebar_closed'
    }
})
export class KbqSidebarClosed {
    /**
     * Width of the sidebar when closed.
     */
    readonly width = input(KBQ_SIDEBAR_ANIMATION_PARAMS_DEFAULT.closedStateWidth);
}

@Component({
    standalone: true,
    selector: 'kbq-sidebar',
    exportAs: 'kbqSidebar',
    template: `
        @if (internalState()) {
            <ng-content select="[kbq-sidebar-opened],[kbqSidebarOpened]" />
        } @else {
            <ng-content select="[kbq-sidebar-closed],[kbqSidebarClosed]" />
        }
    `,
    styleUrls: ['./sidebar.scss'],
    host: {
        class: 'kbq-sidebar',
        '[@state]': `{
            value: animationStateValue(),
            params: animationStateParams()
        }`,
        '(@state.start)': 'onAnimationStart()',
        '(@state.done)': 'onAnimationDone()'
    },
    animations: [KBQ_SIDEBAR_ANIMATION],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqSidebar implements OnDestroy, OnInit {
    private readonly document = inject<Document>(DOCUMENT);
    private readonly ngZone = inject(NgZone);
    private readonly renderer = inject(Renderer2);

    /** @docs-private */
    readonly openedContent = contentChild(KbqSidebarOpened);

    /** @docs-private */
    readonly closedContent = contentChild(KbqSidebarClosed);

    /**
     * Whether the sidebar is opened or closed.
     */
    readonly opened = input(true, { transform: booleanAttribute });

    private readonly _opened = signal(this.opened());

    /**
     * @docs-private
     */
    readonly openedChange = output<boolean>();

    /**
     * Emits event when the sidebar opened state changes.
     */
    readonly stateChanged = outputFromObservable(outputToObservable(this.openedChange));

    /**
     * Sidebar position.
     */
    readonly position = input.required<KbqSidebarPositions>();

    /** @docs-private */
    readonly animationStateValue = computed<KbqSidebarAnimationState>(() => {
        return this._opened() ? KbqSidebarAnimationState.Opened : KbqSidebarAnimationState.Closed;
    });

    /** @docs-private */
    protected animationStateParams = computed<KbqSidebarAnimationParams>(() => {
        const openedContent = this.openedContent();
        const closedContent = this.closedContent();

        return {
            openedStateMinWidth: openedContent?.minWidth() || KBQ_SIDEBAR_ANIMATION_PARAMS_DEFAULT.openedStateMinWidth,
            openedStateWidth: openedContent?.width() || KBQ_SIDEBAR_ANIMATION_PARAMS_DEFAULT.openedStateWidth,
            openedStateMaxWidth: openedContent?.maxWidth() || KBQ_SIDEBAR_ANIMATION_PARAMS_DEFAULT.openedStateMaxWidth,
            closedStateWidth: closedContent?.width() || KBQ_SIDEBAR_ANIMATION_PARAMS_DEFAULT.closedStateWidth
        };
    });

    /**
     * Internal opened state based on animations.
     *
     * @docs-private
     */
    protected readonly internalState = signal<boolean>(this._opened());

    private unbindKeydownListener: (() => void) | null = null;

    constructor() {
        // @TODO: should be removed after migration to `linkedSignal`
        toObservable(this.opened)
            .pipe(takeUntilDestroyed())
            .subscribe((opened) => this._opened.set(opened));
    }

    ngOnInit(): void {
        this.registerKeydownListener();
    }

    ngOnDestroy(): void {
        this.unRegisterKeydownListener();
    }

    /**
     * Toggles the sidebar opened state.
     */
    toggle(): void {
        this._opened.update((opened) => !opened);
        this.openedChange.emit(this._opened());
    }

    /** @docs-private */
    protected onAnimationStart(): void {
        const opened = this._opened();

        if (opened) {
            this.internalState.set(opened);
        }
    }

    /** @docs-private */
    protected onAnimationDone() {
        const opened = this._opened();

        this.internalState.set(opened);

        this.openedChange.emit(opened);
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
            (position === KbqSidebarPositions.Left && isLeftBracket(event)) ||
            (position === KbqSidebarPositions.Right && isRightBracket(event))
        ) {
            this.ngZone.run(() => this.toggle());
        }
    }
}
