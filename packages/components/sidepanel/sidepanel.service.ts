import { Overlay, OverlayConfig, OverlayContainer, OverlayRef, ScrollStrategy } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, TemplatePortal } from '@angular/cdk/portal';
import { ComponentRef, Injectable, InjectionToken, Injector, OnDestroy, TemplateRef, inject } from '@angular/core';
import { KbqSidepanelAnimationState } from './sidepanel-animations';
import { KBQ_SIDEPANEL_DATA, KbqSidepanelConfig } from './sidepanel-config';
import { KBQ_SIDEPANEL_WITH_INDENT, KbqSidepanelContainerComponent } from './sidepanel-container.component';
import { KbqSidepanelRef } from './sidepanel-ref';

/** Injection token that can be used to specify default sidepanel options. */
export const KBQ_SIDEPANEL_DEFAULT_OPTIONS = new InjectionToken<KbqSidepanelConfig>('kbq-sidepanel-default-options');

/** Context of a sidepanel opened from a `TemplateRef`. */
type KbqSidepanelTemplateContext<T, D> = {
    $implicit: D | null | undefined;
    sidepanelRef: KbqSidepanelRef<T>;
};

/** Copies the entries that carry a value, so an unset optional does not overwrite a default with `undefined`. */
const assignDefined = <T extends object>(target: T, source: T | null | undefined): void => {
    if (!source) return;

    for (const key of Object.keys(source) as (keyof T)[]) {
        if (source[key] !== undefined) {
            target[key] = source[key];
        }
    }
};

@Injectable({ providedIn: 'root' })
export class KbqSidepanelService implements OnDestroy {
    private overlay = inject(Overlay);
    private overlayContainer = inject(OverlayContainer);
    private injector = inject(Injector);
    private defaultOptions = inject<KbqSidepanelConfig>(KBQ_SIDEPANEL_DEFAULT_OPTIONS, { optional: true });
    private parentSidepanelService = inject(KbqSidepanelService, { optional: true, skipSelf: true });

    /** Sidepanels opened through this very instance, closed when this injector level is destroyed. */
    private readonly openedSidepanelsAtThisLevel: KbqSidepanelRef[] = [];

    /** The shared stack. Only the root-most instance ever holds it; the rest reach it through the getter. */
    private readonly rootOpenedSidepanels: KbqSidepanelRef[] = [];

    /** Sidepanels that hid the rest of the page from assistive technology when they opened. */
    private readonly modalSidepanels = new Set<KbqSidepanelRef>();

    /** Elements outside the overlay container that were hidden from assistive technology, and their previous state. */
    private readonly ariaHiddenElements = new Map<Element, string | null>();

    /** Keeps track of the currently-open sidepanels. */
    get openedSidepanels(): KbqSidepanelRef[] {
        return this.parentSidepanelService ? this.parentSidepanelService.openedSidepanels : this.rootOpenedSidepanels;
    }

    /** The instance holding the shared stack and the assistive-technology bookkeeping. */
    private get rootService(): KbqSidepanelService {
        return this.parentSidepanelService?.rootService ?? this;
    }

    ngOnDestroy() {
        // Only close the sidepanels opened at this level on destroy,
        // since the parent service may still be active.
        this.closeSidepanels(this.openedSidepanelsAtThisLevel);
        this.rootService.restoreContentForAssistiveTechnology();
    }

