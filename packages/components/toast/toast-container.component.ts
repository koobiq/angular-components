import { SharedResizeObserver } from '@angular/cdk/observers/private';
import {
    CdkScrollable,
    FlexibleConnectedPositionStrategy,
    OverlayKeyboardDispatcher,
    ScrollDispatcher
} from '@angular/cdk/overlay';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    EmbeddedViewRef,
    Inject,
    Injector,
    NgZone,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
    ViewRef,
    forwardRef,
    inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqToastService } from './toast.service';
import { KbqToastData } from './toast.type';

@Component({
    selector: 'kbq-toast-container',
    template: '<ng-container #container />',
    styleUrls: ['./toast-container.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-toast-container'
    }
})
export class KbqToastContainerComponent extends CdkScrollable {
    @ViewChild('container', { static: true, read: ViewContainerRef }) viewContainer: ViewContainerRef;

    private readonly overlayKeyboardDispatcher = inject(OverlayKeyboardDispatcher);

    constructor(
        private injector: Injector,
        private changeDetectorRef: ChangeDetectorRef,
        @Inject(forwardRef(() => KbqToastService)) readonly service: KbqToastService,

        elementRef: ElementRef<HTMLElement>,
        scrollDispatcher: ScrollDispatcher,
        ngZone: NgZone
    ) {
        super(elementRef, scrollDispatcher, ngZone);

        // Toasts are ordinary flow children, so removing one slides the rest for as long as its height animates,
        // and an overlay opened from inside a toast is left behind its trigger: CDK re-measures the origin only on
        // a scroll or a viewport resize. The container's box tracks the reflow exactly. It is not reported as a
        // scroll: `ScrollDispatcher` is global, and every close-on-scroll overlay of the app would close.
        inject(SharedResizeObserver)
            .observe(this.elementRef.nativeElement)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.repositionConnectedOverlays());
    }

    createToast<C>(data: KbqToastData, componentType, onTop: boolean): ComponentRef<C> {
        const injector = this.getInjector(data);
        const index = onTop ? 0 : undefined;

        this.changeDetectorRef.markForCheck();

        return this.viewContainer.createComponent(componentType, { injector, index });
    }

    createTemplate<C>(data: KbqToastData, template: TemplateRef<any>, onTop: boolean): EmbeddedViewRef<C> {
        const index = onTop ? 0 : undefined;

        return this.viewContainer.createEmbeddedView(template, { $implicit: data }, index);
    }

    remove(viewRef: ViewRef) {
        const index = this.viewContainer.indexOf(viewRef);

        if (index < 0) {
            return;
        }

        this.viewContainer.remove(index);
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
     * Fakes a scroll on the container so that overlays anchored inside a toast are repositioned by their
     * `RepositionScrollStrategy` when the stack shifts.
     *
     * @deprecated The container repositions the overlays anchored inside it on its own, so nothing calls this.
     * It is kept only for callers that already hold a container reference — the instance created by
     * `KbqToastService` is not exposed. The fake scroll also closes every close-on-scroll overlay of the app.
     */
    dispatchScrollEvent = () => {
        this.elementRef.nativeElement.dispatchEvent(new Event('scroll'));
    };
}
