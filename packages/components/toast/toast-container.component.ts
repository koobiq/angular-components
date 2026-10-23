import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { CdkScrollable, FlexibleConnectedPositionStrategy, OverlayKeyboardDispatcher } from '@angular/cdk/overlay';
import {
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
    EmbeddedViewRef,
    Injector,
    TemplateRef,
    Type,
    ViewContainerRef,
    ViewEncapsulation,
    ViewRef,
    forwardRef,
    inject,
    viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { kbqInjectA11yLocaleConfiguration } from '@koobiq/components/core';
import { KbqToastService } from './toast.service';
import { KBQ_TOAST_STACK, KbqToastData, KbqToastTemplateContext } from './toast.type';

@Component({
    selector: 'kbq-toast-container',
    template: '<ng-container #container />',
    styleUrls: ['./toast-container.component.scss'],
    // A container written into a consumer's template has no stack above it — `KbqToastService` provides
    // itself only for the container it creates — so `createToast()` would leave the toast without one.
    // `forwardRef` because the service imports this file back.
    providers: [{ provide: KBQ_TOAST_STACK, useExisting: forwardRef(() => KbqToastService) }],
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
