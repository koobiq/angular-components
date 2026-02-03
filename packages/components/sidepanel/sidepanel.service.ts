import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, TemplatePortal } from '@angular/cdk/portal';
import {
    ComponentRef,
    Inject,
    Injectable,
    InjectionToken,
    Injector,
    OnDestroy,
    Optional,
    SkipSelf,
    TemplateRef
} from '@angular/core';
import { KBQ_SIDEPANEL_DATA, KbqSidepanelConfig } from './sidepanel-config';
import {
    KBQ_SIDEPANEL_WITH_INDENT,
    KBQ_SIDEPANEL_WITH_SHADOW,
    KbqSidepanelContainerComponent
} from './sidepanel-container.component';
import { KbqSidepanelRef } from './sidepanel-ref';

/** Injection token that can be used to specify default sidepanel options. */
export const KBQ_SIDEPANEL_DEFAULT_OPTIONS = new InjectionToken<KbqSidepanelConfig>('kbq-sidepanel-default-options');

@Injectable()
export class KbqSidepanelService implements OnDestroy {
    private openedSidepanelsAtThisLevel: KbqSidepanelRef[] = [];

    /** Keeps track of the currently-open sidepanels. */
    get openedSidepanels(): KbqSidepanelRef[] {
        return this.parentSidepanelService
            ? this.parentSidepanelService.openedSidepanels
            : this.openedSidepanelsAtThisLevel;
    }

    constructor(
        private overlay: Overlay,
        private injector: Injector,
        @Optional() @Inject(KBQ_SIDEPANEL_DEFAULT_OPTIONS) private defaultOptions: KbqSidepanelConfig,
        @Optional() @SkipSelf() private parentSidepanelService: KbqSidepanelService
    ) {}

    ngOnDestroy() {
        // Only close the sidepanels at this level on destroy
        // since the parent service may still be active.
        this.closeSidepanels(this.openedSidepanelsAtThisLevel);
    }

    open<T, D = any>(
        componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
        config?: KbqSidepanelConfig<D>
    ): KbqSidepanelRef<T> {
        const fullConfig = {
            ...(this.defaultOptions || new KbqSidepanelConfig()),
            ...config
        };

        if (fullConfig.id && this.getSidepanelById(fullConfig.id)) {
            throw Error(`Sidepanel with id "${fullConfig.id}" exists already. The sidepanel id must be unique.`);
        }

        const overlayRef = this.createOverlay(fullConfig);

        overlayRef.hostElement.classList.add('kbq-sidepanel-overlay');
        const container = this.attachContainer(overlayRef, fullConfig);
        const ref = new KbqSidepanelRef(container, overlayRef, fullConfig);

        if (componentOrTemplateRef instanceof TemplateRef) {
            container.attachTemplatePortal(
                new TemplatePortal<T>(componentOrTemplateRef, null!, {
                    $implicit: fullConfig.data,
                    sidepanelRef: ref
                } as any)
            );
        } else {
            const portal = new ComponentPortal(
                componentOrTemplateRef,
                undefined,
                this.createInjector(fullConfig, ref, container)
            );
            const contentRef = container.attachComponentPortal(portal);

            ref.instance = contentRef.instance;
        }

        this.openedSidepanels.push(ref);
        ref.afterClosed().subscribe(() => this.removeOpenSidepanel(ref));

        container.enter();

        return ref;
    }

    /**
     * Closes all of the currently-open sidepanels.
     */
    closeAll(): void {
        this.closeSidepanels(this.openedSidepanels);
    }

    /**
     * Finds an open sidepanel by its id.
     * @param id ID to use when looking up the sidepanel.
     */
    getSidepanelById(id: string): KbqSidepanelRef | undefined {
        return this.openedSidepanels.find((sidepanel) => sidepanel.id === id);
    }

    /**
     * Attaches the sidepanel container component to the overlay.
     */
    private attachContainer(overlayRef: OverlayRef, config: KbqSidepanelConfig): KbqSidepanelContainerComponent {
        const openedSidepanelsWithSamePosition = this.getOpenedSidepanelsWithSamePosition(config);

        const lower = openedSidepanelsWithSamePosition[openedSidepanelsWithSamePosition.length - 1];
        const bottom = openedSidepanelsWithSamePosition[openedSidepanelsWithSamePosition.length - 2];

        if (lower) {
            lower.containerInstance.placement.set('lower');
        }

        if (bottom) {
            bottom.containerInstance.placement.set('bottom-panel');
        }

        const injector = Injector.create({
            parent: this.injector,
            providers: [
                { provide: KbqSidepanelConfig, useValue: config },
                { provide: KBQ_SIDEPANEL_WITH_INDENT, useValue: false },
                { provide: KBQ_SIDEPANEL_WITH_SHADOW, useValue: true }
            ]
        });

        const containerPortal = new ComponentPortal(KbqSidepanelContainerComponent, undefined, injector);
        const containerRef: ComponentRef<KbqSidepanelContainerComponent> = overlayRef.attach(containerPortal);

        return containerRef.instance;
    }

