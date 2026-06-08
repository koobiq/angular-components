import { AnimationEvent } from '@angular/animations';
import { GlobalPositionStrategy, Overlay, OverlayContainer, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
    ComponentRef,
    EmbeddedViewRef,
    Injectable,
    InjectionToken,
    Injector,
    NgZone,
    OnDestroy,
    TemplateRef,
    inject
} from '@angular/core';
import { BehaviorSubject, Subscription, filter, shareReplay, timer } from 'rxjs';
import { KbqToastContainerComponent } from './toast-container.component';
import { KbqToastComponent } from './toast.component';
import { KBQ_TOAST_CONFIG, KbqToastConfig, KbqToastData, KbqToastPosition } from './toast.type';

export const KBQ_TOAST_FACTORY = new InjectionToken('KBQ_TOAST_FACTORY', {
    factory: () => KbqToastComponent
});

const CHECK_INTERVAL = 500;

let templateId = 0;

/** Generic `T` is a type hint only; the runtime component comes from `KBQ_TOAST_FACTORY`. */
@Injectable({ providedIn: 'root' })
export class KbqToastService<T extends KbqToastComponent = KbqToastComponent> implements OnDestroy {
    private overlay = inject(Overlay);
    private injector = inject(Injector);
    private overlayContainer = inject(OverlayContainer);
    private ngZone = inject(NgZone);
    private toastFactory = inject(KBQ_TOAST_FACTORY);
    private toastConfig = inject<KbqToastConfig>(KBQ_TOAST_CONFIG, { optional: true })!;

    get toasts(): ComponentRef<T>[] {
        return Object.values(this.toastsDict).filter((item) => !item.hostView.destroyed);
    }

    get templates(): EmbeddedViewRef<T>[] {
        return Object.values(this.templatesDict);
    }

    readonly read = new BehaviorSubject<KbqToastData | null>(null);
    readonly hovered = new BehaviorSubject<boolean>(false);
    readonly focused = new BehaviorSubject<boolean>(false);
    readonly animation = new BehaviorSubject<AnimationEvent | null>(null);

    timer = timer(CHECK_INTERVAL, CHECK_INTERVAL).pipe(
        filter(() => this.toasts.length > 0 && !this.hovered.getValue() && !this.focused.getValue()),
        // eslint-disable-next-line rxjs-x/no-ignored-replay-buffer
        shareReplay()
    );

    private containerInstance?: KbqToastContainerComponent;
    private overlayRef?: OverlayRef;
    private portal?: ComponentPortal<KbqToastContainerComponent>;
    private timerSubscription: Subscription;
    private currentPosition?: KbqToastPosition;

    private toastsDict: { [id: number]: ComponentRef<T> } = {};
    private templatesDict: { [id: number]: EmbeddedViewRef<T> } = {};

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);

    constructor() {
        this.ngZone.runOutsideAngular(() => {
            this.timerSubscription = this.timer.subscribe(this.processToasts);
        });
    }

    ngOnDestroy(): void {
        this.timerSubscription.unsubscribe();
        this.overlayRef?.dispose();
        this.overlayRef = undefined;
        this.containerInstance = undefined;
        this.portal = undefined;
        this.currentPosition = undefined;
        this.toastsDict = {};
        this.templatesDict = {};
    }

    show(
        data: KbqToastData,
        duration: number = this.toastConfig.duration,
        onTop: boolean = this.toastConfig.onTop
    ): { ref: ComponentRef<T>; id: number } {
        const container = this.prepareContainer();
        const componentRef = container.createToast<T>(data, this.toastFactory, onTop);

        this.toastsDict[componentRef.instance.id] = componentRef;

        componentRef.instance.ttl = duration;
        componentRef.instance.delay = this.toastConfig.delay;

        return { ref: componentRef, id: componentRef.instance.id };
    }

    showTemplate(
        data: KbqToastData,
        template: TemplateRef<any>,
        duration: number = this.toastConfig.duration,
        onTop: boolean = this.toastConfig.onTop
    ): { ref: EmbeddedViewRef<T>; id: number } {
        const container = this.prepareContainer();
        const viewRef = container.createTemplate<T>(data, template, onTop);
        const id = templateId++;

        this.templatesDict[id] = viewRef;
        this.addRemoveTimer(id, duration);

        return { ref: viewRef, id };
    }

    hide(id: number) {
        const componentRef = this.toastsDict[id];

        if (!componentRef) {
            return;
        }

        this.containerInstance?.remove(componentRef.hostView);

        delete this.toastsDict[id];

        this.detachOverlay();
    }

    hideTemplate(id: number) {
        const viewRef = this.templatesDict[id];

        if (!viewRef) {
            return;
        }

        this.containerInstance?.remove(viewRef);

        delete this.templatesDict[id];

        this.detachOverlay();
    }

    private detachOverlay() {
        if (this.toasts.length !== 0 || this.templates.length !== 0) {
            return;
        }

        this.overlayRef?.detach();
    }

    private processToasts = () => {
        for (const toast of this.toasts.filter((item) => item.instance.ttl > 0)) {
            toast.instance.ttl -= CHECK_INTERVAL;

            if (toast.instance.ttl <= 0) {
                this.ngZone.run(() => {
                    this.hide(toast.instance.id);

                    this.updateTTLAfterDelete();
                });

                break;
            }
        }
    };

    private updateTTLAfterDelete() {
        this.toasts
            .filter((item) => item.instance.ttl > 0)
            .forEach((item) => (item.instance.ttl = this.toastConfig.delay));
    }

    private addRemoveTimer(id: number, duration: number) {
        setTimeout(() => this.hideTemplate(id), duration);
    }

    private prepareContainer(): KbqToastContainerComponent {
        const overlayRef = this.createOverlay();
        const portal = this.portal || new ComponentPortal(KbqToastContainerComponent, null, this.injector);

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
            this.overlayRef.dispose();
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
