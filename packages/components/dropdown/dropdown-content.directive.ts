import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
    ApplicationRef,
    ComponentFactoryResolver,
    Directive,
    inject,
    Injector,
    OnDestroy,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Dropdown content that will be rendered lazily once the dropdown is opened.
 */
@Directive({
    selector: 'ng-template[kbqDropdownContent]'
})
export class KbqDropdownContent implements OnDestroy {
    protected readonly document = inject<Document>(DOCUMENT);

    /** Emits when the dropdown content has been attached. */
    attached = new Subject<void>();
    private portal: TemplatePortal;
    private outlet: DomPortalOutlet;

    constructor(
        private template: TemplateRef<any>,
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector,
        private viewContainerRef: ViewContainerRef
    ) {}

    /**
     * Attaches the content with a particular context.
     * @docs-private
     */
    attach(context: any = {}) {
        if (!this.portal) {
            this.portal = new TemplatePortal(this.template, this.viewContainerRef);
        }

        this.detach();

        if (!this.outlet) {
            this.outlet = new DomPortalOutlet(
                this.document.createElement('div'),
                this.componentFactoryResolver,
                this.appRef,
                this.injector
            );
        }

        const element: HTMLElement = this.template.elementRef.nativeElement;

        // Because we support opening the same dropdown from different triggers (which in turn have their
        // own `OverlayRef` panel), we have to re-insert the host element every time, otherwise we
        // risk it staying attached to a pane that's no longer in the DOM.
        element.parentNode!.insertBefore(this.outlet.outletElement, element);
        this.portal.attach(this.outlet, context);
        this.attached.next();
    }

    /**
     * Detaches the content.
     * @docs-private
     */
    detach() {
        if (this.portal?.isAttached) {
            this.portal.detach();
        }
    }

    ngOnDestroy() {
        this.outlet?.dispose();
    }
}
