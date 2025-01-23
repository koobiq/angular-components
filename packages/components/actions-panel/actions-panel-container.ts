import { CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import {
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
    ElementRef,
    EmbeddedViewRef,
    inject,
    Renderer2,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqActionsPanelConfig } from './actions-panel-config';

@Component({
    standalone: true,
    imports: [CdkPortalOutlet],
    selector: 'kbq-actions-panel-container',
    template: `
        <ng-template cdkPortalOutlet />
    `,
    styleUrls: [
        './actions-panel-tokens.scss',
        './actions-panel-container.scss'
    ],
    host: {
        class: 'kbq-actions-panel-container'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqActionsPanelContainer {
    private readonly portalOutlet = viewChild.required(CdkPortalOutlet);
    private readonly elementRef = inject(ElementRef);
    private readonly renderer = inject(Renderer2);

    /**
     * Configuration for the actions panel container.
     *
     * @docs-private
     */
    config: KbqActionsPanelConfig;

    /**
     * Attach a component portal as content to this actions panel container.
     *
     * @docs-private
     */
    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
        this.checkPortalAttachment();
        const componentRef = this.portalOutlet().attachComponentPortal(portal);
        this.afterPortalAttached();
        return componentRef;
    }

    /**
     * Attach a template portal as content to this actions panel container.
     *
     * @docs-private
     */
    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
        this.checkPortalAttachment();
        const embeddedViewRef = this.portalOutlet().attachTemplatePortal(portal);
        this.afterPortalAttached();
        return embeddedViewRef;
    }

    /** Checks that the portal is not already attached. */
    private checkPortalAttachment(): void {
        if (this.portalOutlet().hasAttached()) {
            throw Error('[KbqActionsPanelContainer] Portal is already attached.');
        }
    }

    /** Called after the portal content has been attached. */
    private afterPortalAttached(): void {
        const { containerClass } = this.config;
        if (containerClass) {
            if (Array.isArray(containerClass)) {
                containerClass.forEach((cssClass) => this.renderer.addClass(this.elementRef.nativeElement, cssClass));
            } else {
                this.renderer.addClass(this.elementRef.nativeElement, containerClass);
            }
        }
    }
}
