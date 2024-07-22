import { AnimationEvent } from '@angular/animations';
import { GlobalPositionStrategy, Overlay, OverlayContainer, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
    ComponentRef,
    EmbeddedViewRef,
    Inject,
    Injectable,
    InjectionToken,
    Injector,
    NgZone,
    OnDestroy,
    Optional,
    TemplateRef
} from '@angular/core';
import { BehaviorSubject, Subscription, filter, shareReplay, timer } from 'rxjs';
import { KbqToastContainerComponent } from './toast-container.component';
import { KbqToastComponent } from './toast.component';
import { KBQ_TOAST_CONFIG, KbqToastConfig, KbqToastData, KbqToastPosition } from './toast.type';

export const KBQ_TOAST_FACTORY = new InjectionToken('KbqToastFactory');

export const defaultToastConfig: KbqToastConfig = {
    position: KbqToastPosition.TOP_RIGHT,
    duration: 5000,
    delay: 2000,
    onTop: false
};

const INDENT_SIZE = 0;
const CHECK_INTERVAL = 500;

let templateId = 0;

@Injectable({ providedIn: 'root' })
export class KbqToastService<T extends KbqToastComponent = KbqToastComponent> implements OnDestroy {
    get toasts(): ComponentRef<T>[] {
        return Object.values(this.toastsDict).filter((item) => !item.hostView.destroyed);
    }

    get templates(): EmbeddedViewRef<T>[] {
        return Object.values(this.templatesDict);
    }

    readonly hovered = new BehaviorSubject<boolean>(false);
    readonly focused = new BehaviorSubject<boolean>(false);
    readonly animation = new BehaviorSubject<AnimationEvent | null>(null);

    timer = timer(CHECK_INTERVAL, CHECK_INTERVAL).pipe(
        filter(() => this.toasts.length > 0 && !this.hovered.getValue() && !this.focused.getValue()),
        shareReplay()
    );

    private containerInstance: KbqToastContainerComponent;
    private overlayRef: OverlayRef;
    private portal: ComponentPortal<KbqToastContainerComponent>;
    private timerSubscription: Subscription;

    private toastsDict: { [id: number]: ComponentRef<T> } = {};
    private templatesDict: { [id: number]: EmbeddedViewRef<T> } = {};

    constructor(
        private overlay: Overlay,
        private injector: Injector,
        private overlayContainer: OverlayContainer,
        private ngZone: NgZone,
        @Inject(KBQ_TOAST_FACTORY) private toastFactory: any,
        @Optional() @Inject(KBQ_TOAST_CONFIG) private toastConfig: KbqToastConfig
    ) {
        this.toastConfig = toastConfig || defaultToastConfig;

        this.ngZone.runOutsideAngular(() => (this.timerSubscription = this.timer.subscribe(this.processToasts)));
    }

    ngOnDestroy(): void {
        this.timerSubscription.unsubscribe();
    }

    show(
        data: KbqToastData,
        duration: number = this.toastConfig.duration,
        onTop: boolean = this.toastConfig.onTop
    ): { ref: ComponentRef<T>; id: number } {
        this.prepareContainer();

        const componentRef = this.containerInstance.createToast<T>(data, this.toastFactory, onTop);

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
        this.prepareContainer();

        const viewRef = this.containerInstance.createTemplate<T>(data, template, onTop);

        this.templatesDict[templateId] = viewRef;

        this.addRemoveTimer(templateId, duration);

        templateId++;

        return { ref: viewRef, id: templateId };
    }

    hide(id: number) {
        const componentRef = this.toastsDict[id];

        if (!componentRef) {
            return;
        }

        this.containerInstance.remove(componentRef.hostView);

        delete this.toastsDict[id];

        this.detachOverlay();
    }

    hideTemplate(id: number) {
        const viewRef = this.templatesDict[id];

        if (!viewRef) {
            return;
        }

        this.containerInstance.remove(viewRef);

        delete this.templatesDict[id];

        this.detachOverlay();
    }

    private detachOverlay() {
        if (this.toasts.length !== 0) {
            return;
        }

        this.overlayRef.detach();
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

    private prepareContainer() {
        this.createOverlay();

        this.portal = this.portal || new ComponentPortal(KbqToastContainerComponent, null, this.injector);

        if (!this.overlayRef.hasAttached()) {
            this.containerInstance = this.overlayRef.attach(this.portal).instance;
        }

        this.toTop();
    }

    private toTop() {
        const overlays = this.overlayContainer.getContainerElement().childNodes;

        if (overlays.length > 1) {
            overlays[overlays.length - 1].after(this.overlayRef.hostElement);
        }
    }

    private createOverlay() {
        if (this.overlayRef) {
            return this.overlayRef;
        }

        const positionStrategy = this.getPositionStrategy(this.toastConfig.position);

        this.overlayRef = this.overlay.create({ positionStrategy });
        this.overlayRef.hostElement.classList.add('kbq-toast-overlay');
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
        return this.getGlobalOverlayPosition().top(`${INDENT_SIZE}px`).centerHorizontally();
    }

    private getTopLeft(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition().top(`${INDENT_SIZE}px`).left(`${INDENT_SIZE}px`);
    }

    private getTopRight(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition().top(`${INDENT_SIZE}px`).right(`${INDENT_SIZE}px`);
    }

    private getBottomCenter(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition().bottom(`${INDENT_SIZE}px`).centerHorizontally();
    }

    private getBottomLeft(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition().bottom(`${INDENT_SIZE}px`).left(`${INDENT_SIZE}px`);
    }

    private getBottomRight(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition().bottom(`${INDENT_SIZE}px`).right(`${INDENT_SIZE}px`);
    }

    private getCenter(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition().centerVertically().centerHorizontally();
    }

    private getGlobalOverlayPosition(): GlobalPositionStrategy {
        return this.overlay.position().global();
    }
}
