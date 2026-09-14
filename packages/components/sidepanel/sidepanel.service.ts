import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, TemplatePortal } from '@angular/cdk/portal';
import {
    ComponentRef,
    Injectable,
    InjectionToken,
    Injector,
    OnDestroy,
    TemplateRef,
    inject,
    isDevMode
} from '@angular/core';
import { KBQ_STATE_STORE, KbqStateSavingRef, KbqStateSavingService, KbqStateStore } from '@koobiq/components/core';
import { KbqSidepanelAnimationState } from './sidepanel-animations';
import { KBQ_SIDEPANEL_DATA, KbqSidepanelConfig } from './sidepanel-config';
import { KBQ_SIDEPANEL_WITH_INDENT, KbqSidepanelContainerComponent } from './sidepanel-container.component';
import { KbqSidepanelRef } from './sidepanel-ref';

/** Injection token that can be used to specify default sidepanel options. */
export const KBQ_SIDEPANEL_DEFAULT_OPTIONS = new InjectionToken<KbqSidepanelConfig>('kbq-sidepanel-default-options');

/** The persisted state of a sidepanel — whether it was open. */
export interface KbqSidepanelState {
    opened: boolean;
}

/**
 * Coerces a raw persisted payload into a `KbqSidepanelState`, returning `null` for anything
 * unrecognizable.
 *
 * Web storage is origin-wide and user-writable, so a payload is never trusted — without this, a
 * hand-edited entry would decide whether a sidepanel opens.
 */
const normalizeSidepanelState = (parsed: unknown): KbqSidepanelState | null => {
    const opened = (parsed as Partial<KbqSidepanelState> | null)?.opened;

    return typeof opened === 'boolean' ? { opened } : null;
};

/**
 * What `KbqStateSavingService` reports for one persisted sidepanel key.
 *
 * The five components that persist register themselves, and a sidepanel has nothing to register: it is
 * closed exactly when its entry matters, and while open it lives in an overlay with no stable position
 * to be identified by. So the service stands in for it, and `host` stays `null`.
 */
class KbqSidepanelStateSavingRef implements KbqStateSavingRef {
    readonly name = 'kbq-sidepanel';
    readonly host = null;

    /** Persistence is opted into by supplying a `stateSavingKey`, so a tracked key is always enabled. */
    readonly enabled = true;

    state: unknown = null;

    constructor(
        readonly key: string,
        private readonly store: KbqStateStore
    ) {}

    clear(): void {
        this.store.removeState(this.key);
        this.state = null;
    }
}

@Injectable()
export class KbqSidepanelService implements OnDestroy {
    private overlay = inject(Overlay);
    private injector = inject(Injector);
    private defaultOptions = inject<KbqSidepanelConfig>(KBQ_SIDEPANEL_DEFAULT_OPTIONS, { optional: true });
    private parentSidepanelService = inject(KbqSidepanelService, { optional: true, skipSelf: true });
    private openedSidepanelsAtThisLevel: KbqSidepanelRef[] = [];

    private readonly stateStore = inject(KBQ_STATE_STORE);
    private readonly stateSavingService = inject(KbqStateSavingService);

    /**
     * One entry per `stateSavingKey` this service has seen, so `KbqStateSavingService` reports what is
     * stored as claimed. Without it a closed sidepanel's entry has nothing live behind it, and
     * `clearOrphans()` would sweep away exactly what the next visit is meant to restore.
     */
    private readonly stateSavingRefs = new Map<string, KbqSidepanelStateSavingRef>();

    private readonly bulkClosedAtThisLevel = new WeakSet<KbqSidepanelRef>();

    /** Keeps track of the currently-open sidepanels. */
    get openedSidepanels(): KbqSidepanelRef[] {
        return this.parentSidepanelService
            ? this.parentSidepanelService.openedSidepanels
            : this.openedSidepanelsAtThisLevel;
    }

    /**
     * The sidepanels being closed as a group rather than one at a time, whose close is not recorded.
     *
     * Shared up the chain like `openedSidepanels`: `closeAll()` reaches panels another instance opened,
     * and it is that instance's subscription that would record the close.
     */
    private get bulkClosed(): WeakSet<KbqSidepanelRef> {
        return this.parentSidepanelService ? this.parentSidepanelService.bulkClosed : this.bulkClosedAtThisLevel;
    }

