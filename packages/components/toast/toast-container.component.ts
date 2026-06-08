import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/overlay';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    EmbeddedViewRef,
    Injector,
    NgZone,
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

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);

    constructor() {
        const elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
        const scrollDispatcher = inject(ScrollDispatcher);
        const ngZone = inject(NgZone);

        super(elementRef, scrollDispatcher, ngZone);

        this.service.animation.subscribe(this.dispatchScrollEvent);
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

    dispatchScrollEvent = () => {
        this.elementRef.nativeElement.dispatchEvent(new CustomEvent('scroll'));
    };
}
