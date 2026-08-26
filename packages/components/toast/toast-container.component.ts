import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { CdkScrollable } from '@angular/cdk/overlay';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
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
import { kbqInjectA11yLocaleConfiguration } from '@koobiq/components/core';
import { Observable, map, merge } from 'rxjs';
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
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    protected readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();

    readonly service = inject(KbqToastService);

    readonly viewContainer = viewChild.required('container', { read: ViewContainerRef });

    /**
     * Emits while the stack re-lays-out. Toasts are ordinary flow children, so removing one slides the
     * rest for as long as its height animates — and an overlay opened from inside a toast is anchored to
     * a trigger that is moving. CDK only re-measures the origin on a scroll or a viewport resize, so the
     * stack has to say when it moved.
     *
     * The container's own box tracks the reflow exactly: continuously while a leaving toast animates its
     * height away, and once for a removal that is not animated at all, such as a template toast.
     */
    private readonly reflowed: Observable<Event> = inject(SharedResizeObserver)
        .observe(this.elementRef.nativeElement)
        .pipe(map(() => new Event('scroll')));

    /**
     * `ScrollDispatcher` subscribes to this method when the container registers itself, so merging the
     * reflow signal in re-broadcasts it to every overlay that repositions on scroll — which is what
     * `kbq-select` and the dropdown trigger do by default.
     */
    override elementScrolled(): Observable<Event> {
        return merge(super.elementScrolled(), this.reflowed);
    }

    createToast<C>(data: KbqToastData, componentType: Type<C>, onTop: boolean): ComponentRef<C> {
        const injector = this.getInjector(data);
        const index = onTop ? 0 : undefined;

        // `show()` may be called from outside change detection, e.g. from a timer or an HTTP callback.
        this.changeDetectorRef.markForCheck();

        return this.viewContainer().createComponent(componentType, { injector, index });
    }

    createTemplate(
        data: KbqToastData,
        template: TemplateRef<any>,
        onTop: boolean
    ): EmbeddedViewRef<KbqToastTemplateContext> {
        const index = onTop ? 0 : undefined;

        this.changeDetectorRef.markForCheck();

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
     * Fakes a scroll on the container so that overlays anchored inside a toast are repositioned by their
     * `RepositionScrollStrategy` when the stack shifts.
     *
     * @deprecated The container reports its own reflow through `elementScrolled()`, so nothing calls this. Driving
     * it from the animation events of the stack notified the application-wide `ScrollDispatcher` on every toast
     * that merely appeared, which closed unrelated overlays using a close-on-scroll strategy. Kept only for callers
     * that already hold a container reference — the instance `KbqToastService` creates is not exposed.
     */
    dispatchScrollEvent = () => {
        this.elementRef.nativeElement.dispatchEvent(new Event('scroll'));
    };

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