    open<T, D = any>(
        componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
        config?: KbqSidepanelConfig<D>
    ): KbqSidepanelRef<T> {
        const fullConfig = new KbqSidepanelConfig<D>();

        assignDefined(fullConfig, this.defaultOptions);
        assignDefined(fullConfig, config);

        if (fullConfig.id && this.getSidepanelById(fullConfig.id)) {
            throw Error(`Sidepanel with id "${fullConfig.id}" exists already. The sidepanel id must be unique.`);
        }

        const overlayRef = this.createOverlay(fullConfig);
        const container = this.attachContainer(overlayRef, fullConfig);
        const ref = new KbqSidepanelRef<T>(container, overlayRef, fullConfig);

        if (componentOrTemplateRef instanceof TemplateRef) {
            container.attachTemplatePortal(
                new TemplatePortal<KbqSidepanelTemplateContext<T, D>>(
                    componentOrTemplateRef as TemplateRef<KbqSidepanelTemplateContext<T, D>>,
                    null!,
                    { $implicit: fullConfig.data, sidepanelRef: ref },
                    this.createInjector(fullConfig, ref, container)
                )
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
        this.openedSidepanelsAtThisLevel.push(ref);

        if (fullConfig.trapFocus ?? !!fullConfig.hasBackdrop) {
            this.rootService.hideContentFromAssistiveTechnology(ref);
        }

        ref.beforeClosed().subscribe(() => this.updateAnimationState(ref));
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

        lower?.containerInstance.setAnimationState(KbqSidepanelAnimationState.Lower);
        bottom?.containerInstance.setAnimationState(KbqSidepanelAnimationState.BottomPanel);

        const injector = Injector.create({
            parent: this.injector,
            providers: [
                { provide: KbqSidepanelConfig, useValue: config },
                { provide: KBQ_SIDEPANEL_WITH_INDENT, useValue: openedSidepanelsWithSamePosition.length >= 1 }
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
            parent: config.injector ?? this.injector,
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
            backdropClass: '',
            maxWidth: '100%',
            panelClass: config.overlayPanelClass,
            scrollStrategy: this.resolveScrollStrategy(config),
            positionStrategy: this.overlay.position().global()
        });

        return this.overlay.create(overlayConfig);
    }

    /**
     * `block()` pins the document with `position: fixed`, which is exactly what the non-modal mode
     * promises not to do, so only a backdropped sidepanel gets it.
     */
    private resolveScrollStrategy(config: KbqSidepanelConfig): ScrollStrategy {
        if (config.scrollStrategy) return config.scrollStrategy();

        return config.hasBackdrop ? this.overlay.scrollStrategies.block() : this.overlay.scrollStrategies.reposition();
    }

    /**
     * `BlockScrollStrategy` refuses to engage while the page is already blocked, so in a stack only the
     * bottom sidepanel ever owns the block — and closing it released the page under the panels still open.
     */
    private restoreScrollBlock(closedConfig: KbqSidepanelConfig) {
        if (!closedConfig.hasBackdrop) return;

        const owner = [...this.openedSidepanels].reverse().find(({ config }) => config.hasBackdrop);

        owner?.overlayRef.updateScrollStrategy(this.resolveScrollStrategy(owner.config));
    }

    private closeSidepanels(sidepanels: KbqSidepanelRef[]) {
        // `reverse()` mutates, and this is called with the live stack.
        [...sidepanels].reverse().forEach((sidepanelRef: KbqSidepanelRef) => sidepanelRef.close());
    }

    private getOpenedSidepanelsWithSamePosition(config: KbqSidepanelConfig): KbqSidepanelRef[] {
        return this.openedSidepanels.filter((sidepanelRef) => sidepanelRef.config.position === config.position);
    }

    private updateAnimationState(sidepanelRef: KbqSidepanelRef) {
        const index = this.openedSidepanels.indexOf(sidepanelRef);

        // only allow animations if ref is last element in sidepanels list
        if (index === -1 || index !== this.openedSidepanels.length - 1) return;

        const [lower, bottom] = this.getLowerSidepanelsWithSamePosition(index);

        lower?.containerInstance.setAnimationState(KbqSidepanelAnimationState.BecomingNormal);
        bottom?.containerInstance.setAnimationState(KbqSidepanelAnimationState.Lower);
    }

    /**
     * Removes a sidepanel from the array of open sidepanels.
     * @param sidepanelRef Sidepanel to be removed.
     */
    private removeOpenSidepanel(sidepanelRef: KbqSidepanelRef) {
        const levelIndex = this.openedSidepanelsAtThisLevel.indexOf(sidepanelRef);

        if (levelIndex > -1) {
            this.openedSidepanelsAtThisLevel.splice(levelIndex, 1);
        }

        const index = this.openedSidepanels.indexOf(sidepanelRef);

        if (index > -1) {
            const [lower] = this.getLowerSidepanelsWithSamePosition(index);

            lower?.containerInstance.setAnimationState(KbqSidepanelAnimationState.Visible);

            this.openedSidepanels.splice(index, 1);
            this.updateIndents(sidepanelRef.config);
            this.restoreScrollBlock(sidepanelRef.config);
        }

        this.rootService.revealContentForAssistiveTechnology(sidepanelRef);
    }

    /**
     * The indent belongs to the stack, not to the panel that had one when it opened: closing a *lower*
     * sidepanel leaves the one above it exposing a strip of a panel that is no longer there.
     */
    private updateIndents(config: KbqSidepanelConfig) {
        this.getOpenedSidepanelsWithSamePosition(config).forEach((sidepanelRef, index) =>
            sidepanelRef.containerInstance.setWithIndent(index > 0)
        );
    }

    /**
     * A focus trap constrains Tab, not the virtual cursor, so everything outside the overlay stays
     * reachable to a screen reader while a modal sidepanel is open unless it is hidden explicitly.
     */
    private hideContentFromAssistiveTechnology(sidepanelRef: KbqSidepanelRef) {
        const firstModal = this.modalSidepanels.size === 0;

        this.modalSidepanels.add(sidepanelRef);

        if (!firstModal) return;

        const overlayContainerElement = this.overlayContainer.getContainerElement();
        const siblings = overlayContainerElement.parentElement?.children;

        if (!siblings) return;

        for (let i = siblings.length - 1; i > -1; i--) {
            const sibling = siblings[i];

            if (
                sibling === overlayContainerElement ||
                sibling.nodeName === 'SCRIPT' ||
                sibling.nodeName === 'STYLE' ||
                sibling.hasAttribute('aria-live')
            ) {
                continue;
            }

            this.ariaHiddenElements.set(sibling, sibling.getAttribute('aria-hidden'));
            sibling.setAttribute('aria-hidden', 'true');
        }
    }

    private revealContentForAssistiveTechnology(sidepanelRef: KbqSidepanelRef) {
        this.modalSidepanels.delete(sidepanelRef);

        if (this.modalSidepanels.size === 0) {
            this.restoreContentForAssistiveTechnology();
        }
    }

    private restoreContentForAssistiveTechnology() {
        this.ariaHiddenElements.forEach((previousValue, element) => {
            if (previousValue === null) {
                element.removeAttribute('aria-hidden');
            } else {
                element.setAttribute('aria-hidden', previousValue);
            }
        });

        this.ariaHiddenElements.clear();
        this.modalSidepanels.clear();
    }

    private getLowerSidepanelsWithSamePosition(index: number): KbqSidepanelRef[] {
        const openedSidepanelsWithSamePosition = this.getOpenedSidepanelsWithSamePosition(
            this.openedSidepanels[index].config
        );

        return [
            openedSidepanelsWithSamePosition[openedSidepanelsWithSamePosition.length - 2],
            openedSidepanelsWithSamePosition[openedSidepanelsWithSamePosition.length - 3]
        ];
    }
}
