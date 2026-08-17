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
     * @deprecated The container is a registered `CdkScrollable`, so this reaches the application-wide
     * `ScrollDispatcher` and closes every unrelated overlay that uses a close-on-scroll strategy. It is no longer
     * called automatically; subscribe to `KbqToastService.animation` and call it explicitly if you need it.
     */
    dispatchScrollEvent = () => {
        this.elementRef.nativeElement.dispatchEvent(new CustomEvent('scroll'));
    };
}
