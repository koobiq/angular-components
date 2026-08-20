import { AnimationEvent } from '@angular/animations';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { GlobalPositionStrategy, Overlay, OverlayContainer, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
    ComponentRef,
    EmbeddedViewRef,
    Injectable,
    InjectionToken,
    Injector,
    NgZone,
    OnDestroy,
    TemplateRef,
    Type,
    inject
} from '@angular/core';
import {
    BehaviorSubject,
    EMPTY,
    Observable,
    Subject,
    Subscription,
    distinctUntilChanged,
    filter,
    map,
    share,
    switchMap,
    take,
    timer
} from 'rxjs';
import { KbqToastContainerComponent } from './toast-container.component';
import { KbqToastComponent } from './toast.component';
import {
    KBQ_TOAST_CONFIG,
    KBQ_TOAST_STACK,
    KbqToastData,
    KbqToastPosition,
    KbqToastStack,
    KbqToastTemplateContext
} from './toast.type';

export const KBQ_TOAST_FACTORY = new InjectionToken('KBQ_TOAST_FACTORY', {
    factory: () => KbqToastComponent
});

const CHECK_INTERVAL = 500;

/** How long the last exit animation is awaited before the overlay is detached regardless. */
const EXIT_ANIMATION_FALLBACK = 500;

let templateId = 0;

type KbqToastRecord<T> = {
    readonly componentRef: ComponentRef<T>;
    /** Remaining lifetime in ms. `0` keeps the toast on screen until it is hidden explicitly. */
    ttl: number;
    /** Element that held the focus when the toast appeared, so that focus can be handed back to it. */
    readonly previouslyFocused: HTMLElement | null;
};

type KbqToastTemplateRecord = {
    readonly viewRef: EmbeddedViewRef<KbqToastTemplateContext>;
    /** Remaining lifetime in ms. `0` keeps the template on screen until it is hidden explicitly. */
    ttl: number;
};

/** Generic `T` is a type hint only; the runtime component comes from `KBQ_TOAST_FACTORY`. */
@Injectable({ providedIn: 'root' })
export class KbqToastService<T extends KbqToastComponent = KbqToastComponent> implements OnDestroy, KbqToastStack {
    private readonly overlay = inject(Overlay);
    private readonly injector = inject(Injector);
    private readonly overlayContainer = inject(OverlayContainer);
    private readonly ngZone = inject(NgZone);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly document = inject(DOCUMENT);
    private readonly toastFactory = inject(KBQ_TOAST_FACTORY);
    private readonly toastConfig = inject(KBQ_TOAST_CONFIG);

    get toasts(): ComponentRef<T>[] {
        return Object.values(this.toastsDict)
            .map(({ componentRef }) => componentRef)
            .filter((componentRef) => !componentRef.hostView.destroyed);
    }

    get templates(): EmbeddedViewRef<KbqToastTemplateContext>[] {
        return Object.values(this.templatesDict)
            .map(({ viewRef }) => viewRef)
            .filter((viewRef) => !viewRef.destroyed);
    }

    readonly read = new BehaviorSubject<KbqToastData | null>(null);

    /** Whether at least one toast is hovered. Derived from the stack — pushing into it changes nothing. */
    readonly hovered = new BehaviorSubject<boolean>(false);

    /** Whether at least one toast holds the focus. Derived from the stack — pushing into it changes nothing. */
    readonly focused = new BehaviorSubject<boolean>(false);

    /** Animation events of every toast in the stack. */
    readonly animation = new Subject<AnimationEvent>();

    private readonly stackSize = new BehaviorSubject<number>(0);

    /** Subscribed outside Angular so that a tick never runs change detection over the whole application. */
    private readonly heartbeat = new Observable<number>((subscriber) =>
        this.ngZone.runOutsideAngular(() => timer(CHECK_INTERVAL, CHECK_INTERVAL).subscribe(subscriber))
    );

