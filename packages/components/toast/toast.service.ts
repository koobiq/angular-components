import { FocusMonitor, type FocusOrigin } from '@angular/cdk/a11y';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import {
    CdkScrollable,
    FlexibleConnectedPositionStrategy,
    type GlobalPositionStrategy,
    Overlay,
    OverlayContainer,
    OverlayKeyboardDispatcher,
    type OverlayRef
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    type ComponentRef,
    type EmbeddedViewRef,
    inject,
    Injectable,
    InjectionToken,
    Injector,
    NgZone,
    type OnDestroy,
    type Signal,
    signal,
    type TemplateRef,
    type Type,
    untracked,
    viewChild,
    ViewContainerRef,
    ViewEncapsulation,
    type ViewRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    BehaviorSubject,
    distinctUntilChanged,
    EMPTY,
    filter,
    map,
    Observable,
    share,
    type Subscription,
    switchMap,
    timer
} from 'rxjs';
import { kbqInjectA11yLocaleConfiguration } from '@koobiq/components/core';
import { KbqToastComponent } from './toast.component';
import {
    KBQ_TOAST_CONFIG,
    KBQ_TOAST_STACK,
    KbqToastData,
    KbqToastPosition,
    type KbqToastStack,
    type KbqToastTemplateContext
} from './toast.type';

export const KBQ_TOAST_FACTORY = new InjectionToken('KBQ_TOAST_FACTORY', {
    factory: () => KbqToastComponent
});

const CHECK_INTERVAL = 500;

let templateId = 0;

/** `ParentNode.moveBefore()`, which TypeScript does not declare yet. */
type StatePreservingParent = ParentNode & { moveBefore?(node: Node, child: Node | null): void };

/** Where a CSS animation in a subtree had got to. */
type AnimationProgress = { target: Element | null; name: string; time: CSSNumberish | null };

const cssAnimationsIn = (element: Element): CSSAnimation[] =>
    (element.getAnimations?.({ subtree: true }) ?? []).filter(
        (animation): animation is CSSAnimation => 'animationName' in animation
    );

const targetOf = (animation: Animation): Element | null => (animation.effect as KeyframeEffect | null)?.target ?? null;

/**
 * Moves `node` right after `reference` without starting the CSS animations inside it over, as taking a node out of
 * the DOM and putting it back does: the exit animation of a leaving toast would be cancelled, and every visible toast
 * would slide in again. `moveBefore()` keeps them running; where it is missing, each restarted animation is set back
 * to the time it had reached, and one that had ended is ended again.
 */