    ngOnDestroy() {
        // Only close the sidepanels at this level on destroy
        // since the parent service may still be active.
        this.closeSidepanels(this.openedSidepanelsAtThisLevel);

        this.stateSavingRefs.forEach((ref) => this.stateSavingService.unregister(ref));
        this.stateSavingRefs.clear();
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

        if (isDevMode() && fullConfig.stateSavingKey && this.isStateSavingKeyInUse(fullConfig.stateSavingKey)) {
            // eslint-disable-next-line no-console
            console.warn(
                `kbq-sidepanel: another open sidepanel already persists under the state saving key ` +
                    `"${fullConfig.stateSavingKey}". They share one entry, so closing either records the ` +
                    'panel as closed. Give each one its own key.'
            );
        }

        const overlayRef = this.createOverlay(fullConfig);

        overlayRef.hostElement.classList.add('kbq-sidepanel-overlay');
        const container = this.attachContainer(overlayRef, fullConfig);
        const ref = new KbqSidepanelRef(container, overlayRef, fullConfig);

        if (componentOrTemplateRef instanceof TemplateRef) {
            container.attachTemplatePortal(
                new TemplatePortal<T>(
                    componentOrTemplateRef,
                    null!,
                    {
                        $implicit: fullConfig.data,
                        sidepanelRef: ref
                    } as any,
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
        ref.beforeClosed().subscribe(() => this.updateAnimationState(ref));
        ref.afterClosed().subscribe(() => {
            this.removeOpenSidepanel(ref);

            // A group close is the owner going away rather than a decision to close this panel, and
            // keeping the flag is what lets the next visit bring the panel back.
            if (!this.bulkClosed.has(ref)) {
                this.writeState(fullConfig.stateSavingKey, false);
            }
        });

        this.writeState(fullConfig.stateSavingKey, true);

        container.enter();

        return ref;
    }

    /**
     * Closes all of the currently-open sidepanels.
     *
     * Closing as a group is not recorded — see `wasOpen()`.
     */
    closeAll(): void {
        this.closeSidepanels(this.openedSidepanels);
    }

    /**
     * Whether the sidepanel persisted under `key` was open when it was last recorded, so the
     * application can open it again:
     *
     * ```ts
     * if (sidepanel.wasOpen('filters')) this.openFilters();
     * ```
     *
     * A sidepanel cannot restore itself the way the components that persist do. It exists only while it
     * is open, so at the point the state would be read there is nothing left to read it — and what to
     * reopen is a component class or a `TemplateRef` and its `data`, none of which survives being
     * written to storage. This service keeps the flag; the application keeps the rest.
     *
     * What is recorded is a sidepanel opened and closed on its own. Closing a group — `closeAll()`, or
     * this service being destroyed — leaves the flag alone, so a panel that was open when the page went
     * away comes back whether the page was reloaded or navigated away from.
     *
     * Reading claims the key: from here on `KbqStateSavingService` reports the entry as this service's
     * rather than orphaned. It has to happen on read, because for a sidepanel that is not open this is
     * the only call there is.
     */
    wasOpen(key: string): boolean {
        if (!key || !this.stateSavingService.isEnabled()) return false;

        const state = normalizeSidepanelState(this.stateStore.getState(key));

        this.trackState(key, state);

        return state?.opened ?? false;
    }

    /**
     * Removes what is persisted under `key`.
     *
     * Persistence itself stays on: a sidepanel opened under that key again is recorded again.
     */
    clearSavedState(key: string): void {
        if (!key) return;

        this.stateStore.removeState(key);
        this.stateSavingRefs.get(key)?.clear();
        this.stateSavingService.notify();
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
            scrollStrategy: this.overlay.scrollStrategies.block(),
            positionStrategy: this.overlay.position().global()
        });

        return this.overlay.create(overlayConfig);
    }

    private closeSidepanels(sidepanels: KbqSidepanelRef[]) {
        const reversedOpenedSidepanels = [...sidepanels.reverse()];

        reversedOpenedSidepanels.forEach((sidepanelRef: KbqSidepanelRef) => {
            // Marked before closing rather than around the loop: `afterClosed()` only fires once the exit
            // animation is done, by which time a flag held for the duration of this call would be gone.
            this.bulkClosed.add(sidepanelRef);

            sidepanelRef.close();
        });
    }

    /** Whether an already-open sidepanel persists under this key. */
    private isStateSavingKeyInUse(key: string): boolean {
        return this.openedSidepanels.some((ref) => ref.config.stateSavingKey === key);
    }

    /** Records whether the sidepanel persisting under `key` is open. A sidepanel without a key is not. */
    private writeState(key: string | undefined, opened: boolean): void {
        if (!key || !this.stateSavingService.isEnabled()) return;

        const state: KbqSidepanelState = { opened };

        this.stateStore.setState(key, state);
        this.trackState(key, state);

        // The write does not go through `KbqStateSavingService`, so it would otherwise go unreported.
        this.stateSavingService.notify();
    }

    /** Reports the key to `KbqStateSavingService`, registering it the first time it is seen. */
    private trackState(key: string, state: KbqSidepanelState | null): void {
        let ref = this.stateSavingRefs.get(key);

        if (!ref) {
            ref = new KbqSidepanelStateSavingRef(key, this.stateStore);

            this.stateSavingRefs.set(key, ref);
            this.stateSavingService.register(ref);
        }

        ref.state = state;
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
        const index = this.openedSidepanels.indexOf(sidepanelRef);

        if (index > -1) {
            const [lower] = this.getLowerSidepanelsWithSamePosition(index);

            lower?.containerInstance.setAnimationState(KbqSidepanelAnimationState.Visible);

            this.openedSidepanels.splice(index, 1);
        }
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
