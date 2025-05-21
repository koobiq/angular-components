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
import { distinctUntilChanged } from 'rxjs/operators';

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
        KbqSidebarAnimationState.Opened,
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
        KbqSidebarAnimationState.Closed,
        style({
            minWidth: '{{ closedStateWidth }}',
            width: '{{ closedStateWidth }}',
            maxWidth: '{{ closedStateWidth }}'
        }),
        { params: { closedStateWidth: '' } satisfies KbqSidebarAnimationParams }
    ),
    transition(`${KbqSidebarAnimationState.Opened} => ${KbqSidebarAnimationState.Closed}`, [
        animate(KbqAnimationDurations.Entering)]),
    transition(`${KbqSidebarAnimationState.Closed} => ${KbqSidebarAnimationState.Opened}`, [
        animate(KbqAnimationDurations.Complex)])

]);

/**
 * Sidebar positions.
 */
export enum KbqSidebarPositions {
    Left = 'left',
    Right = 'right'
}

@Directive({
    standalone: true,
    selector: '[kbq-sidebar-opened],[kbqSidebarOpened]',
    exportAs: 'kbqSidebarOpened',
    host: {
        class: 'kbq-sidebar-opened'
    }
})
export class KbqSidebarOpened {
    /**
     * Min width of the sidebar when opened.
     */
    readonly minWidth = input<string>();
    /**
     * Width of the sidebar when opened.
     */
    readonly width = input<string>();
    /**
     * Max width of the sidebar when opened.
     */
    readonly maxWidth = input<string>();
}

@Directive({
    standalone: true,
    selector: '[kbq-sidebar-closed],[kbqSidebarClosed]',
    exportAs: 'kbqSidebarClosed',
    host: {
        class: 'kbq-sidebar-closed'
    }
})
export class KbqSidebarClosed {
    /**
     * Width of the sidebar when closed.
     */
    readonly width = input<string>();
}

@Component({
    standalone: true,
    selector: 'kbq-sidebar',
    exportAs: 'kbqSidebar',
    template: `
        @if (state()) {
            <ng-content select="[kbq-sidebar-opened],[kbqSidebarOpened]" />
        } @else {
            <ng-content select="[kbq-sidebar-closed],[kbqSidebarClosed]" />
        }
    `,
    styleUrl: './sidebar.scss',
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

    private readonly openedContent = contentChild(KbqSidebarOpened);
    private readonly closedContent = contentChild(KbqSidebarClosed);

    /**
     * Whether the sidebar is opened or closed.
     */
    readonly opened = input(true, { transform: booleanAttribute });

    private readonly _opened = signal(this.opened());

    /**
     * Emits event when the sidebar opened state changes.
     * Also used for two-way binding.
     */
    readonly openedChange = output<boolean>();

    /**
     * Emits event when the sidebar opened state changes.
     *
     * @deprecated Will be removed in next major release, use `openedChange` instead.
     */
    readonly stateChanged = outputFromObservable(outputToObservable(this.openedChange).pipe(distinctUntilChanged()));

    /**
     * Sidebar position.
     */
    readonly position = input.required<KbqSidebarPositions>();

    /** @docs-private */
    protected readonly animationStateValue = computed<KbqSidebarAnimationState>(() => {
        return this._opened() ? KbqSidebarAnimationState.Opened : KbqSidebarAnimationState.Closed;
    });

    /** @docs-private */
    protected readonly animationStateParams = computed<KbqSidebarAnimationParams>(() => {
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
    protected readonly state = signal<boolean>(this._opened());

    private unbindKeydownListener: ReturnType<Renderer2['listen']> | null = null;

    constructor() {
        // @TODO: should be removed after migration to `linkedSignal`
        toObservable(this.opened)
            .pipe(takeUntilDestroyed())
            .subscribe((opened) => {
                this._opened.set(opened);
            });
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
    }

    /** @docs-private */
    protected onAnimationStart(): void {
        const opened = this._opened();

        if (opened) {
            this.state.set(opened);
        }
    }

    /** @docs-private */
    protected onAnimationDone() {
        const opened = this._opened();

        this.state.set(opened);

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
            this.toggle();
        }
    }
}