    /**
     * Creates a custom injector to be used inside the sidepanel. This allows a component loaded inside
     * of a sidepanel to close itself and, optionally, to return a value.
     * @param config Config object that is used to construct the sidepanel.
     * @param sidepanelRef Reference to the sidepanel.
     * @param sidepanelContainer Sidepanel container element that wraps all of the contents.
     * @returns The custom injector that can be used inside the sidepanel.
     */
    private createInjector<T>(
        config: KbqSidepanelConfig,
        sidepanelRef: KbqSidepanelRef<T>,
        sidepanelContainer: KbqSidepanelContainerComponent
    ): Injector {
        // The KbqSidepanelContainerComponent is injected in the portal as the KbqSidepanelContainerComponent and
        // the sidepanel's content are created out of the same ViewContainerRef and as such, are siblings for injector
        // purposes. To allow the hierarchy that is expected, the KbqSidepanelContainerComponent is explicitly
        // added to the injection tokens.

        return Injector.create({
            parent: this.injector,
            providers: [
                { provide: KbqSidepanelContainerComponent, useValue: sidepanelContainer },
                { provide: KBQ_SIDEPANEL_DATA, useValue: config.data },
                { provide: KbqSidepanelRef, useValue: sidepanelRef }
            ]
        });
    }

    /**
     * Creates a new overlay and places it in the correct location.
     * @param config The user-specified sidepanel config.
     */
    private createOverlay(config: KbqSidepanelConfig): OverlayRef {
        const overlayConfig = new OverlayConfig({
            hasBackdrop: config.hasBackdrop,
            backdropClass: this.getBackdropClass(config),
            maxWidth: '100%',
            panelClass: config.overlayPanelClass,
            scrollStrategy: this.overlay.scrollStrategies.block(),
            positionStrategy: this.overlay.position().global()
        });

        return this.overlay.create(overlayConfig);
    }

    // private getPositionStrategy(position?: KbqSidepanelPosition): GlobalPositionStrategy {
    //     const strategy = this.overlay.position().global();
    //
    //     switch (position) {
    //         case 'left': {
    //             return strategy.left('0');
    //         }
    //         case 'top': {
    //             return strategy.top('0').width('100%');
    //         }
    //         case 'bottom': {
    //             return strategy.bottom('0').width('100%');
    //         }
    //         case 'right':
    //         default: {
    //             return strategy.end('0');
    //         }
    //     }
    // }

    private closeSidepanels(sidepanels: KbqSidepanelRef[]) {
        const reversedOpenedSidepanels = [...sidepanels.reverse()];

        reversedOpenedSidepanels.forEach((sidepanelRef: KbqSidepanelRef) => sidepanelRef.close());
    }

    private getBackdropClass(config: KbqSidepanelConfig): string | string[] {
        if (config.hasBackdrop && config.backdropClass) {
            return config.backdropClass;
        }

        // const hasOpenedSidepanelWithBackdrop = this.openedSidepanels.some(
        //     (sidepanelRef) => sidepanelRef.config.hasBackdrop!
        // );

        return ['kbq-overlay-dark-backdrop', 'kbq-overlay-backdrop'];
    }

    private getOpenedSidepanelsWithSamePosition(config: KbqSidepanelConfig): KbqSidepanelRef[] {
        return this.openedSidepanels.filter((sidepanelRef) => sidepanelRef.config.position === config.position);
    }

    /**
     * Removes a sidepanel from the array of open sidepanels.
     * @param sidepanelRef Sidepanel to be removed.
     */
    private removeOpenSidepanel(sidepanelRef: KbqSidepanelRef) {
        const index = this.openedSidepanels.indexOf(sidepanelRef);

        if (index > -1) {
            this.openedSidepanels.splice(index, 1);

            const lower = this.openedSidepanels[this.openedSidepanels.length - 1];
            const bottom = this.openedSidepanels[this.openedSidepanels.length - 2];

            if (lower) {
                lower.containerInstance.placement.set('');
            }

            if (bottom) {
                bottom.containerInstance.placement.set('lower');
            }
        }
    }
}
