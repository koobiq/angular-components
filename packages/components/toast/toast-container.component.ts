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
    ViewContainerRef,
    ViewEncapsulation,
    ViewRef,
    inject,
    viewChild
} from '@angular/core';
import { Observable, map, merge } from 'rxjs';
import { KbqToastService } from './toast.service';
import { KbqToastData } from './toast.type';

@Component({
    selector: 'kbq-toast-container',
    template: '<ng-container #container />',
    styleUrls: ['./toast-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-toast-container'
    }
})
export class KbqToastContainerComponent extends CdkScrollable {
    private injector = inject(Injector);
    private changeDetectorRef = inject(ChangeDetectorRef);
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

    createToast<C>(data: KbqToastData, componentType, onTop: boolean): ComponentRef<C> {
        const injector = this.getInjector(data);
        const index = onTop ? 0 : undefined;

        this.changeDetectorRef.markForCheck();

        return this.viewContainer().createComponent(componentType, { injector, index });
    }

    createTemplate<C>(data: KbqToastData, template: TemplateRef<any>, onTop: boolean): EmbeddedViewRef<C> {
        const index = onTop ? 0 : undefined;

        return this.viewContainer().createEmbeddedView(template, { $implicit: data }, index);
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
     * @deprecated The container reports its own reflow through `elementScrolled()`, so nothing calls this.
     * It is kept only for callers that already hold a container reference — the instance created by
     * `KbqToastService` is not exposed.
     */
    dispatchScrollEvent = () => {
        this.elementRef.nativeElement.dispatchEvent(new Event('scroll'));
    };
}
