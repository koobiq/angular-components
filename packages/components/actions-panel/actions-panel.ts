import { ComponentType, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import {
    ComponentRef,
    EmbeddedViewRef,
    inject,
    Injectable,
    InjectionToken,
    Injector,
    OnDestroy,
    TemplateRef
} from '@angular/core';
import { KBQ_ACTIONS_PANEL_DEFAULT_CONFIG, KbqActionsPanelConfig } from './actions-panel-config';
import { KbqActionsPanelContainer } from './actions-panel-container';
import { KbqActionsPanelRef } from './actions-panel-ref';

/** Injection token that can be used to access the data that was passed in to a actions panel. */
export const KBQ_ACTIONS_PANEL_DATA = new InjectionToken('KBQ_ACTIONS_PANEL_DATA');

/**
 * Context for actions panel template.
 */
type KbqActionsPanelTemplateContext<D = unknown> = {
    /**
     * Example:
     *
     * ```html
     * <ng-template #actionsPanel let-data>...</ng-template>
     * ````
     */
    $implicit?: D | null;
    /**
     * Example:
     *
     * ```html
     * <ng-template #actionsPanel let-actionsPanelRef="actionsPanelRef">
     *   <button (click)="actionsPanelRef.close()">Close</button>
     * </ng-template>
     * ````
     */
    actionsPanelRef: KbqActionsPanelRef;
};

/**
 * Service for opening actions panel.
 */
@Injectable({ providedIn: 'root' })
export class KbqActionsPanel implements OnDestroy {
    private readonly injector = inject(Injector);
    private readonly overlay = inject(Overlay);
    private readonly defaultConfig = inject(KBQ_ACTIONS_PANEL_DEFAULT_CONFIG);
    private readonly parentActionsPanel = inject(KbqActionsPanel, { skipSelf: true, optional: true });

    /**
     * Reference to the current DI level actions panel ref.
     */
    private currentDILevelActionsPanelRef: KbqActionsPanelRef | null = null;

    /**
     * The currently opened actions panel ref of any DI level.
     *
     * @docs-private
     */
    get openedActionsPanelRef(): KbqActionsPanelRef | null {
        return this.parentActionsPanel
            ? this.parentActionsPanel.openedActionsPanelRef
            : this.currentDILevelActionsPanelRef;
    }

    set openedActionsPanelRef(value: KbqActionsPanelRef | null) {
        this.openedActionsPanelRef?.close();

        if (this.parentActionsPanel) {
            this.parentActionsPanel.openedActionsPanelRef = value;
        } else {
            this.currentDILevelActionsPanelRef = value;
        }
    }

    ngOnDestroy() {
        this.currentDILevelActionsPanelRef?.close();
    }

    /**
     * Creates a actions panel with a custom component.
     * NOTE! It will remove any currently opened actions panels.
     */
    openFromComponent<T, D = unknown>(
        component: ComponentType<T>,
        config: KbqActionsPanelConfig<D> = {}
    ): KbqActionsPanelRef<T> {
        const _config = this.makeConfig<D>(config);
        const overlayRef = this.createOverlay(_config);
        const container = this.attachContainer(overlayRef, _config);
        const actionsPanelRef = new KbqActionsPanelRef<T>(overlayRef);
        const injector = Injector.create({
            parent: _config.viewContainerRef?.injector || this.injector,
            providers: [
                { provide: KbqActionsPanelRef, useValue: actionsPanelRef },
                { provide: KBQ_ACTIONS_PANEL_DATA, useValue: _config.data }
            ]
        });
        const portal = new ComponentPortal(component, undefined, injector);
        const contentRef = container.attachComponentPortal<T>(portal);
        actionsPanelRef.instance = contentRef.instance;
        this.openedActionsPanelRef = actionsPanelRef;
        return actionsPanelRef;
    }

    /**
     * Creates actions panel with a custom template.
     * NOTE! It will remove any currently opened actions panels.
     */
    openFromTemplate<D>(
        template: TemplateRef<KbqActionsPanelTemplateContext<D>>,
        config: KbqActionsPanelConfig<D> = {}
    ): KbqActionsPanelRef<EmbeddedViewRef<KbqActionsPanelTemplateContext<D>>> {
        const _config = this.makeConfig<D>(config);
        const overlayRef = this.createOverlay(_config);
        const container = this.attachContainer(overlayRef, _config);
        const actionsPanelRef = new KbqActionsPanelRef<EmbeddedViewRef<KbqActionsPanelTemplateContext<D>>>(overlayRef);
        const portal = new TemplatePortal<KbqActionsPanelTemplateContext<D>>(template, null!, {
            $implicit: _config.data,
            actionsPanelRef
        });
        actionsPanelRef.instance = container.attachTemplatePortal(portal);
        this.openedActionsPanelRef = actionsPanelRef;
        return actionsPanelRef;
    }

    /** Makes the KbqActionsPanelConfig. */
    private makeConfig<D>(config: KbqActionsPanelConfig<D> = {}): KbqActionsPanelConfig<D> {
        return {
            ...new KbqActionsPanelConfig<D>(),
            ...(this.defaultConfig as KbqActionsPanelConfig<D>),
            ...config
        };
    }

    /** Attaches the actions panel container component to the overlay. */
    private attachContainer(overlayRef: OverlayRef, config: KbqActionsPanelConfig = {}): KbqActionsPanelContainer {
        const injector = Injector.create({
            parent: config.viewContainerRef?.injector || this.injector,
            providers: [{ provide: KbqActionsPanelConfig, useValue: config }]
        });
        const containerComponentPortal = new ComponentPortal(
            KbqActionsPanelContainer,
            config.viewContainerRef,
            injector
        );
        const { instance }: ComponentRef<KbqActionsPanelContainer> = overlayRef.attach(containerComponentPortal);
        instance.config = config;
        return instance;
    }

    /** Creates a new overlay and places it in the correct location.  */
    private createOverlay({
        overlayPanelClass: panelClass,
        closeOnNavigation: disposeOnNavigation,
        overlayConnectedTo,
        width,
        minWidth,
        maxWidth
    }: KbqActionsPanelConfig): OverlayRef {
        const position = this.overlay.position();
        const positionStrategy = overlayConnectedTo
            ? position
                  .flexibleConnectedTo(overlayConnectedTo)
                  .withPositions([{ originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'bottom' }])
            : position.global().centerHorizontally().bottom();
        const overlayConfig = new OverlayConfig({
            panelClass,
            positionStrategy,
            disposeOnNavigation,
            width,
            minWidth,
            maxWidth
        });
        return this.overlay.create(overlayConfig);
    }
}