    /**
     * Countdown heartbeat: emits every 500 ms while the stack holds something and is not paused by the pointer
     * or the keyboard focus. No interval runs while the stack is empty.
     */
    readonly timer: Observable<number> = this.stackSize.pipe(
        map((size) => size > 0),
        distinctUntilChanged(),
        switchMap((filled) => (filled ? this.heartbeat : EMPTY)),
        filter(() => !this.isPaused),
        share()
    );

    private containerInstance?: KbqToastContainerComponent;
    private overlayRef?: OverlayRef;
    private portal?: ComponentPortal<KbqToastContainerComponent>;
    private timerSubscription: Subscription;
    private currentPosition?: KbqToastPosition;

    private detachSubscription?: Subscription;
    private detachTimeout?: ReturnType<typeof setTimeout>;

    private toastsDict: { [id: number]: KbqToastRecord<T> } = {};
    private templatesDict: { [id: number]: KbqToastTemplateRecord } = {};

    private readonly hoveredToasts = new Set<number>();
    private readonly focusedToasts = new Map<number, FocusOrigin>();
    private wasPaused = false;

    private get isPaused(): boolean {
        return this.hoveredToasts.size > 0 || this.focusedToasts.size > 0;
    }

    constructor() {
        this.ngZone.runOutsideAngular(() => {
            this.timerSubscription = this.timer.subscribe(this.processToasts);
        });
    }

    ngOnDestroy(): void {
        this.timerSubscription.unsubscribe();
        this.clearPendingDetach();
        this.overlayRef?.dispose();
        this.overlayRef = undefined;
        this.containerInstance = undefined;
        this.portal = undefined;
        this.currentPosition = undefined;
        this.toastsDict = {};
        this.templatesDict = {};
        this.hoveredToasts.clear();
        this.focusedToasts.clear();
        this.stackSize.next(0);
    }

    show(
        data: KbqToastData,
        duration: number = this.toastConfig.duration,
        onTop: boolean = this.toastConfig.onTop
    ): { ref: ComponentRef<T>; id: number } {
        const previouslyFocused = this.document.activeElement as HTMLElement | null;
        const container = this.prepareContainer();
        // The class generic is a hint: the runtime component is whatever `KBQ_TOAST_FACTORY` resolves to.
        const componentRef = container.createToast<T>(data, this.toastFactory as Type<T>, onTop);
        const id = componentRef.instance.id;

        if (typeof id !== 'number') {
            throw new Error('KBQ_TOAST_FACTORY must provide a component extending KbqToastComponent: `id` is missing.');
        }

        this.toastsDict[id] = { componentRef, ttl: duration, previouslyFocused };
        this.syncStackSize();

        return { ref: componentRef, id };
    }

    showTemplate(
        data: KbqToastData,
        template: TemplateRef<any>,
        duration: number = this.toastConfig.duration,
        onTop: boolean = this.toastConfig.onTop
    ): { ref: EmbeddedViewRef<KbqToastTemplateContext>; id: number } {
        const container = this.prepareContainer();
        const viewRef = container.createTemplate(data, template, onTop);
        const id = templateId++;

        this.templatesDict[id] = { viewRef, ttl: duration };
        this.syncStackSize();

        return { ref: viewRef, id };
    }

    hide(id: number) {
        const record = this.toastsDict[id];

        if (!record) {
            return;
        }

        // Removing the view destroys the toast, which releases its own pause state, so the focus origin has to
        // be read before that happens.
        const focusOrigin = this.focusedToasts.get(id);

        this.containerInstance?.remove(record.componentRef.hostView);

        delete this.toastsDict[id];

        this.setHovered(id, false);
        this.setFocused(id, null);

        if (focusOrigin !== undefined) {
            this.restoreFocus(record.previouslyFocused, focusOrigin);
        }

        this.renewLifetimes();
        this.syncStackSize();
        this.detachOverlay();
    }

    hideTemplate(id: number) {
        const record = this.templatesDict[id];

        if (!record) {
            return;
        }

        this.containerInstance?.remove(record.viewRef);

        delete this.templatesDict[id];

        this.renewLifetimes();
        this.syncStackSize();
        this.detachOverlay();
    }

