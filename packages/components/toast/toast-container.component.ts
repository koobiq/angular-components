import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/overlay';
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
    forwardRef
} from '@angular/core';
import { KbqToastService } from './toast.service';
import { KbqToastData } from './toast.type';

@Component({
    standalone: true,
    selector: 'kbq-toast-container',
    template: '<ng-container #container />',
    styleUrls: ['./toast-container.component.scss'],
    host: {
        class: 'kbq-toast-container'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqToastContainerComponent extends CdkScrollable {
    @ViewChild('container', { static: true, read: ViewContainerRef }) viewContainer: ViewContainerRef;

    constructor(
        private injector: Injector,
        private changeDetectorRef: ChangeDetectorRef,
        @Inject(forwardRef(() => KbqToastService)) readonly service: KbqToastService,

        elementRef: ElementRef<HTMLElement>,
        scrollDispatcher: ScrollDispatcher,
        ngZone: NgZone
    ) {
        super(elementRef, scrollDispatcher, ngZone);

        this.service.animation.subscribe(this.dispatchScrollEvent);
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

    dispatchScrollEvent = () => {
        this.elementRef.nativeElement.dispatchEvent(new CustomEvent('scroll'));
    };
}