const moveAfter = (node: Element, reference: ChildNode): void => {
    const parent = reference.parentNode as StatePreservingParent | null;

    if (parent?.moveBefore) {
        parent.moveBefore(node, reference.nextSibling);

        return;
    }

    const progress: AnimationProgress[] = cssAnimationsIn(node).map((animation) => ({
        target: targetOf(animation),
        name: animation.animationName,
        time: animation.currentTime
    }));

    reference.after(node);

    for (const animation of cssAnimationsIn(node)) {
        const reached = progress.find(
            ({ target, name }) => target === targetOf(animation) && name === animation.animationName
        );

        if (reached) {
            if (reached.time !== null) animation.currentTime = reached.time;
        } else if (animation.effect?.getComputedTiming().endTime !== Infinity) {
            animation.finish();
        }
    }
};

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
        return [...this.toastsDict.values()]
            .map(({ componentRef }) => componentRef)
            .filter((componentRef) => !componentRef.hostView.destroyed);
    }

    get templates(): EmbeddedViewRef<KbqToastTemplateContext>[] {
        return [...this.templatesDict.values()].map(({ viewRef }) => viewRef).filter((viewRef) => !viewRef.destroyed);
    }

    readonly read = new BehaviorSubject<KbqToastData | null>(null);

    private readonly _hovered = signal(false);
    private readonly _focused = signal(false);

    /** Whether at least one toast is hovered. */
    readonly hovered: Signal<boolean> = this._hovered.asReadonly();

    /** Whether at least one toast holds the focus. */
    readonly focused: Signal<boolean> = this._focused.asReadonly();

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

    /** Toasts taken off the stack that still play their exit animation in the container. */
    private readonly leaving = new Set<ComponentRef<T>>();

    // Keyed by id, in the order the toasts were created: the oldest first.
    private readonly toastsDict = new Map<number, KbqToastRecord<T>>();
    private readonly templatesDict = new Map<number, KbqToastTemplateRecord>();

    private readonly hoveredToasts = new Set<number>();
    private readonly focusedToasts = new Map<number, FocusOrigin>();
    private wasPaused = false;

    private get isPaused(): boolean {
        return this.hoveredToasts.size > 0 || this.focusedToasts.size > 0;
    }

    constructor() {
        this.timerSubscription = this.ngZone.runOutsideAngular(() => this.timer.subscribe(this.processToasts));
    }

    ngOnDestroy(): void {
        this.timerSubscription.unsubscribe();
        this.overlayRef?.dispose();
        this.overlayRef = undefined;
        this.containerInstance = undefined;
        this.portal = undefined;
        this.currentPosition = undefined;
        this.toastsDict.clear();
        this.templatesDict.clear();
        this.hoveredToasts.clear();
        this.focusedToasts.clear();
        this.stackSize.next(0);
    }

    show(
        data: KbqToastData,
        duration: number = this.toastConfig.duration,
        onTop: boolean = this.toastConfig.onTop
    ): { ref: ComponentRef<T>; id: number } {
        // Untracked, as `showTemplate()`, `hide()` and `hideTemplate()`: called from a consumer's `effect()`, the signals
        // read on the way — the container's view query, those the focus listeners read when the focus moves on to the
        // next toast — would become dependencies of the effect.
        return untracked(() => this.addToast(data, duration, onTop));
    }

    /** Body of `show()`. */
    private addToast(data: KbqToastData, duration: number, onTop: boolean): { ref: ComponentRef<T>; id: number } {
        const previouslyFocused = this.document.activeElement as HTMLElement | null;
        const container = this.prepareContainer();
        // The class generic is a hint: the runtime component is whatever `KBQ_TOAST_FACTORY` resolves to.
        const componentRef = container.createToast<T>(data, this.toastFactory as Type<T>, onTop);
        const id = componentRef.instance.id;

        if (typeof id !== 'number') {
            // The component is already rendered by now, and it never reaches the stack, so nothing else
            // would ever tear it down: every retry would strand one more element inside the overlay.
            // Detaching the view drops it from the container but leaves its host element connected, so
            // the element has to be taken out by hand as well.
            container.remove(componentRef.hostView);
            (componentRef.location.nativeElement as HTMLElement).remove();
            this.detachOverlay();

            throw new Error('KBQ_TOAST_FACTORY must provide a component extending KbqToastComponent: `id` is missing.');
        }

        this.toastsDict.set(id, { componentRef, ttl: duration, previouslyFocused });
        this.syncStackSize();

        return { ref: componentRef, id };
    }

    showTemplate(
        data: KbqToastData,
        template: TemplateRef<any>,
        duration: number = this.toastConfig.duration,
        onTop: boolean = this.toastConfig.onTop
    ): { ref: EmbeddedViewRef<KbqToastTemplateContext>; id: number } {
        return untracked(() => this.addTemplate(data, template, duration, onTop));
    }

    /** Body of `showTemplate()`. */
    private addTemplate(
        data: KbqToastData,
        template: TemplateRef<any>,
        duration: number,
        onTop: boolean
    ): { ref: EmbeddedViewRef<KbqToastTemplateContext>; id: number } {
        const container = this.prepareContainer();
        const viewRef = container.createTemplate(data, template, onTop);
        const id = templateId++;

        this.templatesDict.set(id, { viewRef, ttl: duration });
        this.syncStackSize();

        return { ref: viewRef, id };
    }

    hide(id: number) {
        untracked(() => this.removeToast(id));
    }

    /** Body of `hide()`. */
    private removeToast(id: number): void {
        const record = this.toastsDict.get(id);

        if (!record) {
            return;
        }

        // Removing the view destroys the toast, which releases its own pause state, so the focus origin has to
        // be read before that happens.
        const focusOrigin = this.focusedToasts.get(id);

        this.removeAfterExit(record.componentRef);

        this.toastsDict.delete(id);

        this.setHovered(id, false);
        this.setFocused(id, null);

        // Only a keyboard or a programmatic focus is handed on. A mouse press on the close button focuses it
        // as a side effect of the click, and moving that focus into the next toast would report the survivor
        // as focused — pausing the whole stack until something blurs it, which a pointer leaving never does.
        if (focusOrigin === 'keyboard' || focusOrigin === 'program') {
            this.restoreFocus(record.previouslyFocused, focusOrigin);
        }

        this.renewLifetimes();
        this.syncStackSize();
    }

    hideTemplate(id: number) {
        untracked(() => this.removeTemplate(id));
    }

    /** Body of `hideTemplate()`. */
    private removeTemplate(id: number): void {
        const record = this.templatesDict.get(id);

        if (!record) {
            return;
        }

        this.containerInstance?.remove(record.viewRef);

        this.templatesDict.delete(id);

        this.renewLifetimes();
        this.syncStackSize();
        this.detachOverlay();
    }

    /** Reports that the pointer entered or left the toast with the given id. @docs-private */
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

    /** Reports the origin the toast with the given id is focused with, or `null` once it is not. @docs-private */
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

        this._hovered.set(this.hoveredToasts.size > 0);
        this._focused.set(this.focusedToasts.size > 0);
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
        // Stack order, not `toastsDict` order. The dictionary is keyed by id, so `toasts` always reads
        // oldest-first, while `onTop` inserts a new toast at the top of the stack — following the dictionary
        // there would carry the focus past every toast between the one that closed and the oldest on screen.
        const inStackOrder = this.toasts
            .map(({ location }) => location.nativeElement as HTMLElement)
            .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

        for (const host of inStackOrder) {
            const closeButton = host.querySelector<HTMLElement>('[kbq-toast-close-button]');

            if (closeButton) {
                return closeButton;
            }
        }

        return null;
    }

    /** Plays the exit animation of a toast taken off the stack, then removes it from the container. */
    private removeAfterExit(componentRef: ComponentRef<T>): void {
        // Destroyed by whoever held the ref: there is nothing left to animate.
        if (componentRef.hostView.destroyed) {
            this.detachOverlay();

            return;
        }

        this.leaving.add(componentRef);
        // Also destroyed before its exit ends, by whoever holds the ref or with the overlay, which a destroyed
        // view never reports back from.
        componentRef.onDestroy(() => {
            this.leaving.delete(componentRef);
            this.detachOverlay();
        });

        componentRef.instance.leave(() => this.containerInstance?.remove(componentRef.hostView));
    }

    /** Detaching destroys the container, so it waits for the stack to empty and the last exit to end. */
    private detachOverlay(): void {
        if (this.toasts.length !== 0 || this.templates.length !== 0 || this.leaving.size !== 0) {
            return;
        }

        this.overlayRef?.detach();
    }

    private syncStackSize(): void {
        this.stackSize.next(this.toasts.length + this.templates.length);
    }

    /**
     * Drops the records whose view was destroyed from outside the service — by a consumer holding the ref,
     * or by whatever owns the surrounding view. Nothing else deletes them: a record with a `ttl` of `0` is
     * skipped by the countdown forever, so the stack would keep reporting a size and the heartbeat would
     * keep running with nothing on screen.
     */
    private purgeDestroyed(): void {
        let purged = false;

        for (const [id, { componentRef }] of this.toastsDict) {
            if (!componentRef.hostView.destroyed) {
                continue;
            }

            this.toastsDict.delete(id);
            this.setHovered(id, false);
            this.setFocused(id, null);
            purged = true;
        }

        for (const [id, { viewRef }] of this.templatesDict) {
            if (!viewRef.destroyed) {
                continue;
            }

            this.templatesDict.delete(id);
            purged = true;
        }

        if (!purged) {
            return;
        }

        this.syncStackSize();
        this.detachOverlay();
    }

    private processToasts = () => {
        this.purgeDestroyed();

        for (const [id, record] of this.toastsDict) {
            if (record.ttl <= 0) {
                continue;
            }

            record.ttl -= CHECK_INTERVAL;

            if (record.ttl <= 0) {
                this.ngZone.run(() => this.hide(id));

                return;
            }
        }

        for (const [id, record] of this.templatesDict) {
            if (record.ttl <= 0) {
                continue;
            }

            record.ttl -= CHECK_INTERVAL;

            if (record.ttl <= 0) {
                this.ngZone.run(() => this.hideTemplate(id));

                return;
            }
        }
    };

    /** Keeps every survivor on screen for at least the configured delay after a dismissal or a pause. */
    private renewLifetimes() {
        const records = [...this.toastsDict.values(), ...this.templatesDict.values()];

        for (const record of records) {
            if (record.ttl > 0) {
                record.ttl = Math.max(record.ttl, this.toastConfig.delay);
            }
        }
    }

    private prepareContainer(): KbqToastContainerComponent {
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

    /** Raises the stack above the overlays opened after it. */
    private toTop(overlayRef: OverlayRef) {
        const host = overlayRef.hostElement;
        const overlays = this.overlayContainer.getContainerElement().childNodes;
        const last = overlays[overlays.length - 1];

        // The identity check matters: `x.after(x)` is not a no-op. `after()` resolves no viable next
        // sibling for a node that is already last and falls through to `insertBefore(x, null)`, whose
        // insert steps take `x` out of its parent first — a real detach and re-attach of the wrapper
        // holding every live toast, on every `show()`.
        if (overlays.length < 2 || !last || last === host) {
            return;
        }

        // A popover host is in the top layer, painted in the order the popovers were shown in, not in DOM
        // order. Taking it out of the DOM hides the popover, which drops the stack beneath every overlay
        // there, so it is shown again instead. Its place in the DOM stays, so it is raised again on every
        // `show()` while that overlay is open.
        if (overlayRef.getConfig().usePopover && host.matches(':popover-open')) {
            host.hidePopover();
            host.showPopover();

            return;
        }

        moveAfter(host, last);
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
        // A copy, since hiding deletes from the map it walks.
        [...this.toastsDict.keys()].forEach((id) => this.hide(id));
        [...this.templatesDict.keys()].forEach((id) => this.hideTemplate(id));
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

// Declared next to the service: the service creates the container, and a container written into a template takes
// the service as its stack, so in two modules they would import each other.
@Component({
    selector: 'kbq-toast-container',
    template: '<ng-container #container />',
    styleUrl: './toast-container.component.scss',
    // A container written into a consumer's template has no stack above it — `KbqToastService` provides
    // itself only for the container it creates — so `createToast()` would leave the toast without one.
    providers: [{ provide: KBQ_TOAST_STACK, useExisting: KbqToastService }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-toast-container',
        role: 'region',
        '[attr.aria-label]': 'a11yLocaleConfiguration().toastRegion'
    }
})
export class KbqToastContainerComponent extends CdkScrollable {
    private readonly injector = inject(Injector);

    protected readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();

    readonly service = inject(KbqToastService);

    readonly viewContainer = viewChild.required('container', { read: ViewContainerRef });

    private readonly overlayKeyboardDispatcher = inject(OverlayKeyboardDispatcher);

    constructor() {
        super();

        // Toasts are ordinary flow children, so removing one slides the rest for as long as its height animates,
        // and an overlay opened from inside a toast is left behind its trigger: CDK re-measures the origin only on
        // a scroll or a viewport resize. The container's box tracks the reflow exactly. It is not reported as a
        // scroll: `ScrollDispatcher` is global, and every close-on-scroll overlay of the app would close.
        inject(SharedResizeObserver)
            .observe(this.elementRef.nativeElement)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.repositionConnectedOverlays());
    }

    createToast<C>(data: KbqToastData, componentType: Type<C>, onTop: boolean): ComponentRef<C> {
        const injector = this.getInjector(data);
        const index = onTop ? 0 : undefined;

        return this.viewContainer().createComponent(componentType, { injector, index });
    }

    createTemplate(
        data: KbqToastData,
        template: TemplateRef<any>,
        onTop: boolean
    ): EmbeddedViewRef<KbqToastTemplateContext> {
        const index = onTop ? 0 : undefined;
        const viewRef = this.viewContainer().createEmbeddedView<KbqToastTemplateContext>(
            template,
            { $implicit: data },
            index
        );

        this.markAsLiveRegion(viewRef);

        return viewRef;
    }

    remove(viewRef: ViewRef) {
        const index = this.viewContainer().indexOf(viewRef);

        if (index < 0) {
            return;
        }

        this.viewContainer().remove(index);
    }

    getInjector(data: KbqToastData): Injector {
        return Injector.create({
            providers: [{ provide: KbqToastData, useValue: data }],
            parent: this.injector
        });
    }

    /**
     * Re-applies the position of every overlay anchored to an element; one whose origin has not moved stays where it
     * is. CDK keeps no public registry of attached overlays, but its keyboard dispatcher tracks each of them.
     */
    private repositionConnectedOverlays(): void {
        // A copy: a `positionChanges` handler may detach an overlay, which splices the list being iterated.
        for (const overlayRef of this.overlayKeyboardDispatcher._attachedOverlays.slice()) {
            if (overlayRef.getConfig().positionStrategy instanceof FlexibleConnectedPositionStrategy) {
                overlayRef.updatePosition();
            }
        }
    }

    /**
     * A template toast has no component host of its own, so its first element becomes the live region — screen
     * readers announce a node inserted with `role="status"`. A template declaring its own role is left alone,
     * and one whose root is a bare text node cannot carry the attribute at all — it needs an element around it.
     */
    private markAsLiveRegion(viewRef: EmbeddedViewRef<KbqToastTemplateContext>): void {
        const root = viewRef.rootNodes.find((node) => node?.nodeType === Node.ELEMENT_NODE) as HTMLElement | undefined;

        if (!root || root.hasAttribute('role')) {
            return;
        }

        root.setAttribute('role', 'status');
        root.setAttribute('aria-atomic', 'true');
    }
}