    /** @docs-private Reports that the pointer entered or left the toast with the given id. */
    setHovered(id: number, hovered: boolean): void {
        if (hovered === this.hoveredToasts.has(id)) {
            return;
        }

        if (hovered) {
            this.hoveredToasts.add(id);
        } else {
            this.hoveredToasts.delete(id);
        }

        this.updatePauseState();
    }

    /** @docs-private Reports the origin the toast with the given id is focused with, or `null` once it is not. */
    setFocused(id: number, origin: FocusOrigin): void {
        if ((this.focusedToasts.get(id) ?? null) === origin) {
            return;
        }

        if (origin) {
            this.focusedToasts.set(id, origin);
        } else {
            this.focusedToasts.delete(id);
        }

        this.updatePauseState();
    }

    private updatePauseState(): void {
        const paused = this.isPaused;

        // Entering the paused state renews the countdown, so that nothing disappears the instant the pointer or
        // the focus leaves the stack.
        if (paused && !this.wasPaused) {
            this.renewLifetimes();
        }

        this.wasPaused = paused;

        this.hovered.next(this.hoveredToasts.size > 0);
        this.focused.next(this.focusedToasts.size > 0);
    }

    /** Focus must not fall back to the document body when the toast holding it goes away. */
    private restoreFocus(previouslyFocused: HTMLElement | null, origin: FocusOrigin): void {
        const target = this.getNextFocusTarget() || previouslyFocused;

        if (!target?.isConnected) {
            return;
        }

        // `focusVia` keeps the focus ring of a keyboard user, which a native `focus()` would drop.
        this.focusMonitor.focusVia(target, origin || 'program');
    }

    private getNextFocusTarget(): HTMLElement | null {
        for (const { location } of this.toasts) {
            const closeButton = (location.nativeElement as HTMLElement).querySelector<HTMLElement>(
                '[kbq-toast-close-button]'
            );

            if (closeButton) {
                return closeButton;
            }
        }

        return null;
    }

    private detachOverlay() {
        if (this.toasts.length !== 0 || this.templates.length !== 0) {
            return;
        }

        // Detaching destroys the container synchronously, i.e. before the animation engine flushes the exit
        // player of the toast that has just been removed.
        this.clearPendingDetach();

        this.detachSubscription = this.animation
            .pipe(
                filter(({ toState, phaseName }) => toState === 'void' && phaseName === 'done'),
                take(1)
            )
            .subscribe(() => this.detachNow());

        this.ngZone.runOutsideAngular(() => {
            // Template toasts emit no animation events at all, so for them this fallback is the only path.
            this.detachTimeout = setTimeout(() => this.detachNow(), EXIT_ANIMATION_FALLBACK);
        });
    }

    private detachNow(): void {
        this.clearPendingDetach();

        if (this.toasts.length === 0 && this.templates.length === 0) {
            this.overlayRef?.detach();
        }
    }

    private clearPendingDetach(): void {
        this.detachSubscription?.unsubscribe();
        this.detachSubscription = undefined;

        if (this.detachTimeout !== undefined) {
            clearTimeout(this.detachTimeout);
            this.detachTimeout = undefined;
        }
    }

    private syncStackSize(): void {
        this.stackSize.next(this.toasts.length + this.templates.length);
    }

    private processToasts = () => {
        for (const [id, record] of Object.entries(this.toastsDict)) {
            if (record.ttl <= 0) {
                continue;
            }

            record.ttl -= CHECK_INTERVAL;

            if (record.ttl <= 0) {
                this.ngZone.run(() => this.hide(+id));

                return;
            }
        }

        for (const [id, record] of Object.entries(this.templatesDict)) {
            if (record.ttl <= 0) {
                continue;
            }

            record.ttl -= CHECK_INTERVAL;

            if (record.ttl <= 0) {
                this.ngZone.run(() => this.hideTemplate(+id));

                return;
            }
        }
    };

    /** Keeps every survivor on screen for at least the configured delay after a dismissal or a pause. */
    private renewLifetimes() {
        const records = [...Object.values(this.toastsDict), ...Object.values(this.templatesDict)];

        for (const record of records) {
            if (record.ttl > 0) {
                record.ttl = Math.max(record.ttl, this.toastConfig.delay);
            }
        }
    }

