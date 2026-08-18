import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/overlay';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    DestroyRef,
    ElementRef,
    EmbeddedViewRef,
    inject,
    Injector,
    NgZone,
    TemplateRef,
    viewChild,
    ViewContainerRef,
    ViewEncapsulation,
    ViewRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge, Observable, Subject } from 'rxjs';
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
     */
    private readonly reflowed = new Subject<Event>();

    constructor() {
        const elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
        const scrollDispatcher = inject(ScrollDispatcher);
        const ngZone = inject(NgZone);

        super(elementRef, scrollDispatcher, ngZone);

        // The container's height tracks the reflow exactly: continuously while a leaving toast animates
        // its height away, and once for a removal that is not animated at all, such as a template toast.
        inject(SharedResizeObserver)
            .observe(elementRef.nativeElement)
            .pipe(takeUntilDestroyed(inject(DestroyRef)))
            .subscribe(() => this.reflowed.next(new Event('scroll')));
    }

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
     * Fires a `scroll` event on the container so that overlays repositioning on scroll re-measure.
     *
     * @deprecated The container reports its own reflow through `elementScrolled()` now, so nothing
     *     calls this. Kept because it is part of the public surface.
     */
    dispatchScrollEvent = () => {
        this.elementRef.nativeElement.dispatchEvent(new CustomEvent('scroll'));
    };
}
