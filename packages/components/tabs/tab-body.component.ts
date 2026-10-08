import { Direction, Directionality } from '@angular/cdk/bidi';
import { CdkPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import {
    afterNextRender,
    AfterRenderRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    DestroyRef,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    inject,
    Injector,
    input,
    OnChanges,
    OnDestroy,
    OnInit,
    output,
    SimpleChanges,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { kbqAnimationsDisabled, kbqAnimationsSettled } from '@koobiq/components/core';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

/**
 * These position states are used internally as the translation states of the tab body. Setting the
 * position state to left, right, or center will transition the tab body from its current
 * position to its respective state. If there is not current position (void, in the case of a new
 * tab body), then there will be no transition to its state.
 *
 * In the case of a new tab body that should immediately be centered with an animating transition,
 * then left-origin-center or right-origin-center can be used, which will use left or right as its
 * pseudo-prior state.
 */
export type KbqTabBodyPositionState = 'left' | 'center' | 'right' | 'left-origin-center' | 'right-origin-center';

/**
 * The origin state is an internally used state that is set on a new tab body indicating if it
 * began to the left or right of the prior selected index. For example, if the selected index was
 * set to 1, and a new tab is created and selected at index 2, then the tab body would have an
 * origin of right because its index was greater than the prior selected index.
 */
export type KbqTabBodyOriginState = 'left' | 'right';

/**
 * Wrapper for the contents of a tab.
 * @docs-private
 */
@Component({
    selector: 'kbq-tab-body',
    imports: [KbqScrollbarViewport, forwardRef(() => KbqTabBodyPortal)],
    templateUrl: './tab-body.html',
    styleUrl: './tab-body.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-tab-body'
    }
})
export class KbqTabBody implements OnChanges, OnInit, OnDestroy {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly dir = inject(Directionality, { optional: true });
    private readonly destroyRef = inject(DestroyRef);
    private readonly injector = inject(Injector);

    /** Whether the tab body translates without motion. */
    protected readonly animationsDisabled = kbqAnimationsDisabled();

    /** @docs-private */
    readonly positionInput = input<number | undefined>(undefined, { alias: 'position' });

    /** @docs-private */
    readonly originInput = input<number | undefined>(undefined, { alias: 'origin' });

    /** The shifted index position of the tab body, where zero represents the active center tab. */
    set position(position: number) {
        this.positionIndex = position;
        this.computePositionAnimationState();
    }

    /** Tab body position state, rendered as a modifier class of the content. */
    bodyPosition: KbqTabBodyPositionState;

    /** Event emitted when the tab begins to animate towards the center as the active tab. */
    readonly onCentering = output<number>();

    /** Event emitted before the centering of the tab begins. */
    readonly beforeCentering: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** @docs-private */
    readonly beforeCenteringOutput = outputFromObservable(this.beforeCentering, { alias: 'beforeCentering' });

    /** Event emitted before the centering of the tab begins. */
    readonly afterLeavingCenter: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** @docs-private */
    readonly afterLeavingCenterOutput = outputFromObservable(this.afterLeavingCenter, { alias: 'afterLeavingCenter' });

    /** Event emitted when the tab completes its animation towards the center. */
    readonly onCentered = output<void>();

    /** The portal host inside of this container into which the tab body content will be loaded. */
    readonly portalHost = viewChild.required(CdkPortalOutlet);

    /** The tab body content to display. */
    readonly content = input<TemplatePortal>(undefined!);

    /** Position that will be used when the tab is immediately becoming visible after creation. */
    origin: number;

    /** Duration for the tab's animation. */
    readonly animationDuration = input<string>('0ms');

    /** The duration as CSS: a bare number is in milliseconds, as the former animation trigger read it. */
    protected readonly cssAnimationDuration = computed(() => {
        const duration = this.animationDuration();

        return /^\d+$/.test(duration) ? `${duration}ms` : duration;
    });

    /** Current position of the tab-body in the tab-group. Zero means that the tab is visible. */
    private positionIndex: number;

    /** Subscription to the directionality change observable. */
    private readonly dirChangeSubscription = Subscription.EMPTY;

    private readonly contentElement = viewChild.required('content', { read: ElementRef });

    /** The position the last translation went to, see `translateOnRender`. */
    private renderedPosition?: KbqTabBodyPositionState;

    private translationRender?: AfterRenderRef;

    constructor() {
        const changeDetectorRef = inject(ChangeDetectorRef);

        if (this.dir && changeDetectorRef) {
            this.dirChangeSubscription = this.dir.change.subscribe((direction: Direction) => {
                this.computePositionAnimationState(direction);
                changeDetectorRef.markForCheck();
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        // A bound input is handed to its member as the decorator input did; unbound, it leaves what code wrote.
        if (changes['positionInput']) {
            const position = this.positionInput();

            if (position !== undefined) this.position = position;
        }

        if (changes['originInput']) {
            const origin = this.originInput();

            if (origin !== undefined) this.origin = origin;
        }
    }

    /**
     * After initialized, check if the content is centered and has an origin. If so, set the
     * special position states that transition the tab from the left or right before centering.
     */
    ngOnInit() {
        if (this.bodyPosition === 'center' && this.origin != null) {
            this.bodyPosition = this.computePositionFromOrigin();
        }

        this.translateOnRender();
    }

    ngOnDestroy() {
        this.dirChangeSubscription.unsubscribe();
    }

    /** The text direction of the containing app. */
    getLayoutDirection(): Direction {
        return this.dir && this.dir.value === 'rtl' ? 'rtl' : 'ltr';
    }

    /** Whether the provided position state is considered center, regardless of origin. */
    isCenterPosition(position: KbqTabBodyPositionState | string): boolean {
        return position === 'center' || position === 'left-origin-center' || position === 'right-origin-center';
    }

    /** Computes the position state that the tab body translates to. */
    private computePositionAnimationState(dir: Direction = this.getLayoutDirection()) {
        if (this.positionIndex < 0) {
            this.bodyPosition = dir === 'ltr' ? 'left' : 'right';
        } else if (this.positionIndex > 0) {
            this.bodyPosition = dir === 'ltr' ? 'right' : 'left';
        } else {
            this.bodyPosition = 'center';
        }

        this.translateOnRender();
    }

    /**
     * Starts the translation to the current position once it has rendered, and ends it once its transition
     * has: the content is attached as the body starts centering and detached once it has left the center.
     * Positions set within one frame translate once, from the last rendered one.
     */
    private translateOnRender(): void {
        if (this.translationRender) return;

        this.translationRender = afterNextRender(
            () => {
                this.translationRender = undefined;

                const from = this.renderedPosition;
                const to = this.bodyPosition;

                if (from === to) return;

                this.renderedPosition = to;
                this.translationStarted(to);

                const settled = kbqAnimationsSettled(this.contentElement().nativeElement);

                if (!settled) return this.translationDone(from, to);

                settled.then(() => {
                    if (!this.destroyRef.destroyed) this.translationDone(from, to);
                });
            },
            { injector: this.injector }
        );
    }

    private translationStarted(to: KbqTabBodyPositionState): void {
        const isCentering = this.isCenterPosition(to);

        this.beforeCentering.emit(isCentering);

        if (isCentering) {
            this.onCentering.emit(this.elementRef.nativeElement.clientHeight);
        }
    }

    private translationDone(from: KbqTabBodyPositionState | undefined, to: KbqTabBodyPositionState): void {
        // A later translation may have started since, so the current position has the last word.
        if (this.isCenterPosition(to) && this.isCenterPosition(this.bodyPosition)) {
            this.onCentered.emit();
        }

        if (from !== undefined && this.isCenterPosition(from) && !this.isCenterPosition(this.bodyPosition)) {
            this.afterLeavingCenter.emit();
        }
    }

    /**
     * Computes the position state based on the specified origin position. This is used if the
     * tab is becoming visible immediately after creation.
     */
    private computePositionFromOrigin(): KbqTabBodyPositionState {
        const dir = this.getLayoutDirection();

        if ((dir === 'ltr' && this.origin <= 0) || (dir === 'rtl' && this.origin > 0)) {
            return 'left-origin-center';
        }

        return 'right-origin-center';
    }
}

/**
 * The portal host directive for the contents of the tab.
 * @docs-private
 */
@Directive({
    selector: '[kbqTabBodyHost]'
})
export class KbqTabBodyPortal extends CdkPortalOutlet implements OnInit, OnDestroy {
    private readonly host = inject(KbqTabBody);

    /** Subscription to events for when the tab body begins centering. */
    private centeringSub = Subscription.EMPTY;
    /** Subscription to events for when the tab body finishes leaving from center position. */
    private leavingSub = Subscription.EMPTY;

    /** Set initial visibility or set up subscription for changing visibility. */
    ngOnInit(): void {
        super.ngOnInit();

        this.centeringSub = this.host.beforeCentering
            .pipe(startWith(this.host.isCenterPosition(this.host.bodyPosition)))
            .subscribe((isCentering: boolean) => {
                if (isCentering && !this.hasAttached()) {
                    this.attach(this.host.content());
                }
            });

        this.leavingSub = this.host.afterLeavingCenter.subscribe(() => {
            this.detach();
        });
    }

    /** Clean up centering subscription. */
    ngOnDestroy(): void {
        super.ngOnDestroy();

        this.centeringSub.unsubscribe();
        this.leavingSub.unsubscribe();
    }
}