    private prepareContainer(): KbqToastContainerComponent {
        this.clearPendingDetach();

        const overlayRef = this.createOverlay();
        const portal = this.portal || new ComponentPortal(KbqToastContainerComponent, null, this.createStackInjector());

        this.portal = portal;

        if (!overlayRef.hasAttached()) {
            this.containerInstance = overlayRef.attach(portal).instance;
            this.containerInstance
                .getElementRef()
                .nativeElement.classList.add(`kbq-toast-container-${this.toastConfig.position}`);
        }

        this.toTop(overlayRef);

        return this.containerInstance!;
    }

    /** Every toast resolves its stack through the container, so that it never depends on this service. */
    private createStackInjector(): Injector {
        return Injector.create({
            providers: [{ provide: KBQ_TOAST_STACK, useValue: this }],
            parent: this.injector
        });
    }

    private toTop(overlayRef: OverlayRef) {
        const overlays = this.overlayContainer.getContainerElement().childNodes;

        if (overlays.length > 1) {
            overlays[overlays.length - 1].after(overlayRef.hostElement);
        }
    }

    private createOverlay(): OverlayRef {
        const expectedPosition = this.toastConfig.position;

        if (this.overlayRef && this.currentPosition === expectedPosition) {
            return this.overlayRef;
        }

        if (this.overlayRef) {
            // Nothing survives the overlay it lives in, so the stack is drained through the regular paths
            // instead of leaving both dictionaries pointing at destroyed views.
            this.clear();
            this.clearPendingDetach();

            this.overlayRef.dispose();
            this.overlayRef = undefined;
            this.containerInstance = undefined;
            this.portal = undefined;
        }

        const positionStrategy = this.getPositionStrategy(expectedPosition);
        const overlayRef = this.overlay.create({ positionStrategy });

        overlayRef.hostElement.classList.add('kbq-toast-overlay');

        this.overlayRef = overlayRef;
        this.currentPosition = expectedPosition;

        return overlayRef;
    }

    private clear(): void {
        Object.keys(this.toastsDict).forEach((id) => this.hide(+id));
        Object.keys(this.templatesDict).forEach((id) => this.hideTemplate(+id));
    }

    private getPositionStrategy(position?: KbqToastPosition): GlobalPositionStrategy {
        switch (position) {
            case KbqToastPosition.CENTER:
                return this.getCenter();
            case KbqToastPosition.BOTTOM_CENTER:
                return this.getBottomCenter();
            case KbqToastPosition.BOTTOM_LEFT:
                return this.getBottomLeft();
            case KbqToastPosition.BOTTOM_RIGHT:
                return this.getBottomRight();
            case KbqToastPosition.TOP_CENTER:
                return this.getTopCenter();
            case KbqToastPosition.TOP_LEFT:
                return this.getTopLeft();
            case KbqToastPosition.TOP_RIGHT:
                return this.getTopRight();
            default:
                return this.getTopCenter();
        }
    }

    private getTopCenter(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition().top(`${this.toastConfig.indent.vertical}px`).centerHorizontally();
    }

    private getTopLeft(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .top(`${this.toastConfig.indent.vertical}px`)
            .left(`${this.toastConfig.indent.horizontal}px`);
    }

    private getTopRight(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .top(`${this.toastConfig.indent.vertical}px`)
            .right(`${this.toastConfig.indent.horizontal}px`);
    }

    private getBottomCenter(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition().bottom(`${this.toastConfig.indent.vertical}px`).centerHorizontally();
    }

    private getBottomLeft(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .bottom(`${this.toastConfig.indent.vertical}px`)
            .left(`${this.toastConfig.indent.horizontal}px`);
    }

    private getBottomRight(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .bottom(`${this.toastConfig.indent.vertical}px`)
            .right(`${this.toastConfig.indent.horizontal}px`);
    }

    private getCenter(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition().centerVertically().centerHorizontally();
    }

    private getGlobalOverlayPosition(): GlobalPositionStrategy {
        return this.overlay.position().global();
    }
}
